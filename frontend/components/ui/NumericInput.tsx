import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import Input, { InputProps } from "./Input";
import { useNumericInput } from "../../hooks/useNumericInput";

interface NumericInputProps
  extends Omit<InputProps, "onChangeText" | "value" | "keyboardType"> {
  value?: string | number;
  onChangeText?: (value: string) => void;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowNegative?: boolean;
  showControls?: boolean;
  style?: ViewStyle;
  decrementStyle?: ViewStyle;
  incrementStyle?: ViewStyle;
  controlsContainerStyle?: ViewStyle;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value: externalValue,
  onChangeText: externalOnChangeText,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  allowNegative = false,
  showControls = false,
  style,
  decrementStyle,
  incrementStyle,
  controlsContainerStyle,
  error: externalError,
  ...props
}) => {
  // Utilisation du hook useNumericInput
  const {
    value,
    error: hookError,
    handleChange,
    numericValue,
  } = useNumericInput({
    initialValue: externalValue || "",
    min,
    max,
    precision,
    allowNegative,
    onChange,
  });

  // Combinaison de l'erreur externe et de l'erreur du hook
  const error = externalError || hookError;

  // Fonctions pour incrémenter/décrémenter
  const handleIncrement = () => {
    const currentValue = numericValue || 0;
    const newValue = Math.min(
      currentValue + step,
      max === undefined ? Infinity : max
    );
    const formatted =
      precision > 0 ? newValue.toFixed(precision) : String(newValue);

    handleChange(formatted);
    externalOnChangeText && externalOnChangeText(formatted);
  };

  const handleDecrement = () => {
    const currentValue = numericValue || 0;
    const newValue = Math.max(
      currentValue - step,
      min === undefined ? (allowNegative ? -Infinity : 0) : min
    );
    const formatted =
      precision > 0 ? newValue.toFixed(precision) : String(newValue);

    handleChange(formatted);
    externalOnChangeText && externalOnChangeText(formatted);
  };

  // Utilisation du changement interne ou externe
  const onChangeTextHandler = (text: string) => {
    handleChange(text);
    externalOnChangeText && externalOnChangeText(text);
  };

  return (
    <View style={[styles.container, style]}>
      <Input
        {...props}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeTextHandler}
        error={error}
      />

      {showControls && (
        <View style={[styles.controlsContainer, controlsContainerStyle]}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.decrementButton,
              decrementStyle,
            ]}
            onPress={handleDecrement}
            disabled={
              numericValue === min || (numericValue === 0 && !allowNegative)
            }
          >
            <Ionicons name="remove" size={20} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.incrementButton,
              incrementStyle,
            ]}
            onPress={handleIncrement}
            disabled={numericValue === max}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    marginLeft: Layout.spacing.sm,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  decrementButton: {
    backgroundColor: Colors.brandBlue[0],
  },
  incrementButton: {
    backgroundColor: Colors.brandBlue[0],
  },
});

export default NumericInput;
