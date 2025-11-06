import { useState, useCallback } from "react";

interface UseNumericInputOptions {
  initialValue?: string | number;
  min?: number;
  max?: number;
  precision?: number; // Nombre de décimales
  allowNegative?: boolean;
  onChange?: (value: number | null) => void;
}

export function useNumericInput({
  initialValue = "",
  min,
  max,
  precision = 0,
  allowNegative = false,
  onChange,
}: UseNumericInputOptions = {}) {
  // Conversion de la valeur initiale en string pour l'input
  const initialString =
    initialValue === null || initialValue === undefined
      ? ""
      : String(initialValue);

  const [inputValue, setInputValue] = useState(initialString);
  const [error, setError] = useState<string | null>(null);

  // Vérifie si la valeur est valide
  const validate = useCallback(
    (value: string): boolean => {
      // Permet les champs vides
      if (value === "") {
        setError(null);
        return true;
      }

      // Utiliser un regex pour valider le format numérique
      const regex =
        precision > 0
          ? new RegExp(
              `^${allowNegative ? "-?" : ""}\\d*(\\.\\d{0,${precision}})?$`
            )
          : new RegExp(`^${allowNegative ? "-?" : ""}\\d*$`);

      if (!regex.test(value)) {
        setError(`Format numérique invalide`);
        return false;
      }

      const numValue = parseFloat(value);

      // Validation du min/max
      if (min !== undefined && numValue < min) {
        setError(`La valeur doit être supérieure ou égale à ${min}`);
        return false;
      }

      if (max !== undefined && numValue > max) {
        setError(`La valeur doit être inférieure ou égale à ${max}`);
        return false;
      }

      setError(null);
      return true;
    },
    [min, max, precision, allowNegative]
  );

  // Gère le changement de valeur
  const handleChange = useCallback(
    (text: string) => {
      // Pour les champs vides, autorise toujours
      if (text === "") {
        setInputValue("");
        onChange?.(null);
        setError(null);
        return;
      }

      // N'accepte que les formats numériques valides
      const regex =
        precision > 0
          ? new RegExp(
              `^${allowNegative ? "-?" : ""}\\d*(\\.\\d{0,${precision}})?$`
            )
          : new RegExp(`^${allowNegative ? "-?" : ""}\\d*$`);

      if (regex.test(text)) {
        setInputValue(text);

        // Conversion en nombre pour le callback onChange
        if (text === "" || text === "-") {
          onChange?.(null);
        } else {
          const numValue = parseFloat(text);
          onChange?.(numValue);
        }

        // Validation après le changement
        validate(text);
      }
    },
    [precision, allowNegative, onChange, validate]
  );

  // Formatage de la valeur pour l'affichage
  const formattedValue = useCallback(
    (value: number | null): string => {
      if (value === null) return "";
      return precision > 0
        ? value.toFixed(precision)
        : String(Math.round(value));
    },
    [precision]
  );

  return {
    value: inputValue,
    numericValue: inputValue === "" ? null : parseFloat(inputValue),
    error,
    handleChange,
    formattedValue,
    validate,
    // Helper pour les props React Native TextInput
    inputProps: {
      value: inputValue,
      onChangeText: handleChange,
      keyboardType: "numeric",
    },
  };
}
