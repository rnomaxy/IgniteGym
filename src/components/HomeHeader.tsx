import { Heading, HStack, Text, VStack, Icon } from "@gluestack-ui/themed";
import { LogOut } from "lucide-react-native";

import { UserPhoto } from "./UserPhoto";
import { useAuth } from "@hooks/useAuth";

import defaultUserPhotoImg from "@assets/userPhotoDefault.png"
import { TouchableOpacity } from "react-native";

export function HomeHeader() {
    const { user, signOut } = useAuth();

    return (
        <HStack gap="$4" bg="$gray600" pt="$16" pb="$5" px="$8" alignItems="center">
            <UserPhoto
                w="$16"
                h="$16"
                source={user.avatar ? { uri: user.avatar } : defaultUserPhotoImg}
                alt="Imagem do usuário" />

            <VStack flex={1}>
                <Text color="$gray100" fontSize="$md">Olá,</Text>
                <Heading color="$gray100" fontSize="$md"> {user.name}</Heading>
            </VStack>

            <TouchableOpacity onPress={signOut}>
                <Icon as={LogOut} color="$gray200" size="xl" />
            </TouchableOpacity>

        </HStack>
    );
}