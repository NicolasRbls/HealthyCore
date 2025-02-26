import { useState, useCallback } from "react";
import { Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface UseDatePickerOptions {
  initialDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (date: Date | null) => void;
  format?: (date: Date) => string;
}

export function useDatePicker({
  initialDate = null,
  minDate,
  maxDate,
  onChange,
  format = (date) => date.toISOString().split("T")[0], // Format par défaut: YYYY-MM-DD
}: UseDatePickerOptions = {}) {
  const [date, setDate] = useState<Date | null>(initialDate);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valide la date
  const validate = useCallback(
    (selectedDate: Date | null): boolean => {
      if (!selectedDate) {
        setError(null);
        return true;
      }

      if (minDate && selectedDate < minDate) {
        setError(`La date doit être après ${format(minDate)}`);
        return false;
      }

      if (maxDate && selectedDate > maxDate) {
        setError(`La date doit être avant ${format(maxDate)}`);
        return false;
      }

      setError(null);
      return true;
    },
    [minDate, maxDate, format]
  );

  // Gère le changement de date
  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      const currentDate = selectedDate || date;

      // Cache le picker sur iOS
      if (Platform.OS === "ios") {
        setShow(false);
      }

      if (currentDate) {
        setDate(currentDate);
        validate(currentDate);
        onChange?.(currentDate);
      }
    },
    [date, onChange, validate]
  );

  // Ouvre le sélecteur de date
  const showDatePicker = useCallback(() => {
    setShow(true);
  }, []);

  // Ferme le sélecteur de date (utile pour iOS)
  const hideDatePicker = useCallback(() => {
    setShow(false);
  }, []);

  // Formate la date pour l'affichage
  const formattedDate = useCallback(
    (selectedDate: Date | null): string => {
      if (!selectedDate) return "";
      return format(selectedDate);
    },
    [format]
  );

  return {
    date,
    show,
    error,
    showDatePicker,
    hideDatePicker,
    handleChange,
    formattedDate,
    validate,
    // Le composant DateTimePicker
    DatePickerComponent: show && (
      <DateTimePicker
        value={date || new Date()}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={handleChange}
        minimumDate={minDate}
        maximumDate={maxDate}
      />
    ),
  };
}
