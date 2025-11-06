import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
  iconName?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = Colors.black,
  size = 24,
  style,
  iconName = "chevron-back",
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <Ionicons name={iconName as any} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    backgroundColor: Colors.white,
    ...Layout.elevation.sm,
    alignSelf: "flex-start",
    marginBottom: Layout.spacing.md,
  },
});

export default BackButton;
