import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Colors from "@/constants/Colors";

interface CardProps {
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard, style]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.selectedText]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.description, selected && styles.selectedText]}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: Colors.brandBlue[1],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  selectedText: {
    color: Colors.white,
  },
});

export default Card;
