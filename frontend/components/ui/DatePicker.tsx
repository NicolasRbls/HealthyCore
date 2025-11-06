import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import Input, { InputProps } from "./Input";
import { useDatePicker } from "../../hooks/useDatePicker";

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: (date: Date) => string;
  mode?: "date" | "time" | "datetime";
  display?: "default" | "spinner" | "calendar" | "clock";
  containerStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  placeholderText?: string;
  // Ajoute les props de Input que tu utilises
  error?: string;
  label?: string;
  placeholder?: string;
  icon?: string;
  editable?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  onInputPress?: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value: externalValue,
  onChange,
  minDate,
  maxDate,
  format = (date) => date.toISOString().split("T")[0],
  mode = "date",
  display = Platform.OS === "ios" ? "spinner" : "default",
  containerStyle,
  buttonTextStyle,
  placeholderText = "Sélectionner une date",
  error: externalError,
  ...props
}) => {
  // Utilisation du hook useDatePicker
  const {
    date,
    show,
    error: hookError,
    showDatePicker,
    hideDatePicker,
    handleChange,
    formattedDate,
    DatePickerComponent,
  } = useDatePicker({
    initialDate: externalValue,
    minDate,
    maxDate,
    onChange,
    format,
  });

  // Combinaison de l'erreur externe et de l'erreur du hook
  const error = externalError || hookError;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={showDatePicker}
        activeOpacity={0.8}
        style={styles.fullWidth}
      >
        <Input
          {...props}
          value={formattedDate(date)}
          editable={false}
          placeholder={placeholderText}
          onInputPress={showDatePicker}
          rightIcon="calendar-outline"
          onRightIconPress={showDatePicker}
          error={error || undefined}
        />
      </TouchableOpacity>

      {show && (
        <>
          {DatePickerComponent}

          {Platform.OS === "ios" && (
            <View style={styles.iosButtonContainer}>
              <TouchableOpacity onPress={hideDatePicker}>
                <Text style={[styles.iosButtonText, buttonTextStyle]}>
                  Fermer
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  iosButtonContainer: {
    backgroundColor: Colors.gray.ultraLight,
    alignItems: "center",
    padding: Layout.spacing.md,
    borderBottomLeftRadius: Layout.borderRadius.md,
    borderBottomRightRadius: Layout.borderRadius.md,
  },
  iosButtonText: {
    color: Colors.brandBlue[0],
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DatePicker;
