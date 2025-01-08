import { useState, useEffect, useCallback } from "react";
import { FlatList } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Heading, HStack, VStack, Text, Toast, useToast, ToastTitle } from "@gluestack-ui/themed";

import { api } from "@services/api";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { ExerciseDTO } from "@dtos/ExerciseDTO";

import { AppError } from "@utils/AppError";

import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { ExerciseCard } from "@components/ExerciseCard";
import { Loading } from "@components/Loading";

export function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [exercise, setExercise] = useState<ExerciseDTO[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [groupSelected, setGroupSelected] = useState("Antebraço");

    const toast = useToast();
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    function handleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate("exercise", { exerciseId });
    }
    async function fetchGroups() {
        try {
            setIsLoading(true);
            const groupsResponse = await api.get('/groups');
            setGroups(groupsResponse.data);

            if (groupsResponse.data.length > 0) {
                setGroupSelected(groupsResponse.data[0]);
            }
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os grupos musculares.";

            toast.show({
                placement: "top",
                render: () => (
                    <Toast backgroundColor='$red500' action="error" variant="outline">
                        <ToastTitle color="$white">{title}</ToastTitle>
                    </Toast>
                ),
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchExercisesByGroup(group: string) {
        if (!group) return;

        try {
            setIsLoading(true);
            const exercisesResponse = await api.get(`/exercises/bygroup/${group}`);
            setExercise(exercisesResponse.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os exercícios.";

            toast.show({
                placement: "top",
                render: () => (
                    <Toast backgroundColor='$red500' action="error" variant="outline">
                        <ToastTitle color="$white">{title}</ToastTitle>
                    </Toast>
                ),
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchGroups();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchExercisesByGroup(groupSelected)
        }, [groupSelected])
    )

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={groupSelected.toLowerCase() === item.toLowerCase()}
                        onPress={() => setGroupSelected(item)} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 32 }}
                style={{ marginVertical: 44, maxHeight: 44, minHeight: 44 }}
            />
            {
                isLoading ? <Loading /> :
                    <VStack px="$8" flex={1}>
                        <HStack justifyContent="space-between" mb="$5" alignItems="center">
                            <Heading color="$gray200" fontSize="$md" fontFamily="heading">
                                Exercicios
                            </Heading>

                            <Text color="$gray200" fontSize="$sm" fontFamily="body">{exercise.length}</Text>
                        </HStack>

                        <FlatList
                            data={exercise}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ExerciseCard
                                    onPress={() => handleOpenExerciseDetails(item.id)}
                                    data={item}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </VStack>
            }
        </VStack>
    );
}