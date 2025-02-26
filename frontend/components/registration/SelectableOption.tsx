import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

interface SelectableOptionProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
}

const SelectableOption: React.FC<SelectableOptionProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  icon,
  iconSize = 24,
  iconColor,
  disabled = false,
}) => {
  // Détermine la couleur de l'icône
  const finalIconColor = iconColor
    ? iconColor
    : selected
    ? Colors.white
    : Colors.gray.dark;

  return (
    <View
      style={[
        styles.container,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={iconSize}
              color={finalIconColor}
              style={styles.icon}
            />
          )}

          <View style={styles.textContainer}>
            <Text
              style={[styles.title, selected && styles.selectedTitle]}
              numberOfLines={1}
            >
              {title}
            </Text>

            {subtitle && (
              <Text
                style={[styles.subtitle, selected && styles.selectedSubtitle]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {selected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    backgroundColor: Colors.gray.ultraLight,
    overflow: "hidden",
  },
  selectedContainer: {
    backgroundColor: Colors.brandBlue[1],
    ...Layout.elevation.sm,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Layout.spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: Layout.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TextStyles.body,
    fontWeight: "600",
    marginBottom: 2,
    color: Colors.black,
  },
  selectedTitle: {
    color: Colors.white,
  },
  subtitle: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  selectedSubtitle: {
    color: Colors.white,
  },
  checkmark: {
    marginLeft: Layout.spacing.sm,
  },
});

export default SelectableOption;
