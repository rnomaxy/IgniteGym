import { useState } from "react";
import { ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Center, VStack, Text, Heading, useToast, ToastTitle, Toast } from "@gluestack-ui/themed";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import * as yup from "yup";

import { useAuth } from "@hooks/useAuth";

import { ScreeenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { ToastMessage } from "@components/ToastMessage";

type FormDataProps = {
    name: string;
    email?: string;
    password?: string;
    old_password?: string;
    confirm_password?: string;
}

const profileSchema = yup.object({
    name: yup
        .string()
        .required('Informe o nome.'),
    password: yup.
        string().
        min(6, 'A senha deve ter pelo menos 6 dígitos')
        .nullable()
        .transform((value) => !!value ? value : null),
    confirm_password: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) =>
                schema
                    .nullable()
                    .required('Informe a confirmação da senha.')
                    .transform((value) => !!value ? value : null),
        }),
});

export function Profile() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [userPhoto, setUserPhoto] = useState("https://github.com/rnomaxy.png")

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();
    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    });

    async function handleUserPhotoSelect() {
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true
            })

            if (photoSelected.canceled) {
                return
            }

            const photoURI = photoSelected.assets[0].uri

            if (photoURI) {
                const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as {
                    size: number
                }

                if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 1) {
                    return toast.show({
                        placement: "top",
                        render: ({ id }) => (
                            <ToastMessage
                                id={id}
                                action="error"
                                title="Essa imagem é muito grande. Escolha uma de ate 5MB"
                                onClose={() => toast.close(id)}
                            />
                        )
                    })
                }

                setUserPhoto(photoURI)
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setIsUpdate(true)

            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put('/users', data)

            await updateUserProfile(userUpdated);

            toast.show({
                placement: "top",
                render: () => (
                    <Toast backgroundColor='$green500' action="success" variant="outline">
                        <ToastTitle color="$white">Perfil atualizado com sucesso!</ToastTitle>
                    </Toast>
                ),
            });
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possível atualizar os dados. Tente novamente mais tarde."
            toast.show({
                placement: "top",
                render: () => (
                    <Toast backgroundColor='$red500' action="error" variant="outline">
                        <ToastTitle color="$white">{title}</ToastTitle>
                    </Toast>
                ),
            });
        } finally {
            setIsUpdate(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <VStack flex={1}>
                    <ScreeenHeader title="Perfil" />

                    <ScrollView contentContainerStyle={{ paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
                        <Center mt="$6" px="$10">
                            <UserPhoto
                                source={{ uri: userPhoto }}
                                size="xl"
                                alt="Imagem do usuário"
                            />
                            <TouchableOpacity onPress={handleUserPhotoSelect}>
                                <Text
                                    color="$green500"
                                    fontFamily="$heading"
                                    fontSize="$md"
                                    mt="$2"
                                    mb="$8"
                                >
                                    Alterar foto
                                </Text>
                            </TouchableOpacity>

                            <Center w="$full" gap="$4">
                                <Controller
                                    control={control}
                                    name='name'
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            placeholder="Nome"
                                            bg="$gray600"
                                            onChangeText={onChange}
                                            value={value}
                                            errorMessage={errors.name?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='email'
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            placeholder="E-mail"
                                            bg="$gray600"
                                            isReadOnly
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    )}
                                />

                            </Center>

                            <Heading
                                alignSelf="flex-start"
                                fontFamily="$heading"
                                color="$gray200"
                                fontSize="$md"
                                mt="$12"
                                mb="$2"
                            >
                                Alterar senha
                            </Heading>

                            <Center w="$full" gap="$4">

                                <Controller
                                    control={control}
                                    name='old_password'
                                    render={({ field: { onChange } }) => (
                                        <Input
                                            placeholder="Senha antiga"
                                            bg="$gray600"
                                            secureTextEntry
                                            onChangeText={onChange}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='password'
                                    render={({ field: { onChange } }) => (
                                        <Input
                                            placeholder="Nova senha"
                                            bg="$gray600"
                                            secureTextEntry
                                            onChangeText={onChange}
                                            errorMessage={errors.password?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='confirm_password'
                                    render={({ field: { onChange } }) => (
                                        <Input
                                            placeholder="Confirme a nova senha"
                                            bg="$gray600"
                                            secureTextEntry
                                            onChangeText={onChange}
                                            errorMessage={errors.confirm_password?.message}
                                        />
                                    )}
                                />

                                <Button
                                    title="Atualizar"
                                    onPress={handleSubmit(handleProfileUpdate)}
                                    isLoading={isUpdate}
                                />
                            </Center>
                        </Center>
                    </ScrollView>
                </VStack>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}