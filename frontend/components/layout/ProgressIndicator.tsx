import React from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";

interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
  style?: ViewStyle;
  dotSize?: number;
  activeColor?: string;
  inactiveColor?: string;
  completedColor?: string;
  showLine?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  style,
  dotSize = 10,
  activeColor = Colors.brandBlue[0],
  inactiveColor = Colors.gray.light,
  completedColor = Colors.brandBlue[1],
  showLine = true,
}) => {
  // Animation pour chaque point
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Animation lorsque l'étape courante change
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, scaleAnim]);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: steps }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Point indicateur */}
          <Animated.View
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor:
                  index < currentStep
                    ? completedColor
                    : index === currentStep
                    ? activeColor
                    : inactiveColor,
                transform: [{ scale: index === currentStep ? scaleAnim : 1 }],
              },
            ]}
          />

          {/* Ligne entre les points */}
          {showLine && index < steps - 1 && (
            <View
              style={[
                styles.line,
                {
                  backgroundColor:
                    index < currentStep ? completedColor : inactiveColor,
                },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Layout.spacing.md,
    width: "100%",
  },
  dot: {
    backgroundColor: Colors.gray.light,
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});

export default ProgressIndicator;
