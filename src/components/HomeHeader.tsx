import { Heading, HStack, Text, VStack, Icon } from "@gluestack-ui/themed";
import { LogOut } from "lucide-react-native";

import { UserPhoto } from "./UserPhoto";

export function HomeHeader() {
    return (
        <HStack gap="$4" bg="$gray600" pt="$16" pb="$5" px="$8" alignItems="center">
            <UserPhoto
                w="$16"
                h="$16"
                source={{ uri: "https://github.com/rnomaxy.png" }}
                alt="Imagem do usuário" />

            <VStack flex={1}>
                <Text color="$gray100" fontSize="$md">Olá,</Text>
                <Heading color="$gray100" fontSize="$md"> Mariana Novaes</Heading>
            </VStack>

            <Icon as={LogOut} color="$gray200" size="xl" />
        </HStack>
    );
}