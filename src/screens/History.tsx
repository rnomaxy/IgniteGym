import { useState } from "react";
import { SectionList } from "react-native";
import { Heading, VStack, Text } from "@gluestack-ui/themed";

import { ScreeenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";

export function History() {
    const [exercises, setExercises] = useState([
        {
            title: "22.11.2024",
            data: ["Puxada frontal", "Remada unilateral"]
        },
        {
            title: "23.11.2024",
            data: ["Puxada frontal"]
        }
    ]);

    return (
        <VStack flex={1}>
            <ScreeenHeader title="Histórico de Exercícios" />
            <SectionList
                sections={exercises}
                keyExtractor={item => item}
                renderItem={() => <HistoryCard />}
                renderSectionHeader={({ section }) => (
                    <Heading
                        color="$gray200"
                        fontSize="$md"
                        mt="$10"
                        mb="$3"
                        fontFamily="$heading"
                    >
                        {section.title}
                    </Heading>
                )}
                style={{ paddingHorizontal: 32 }}
                contentContainerStyle={
                    exercises.length === 0 && { flex: 1, justifyContent: 'center' }
                }
                ListEmptyComponent={() => (
                    <Text color="$gray100" textAlign="center">
                        Não á exercícios registrados ainda.{"\n"}
                        Vamos fazer exercícios hoje?
                    </Text>
                )}
                showsVerticalScrollIndicator={false}
            />
        </VStack>
    );
}