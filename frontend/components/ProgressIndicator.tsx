import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < currentStep
              ? styles.completedDot
              : index === currentStep
              ? styles.activeDot
              : styles.inactiveDot,
            index === steps - 1 ? {} : styles.dotWithLine,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gray.light,
  },
  activeDot: {
    backgroundColor: Colors.brandBlue[0],
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  completedDot: {
    backgroundColor: Colors.brandBlue[1],
  },
  inactiveDot: {
    backgroundColor: Colors.gray.light,
  },
  dotWithLine: {
    // marginRight: 30,
    marginHorizontal: 4,
    position: "relative",
  },
});

export default ProgressIndicator;
