import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface SelectableOptionProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

const SelectableOption: React.FC<SelectableOptionProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={selected ? Colors.white : Colors.gray.dark}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, selected && styles.textSelected]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, selected && styles.textSelected]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  containerSelected: {
    backgroundColor: Colors.brandBlue[1],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginTop: 4,
  },
  textSelected: {
    color: Colors.white,
  },
});

export default SelectableOption;
