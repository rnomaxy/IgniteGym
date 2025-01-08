import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SectionList } from "react-native";
import { Heading, VStack, Text, Toast, ToastTitle, useToast } from "@gluestack-ui/themed";

import { AppError } from "@utils/AppError";

import { api } from "@services/api";
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";

import { ScreeenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";
import { Loading } from "@components/Loading";

export function History() {
    const [isLoading, setIsLoading] = useState(true);
    const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

    const toast = useToast();

    async function fetchHistory() {
        try {
            setIsLoading(true);

            const response = await api.get('/history')
            setExercises(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possivel carregar o histórico."

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
    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []))

    return (
        <VStack flex={1}>
            <ScreeenHeader title="Histórico de Exercícios" />
            {isLoading ? <Loading /> :
                <SectionList
                    sections={exercises}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <HistoryCard data={item} />
                    )}
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
            }
        </VStack>
    );
}