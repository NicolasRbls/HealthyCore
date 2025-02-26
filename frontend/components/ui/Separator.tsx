import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

interface SeparatorProps {
  text?: string;
  textPosition?: "left" | "center" | "right";
  lineColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Separator: React.FC<SeparatorProps> = ({
  text,
  textPosition = "center",
  lineColor = Colors.gray.light,
  textColor = Colors.gray.dark,
  style,
  textStyle,
}) => {
  if (!text) {
    return (
      <View
        style={[styles.simpleLine, { backgroundColor: lineColor }, style]}
      />
    );
  }

  const textPositionStyle: ViewStyle = {
    justifyContent:
      textPosition === "left"
        ? "flex-start"
        : textPosition === "right"
        ? "flex-end"
        : "center",
  };

  return (
    <View style={[styles.container, textPositionStyle, style]}>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Layout.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray.light,
  },
  text: {
    ...TextStyles.caption,
    marginHorizontal: Layout.spacing.md,
    color: Colors.gray.dark,
  },
  simpleLine: {
    height: 1,
    width: "100%",
    backgroundColor: Colors.gray.light,
    marginVertical: Layout.spacing.lg,
  },
});

export default Separator;
