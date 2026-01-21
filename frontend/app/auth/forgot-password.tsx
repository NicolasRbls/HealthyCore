import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Header from "../../components/layout/Header";
import { router } from "expo-router";
import { useForm } from "../../hooks/useForm";
import AuthService from "../../services/auth.service";

export default function ForgotPasswordScreen() {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        values,
        handleChange,
        handleSubmit,
        errors,
        touched,
        handleBlur,
    } = useForm({
        initialValues: {
            email: "",
        },
        validate: (values) => {
            const errors: { email?: string } = {};
            if (!values.email) {
                errors.email = "L'email est requis";
            } else if (!/\S+@\S+\.\S+/.test(values.email)) {
                errors.email = "Email invalide";
            }
            return errors;
        },
        onSubmit: async (values) => {
            setLoading(true);
            setSuccessMessage(null);
            try {
                await AuthService.forgotPassword(values.email);
                setSuccessMessage(
                    "Si un compte existe, un email a été envoyé avec les instructions."
                );
            } catch (error) {
                Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header
                title="Mot de passe oublié"
                showBackButton
                onBackPress={() => router.back()}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.description}>
                    Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </Text>

                {successMessage ? (
                    <View style={styles.successContainer}>
                        <Text style={styles.successText}>{successMessage}</Text>
                        <Button
                            text="Retour à la connexion"
                            onPress={() => router.back()}
                            style={styles.button}
                            fullWidth
                        />
                    </View>
                ) : (
                    <View>
                        <Input
                            label="Email"
                            icon="mail-outline"
                            value={values.email}
                            onChangeText={(text) => handleChange("email", text)}
                            onBlur={() => handleBlur("email")}
                            error={touched.email ? errors.email : undefined}
                            touched={touched.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="votre@email.com"
                        />

                        <Button
                            text="Envoyer le lien"
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.button}
                            fullWidth
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    container: {
        padding: Layout.spacing.lg,
    },
    description: {
        ...TextStyles.body,
        marginBottom: Layout.spacing.xl,
        color: Colors.gray.medium,
    },
    button: {
        marginTop: Layout.spacing.lg,
    },
    successContainer: {
        backgroundColor: Colors.secondary[0],
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.md,
        alignItems: "center",
    },
    successText: {
        ...TextStyles.body,
        color: Colors.white,
        textAlign: "center",
        marginBottom: Layout.spacing.md,
    },
});
