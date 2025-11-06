import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import { TextStyles } from "../../constants/Fonts";
import Layout from "../../constants/Layout";

interface ErrorMessageProps {
  errors?: (string | null | undefined)[];
  style?: any;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errors, style }) => {
  // Filtrer les erreurs valides (non null, non undefined, non vides)
  const validErrors =
    errors?.filter((error) => error && error.trim() !== "") || [];

  if (validErrors.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {validErrors.map((error, index) => (
        <Text
          key={index}
          style={[
            styles.errorText,
            index < validErrors.length - 1
              ? { marginBottom: Layout.spacing.xs }
              : {},
          ]}
        >
          {error}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.sm,
    backgroundColor: `${Colors.error}15`, // Couleur d'erreur avec opacité
    borderRadius: Layout.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    ...TextStyles.bodySmall,
    color: Colors.error,
    marginBottom: Layout.spacing.xs, // Correction : Supprimer la fonction ici
  },
});

export default ErrorMessage;
