import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import signalementService, { SignalementType } from "../../../services/signalement.service";

export default function ReportScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { id, name } = params;

    const [types, setTypes] = useState<SignalementType[]>([]);
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        try {
            const data = await signalementService.getTypes();
            setTypes(data);
        } catch (error) {
            console.error("Error loading types:", error);
            Alert.alert("Erreur", "Impossible de charger les types de signalement");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedType) {
            Alert.alert("Erreur", "Veuillez sélectionner un type de signalement");
            return;
        }

        try {
            setSubmitting(true);
            await signalementService.create({
                id_signalement: selectedType,
                id_aliment: Number(id),
                description: description,
            });
            Alert.alert("Succès", "Votre signalement a été envoyé", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("Error submitting report:", error);
            Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi du signalement");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Signaler un problème",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color={Colors.black} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Signaler : {name}</Text>
                <Text style={styles.subtitle}>
                    Pourquoi souhaitez-vous signaler cet aliment ?
                </Text>

                <View style={styles.typesContainer}>
                    {types.map((type) => (
                        <TouchableOpacity
                            key={type.id_signalement}
                            style={[
                                styles.typeButton,
                                selectedType === type.id_signalement && styles.selectedType,
                            ]}
                            onPress={() => setSelectedType(type.id_signalement)}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    selectedType === type.id_signalement && styles.selectedTypeText,
                                ]}
                            >
                                {type.titre}
                            </Text>
                            {selectedType === type.id_signalement && (
                                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Description (optionnel)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Détaillez le problème..."
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Envoyer le signalement</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: "Poppins-Bold",
        color: Colors.black,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: Colors.gray.medium,
        marginBottom: 20,
    },
    typesContainer: {
        marginBottom: 20,
    },
    typeButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 12,
        backgroundColor: Colors.white,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.gray.light,
    },
    selectedType: {
        backgroundColor: Colors.brandBlue[0],
        borderColor: Colors.brandBlue[0],
    },
    typeText: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: Colors.black,
    },
    selectedTypeText: {
        color: Colors.white,
    },
    label: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: Colors.black,
        marginBottom: 10,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 15,
        height: 120,
        borderWidth: 1,
        borderColor: Colors.gray.light,
        marginBottom: 30,
        fontFamily: "Poppins-Regular",
    },
    submitButton: {
        backgroundColor: Colors.brandBlue[0],
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: "Poppins-Bold",
    },
});
