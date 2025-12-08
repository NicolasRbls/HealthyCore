import React, { useState, useEffect } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "../../hooks/useForm";
import AuthService from "../../services/auth.service";

export default function ResetPasswordScreen() {
    const { token } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            Alert.alert("Erreur", "Lien invalide ou manquant.");
            router.replace("/auth/login");
        }
    }, [token]);

    const {
        values,
        handleChange,
        handleSubmit,
        errors,
        touched,
        handleBlur,
    } = useForm({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validate: (values) => {
            const errors: { password?: string; confirmPassword?: string } = {};

            if (!values.password) {
                errors.password = "Le mot de passe est requis";
            } else if (values.password.length < 8) {
                errors.password = "Le mot de passe doit faire au moins 8 caractères";
            }

            if (values.password !== values.confirmPassword) {
                errors.confirmPassword = "Les mots de passe ne correspondent pas";
            }

            return errors;
        },
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await AuthService.resetPassword(token as string, values.password);
                Alert.alert(
                    "Succès",
                    "Mot de passe modifié avec succès.",
                    [{ text: "Se connecter", onPress: () => router.replace("/auth/login") }]
                );
            } catch (error: any) {
                Alert.alert("Erreur", error.response?.data?.message || "Le lien a expiré ou est invalide.");
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header
                title="Nouveau mot de passe"
                showBackButton={false}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.description}>
                    Choisissez un nouveau mot de passe sécurisé.
                </Text>

                <Input
                    label="Nouveau mot de passe"
                    icon="lock-closed-outline"
                    value={values.password}
                    onChangeText={(text) => handleChange("password", text)}
                    onBlur={() => handleBlur("password")}
                    error={touched.password ? errors.password : undefined}
                    touched={touched.password}
                    isPassword={true}
                    showPassword={showPassword}
                    togglePasswordVisibility={() => setShowPassword(!showPassword)}
                    placeholder="Minimum 8 caractères"
                />

                <Input
                    label="Confirmer le mot de passe"
                    icon="lock-closed-outline"
                    value={values.confirmPassword}
                    onChangeText={(text) => handleChange("confirmPassword", text)}
                    onBlur={() => handleBlur("confirmPassword")}
                    error={touched.confirmPassword ? errors.confirmPassword : undefined}
                    touched={touched.confirmPassword}
                    isPassword={true}
                    showPassword={showPassword}
                    togglePasswordVisibility={() => setShowPassword(!showPassword)}
                    placeholder="Répétez le mot de passe"
                />

                <Button
                    text="Valider"
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.button}
                    fullWidth
                />
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
});
