import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import Colors from "@/constants/Colors";

interface WeightInputProps {
  currentWeight: string;
  targetWeight: string;
  onChangeTargetWeight: (text: string) => void;
  estimatedWeeks?: number;
  weeklyChange?: number;
  isValid?: boolean;
}

const WeightInput: React.FC<WeightInputProps> = ({
  currentWeight,
  targetWeight,
  onChangeTargetWeight,
  estimatedWeeks,
  weeklyChange,
  isValid = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.weightText}>{currentWeight}</Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
        <View style={styles.targetInputContainer}>
          <TextInput
            style={styles.targetInput}
            value={targetWeight}
            onChangeText={onChangeTargetWeight}
            keyboardType="numeric"
            placeholder="00"
            maxLength={3}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
      </View>

      {estimatedWeeks !== undefined && weeklyChange !== undefined && (
        <View style={styles.estimationContainer}>
          <Text
            style={[
              styles.estimationText,
              !isValid && styles.invalidEstimation,
            ]}
          >
            {estimatedWeeks} semaines ({weeklyChange} kg par semaine)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  weightText: {
    fontSize: 32,
    color: Colors.gray.light,
    fontWeight: "600",
  },
  arrowContainer: {
    marginHorizontal: 16,
  },
  arrow: {
    fontSize: 32,
    color: Colors.brandBlue[0],
  },
  targetInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  targetInput: {
    fontSize: 32,
    color: Colors.black,
    fontWeight: "600",
    borderBottomWidth: 2,
    borderBottomColor: Colors.brandBlue[0],
    paddingBottom: 4,
    minWidth: 60,
    textAlign: "center",
  },
  unit: {
    fontSize: 20,
    color: Colors.black,
    marginLeft: 4,
    marginBottom: 6,
  },
  estimationContainer: {
    marginTop: 8,
  },
  estimationText: {
    fontSize: 16,
    color: Colors.brandBlue[0],
  },
  invalidEstimation: {
    color: "red",
  },
});

export default WeightInput;
