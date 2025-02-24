import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

interface SeparatorProps {
  text?: string;
}

const Separator: React.FC<SeparatorProps> = ({ text = "Ou" }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray.light,
  },
  text: {
    marginHorizontal: 10,
    color: Colors.gray.dark,
    fontSize: 14,
  },
});

export default Separator;
