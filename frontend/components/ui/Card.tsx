import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
  elevation?: "none" | "sm" | "md" | "lg";
  backgroundColor?: string;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = "default",
  elevation = "sm",
  backgroundColor = Colors.white,
  disabled = false,
}) => {
  // Animation pour l'effet de press
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Détermine les styles en fonction des variants
  const getCardStyles = (): ViewStyle[] => {
    const styles: ViewStyle[] = [
      {
        backgroundColor,
        borderRadius: Layout.borderRadius.md,
        padding: Layout.spacing.md,
        opacity: disabled ? Colors.opacity.disabled : 1,
      },
    ];

    // Ajoute les styles selon le variant
    switch (variant) {
      case "elevated":
        styles.push(Layout.elevation[elevation === "none" ? "sm" : elevation]);
        break;
      case "outlined":
        styles.push({
          borderWidth: 1,
          borderColor: Colors.gray.light,
        });
        break;
    }

    return styles;
  };

  // Fonctions pour l'animation de press
  const handlePressIn = () => {
    if (onPress) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: Layout.animation.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: Layout.animation.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  // Si le composant est cliquable, utiliser TouchableOpacity
  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          style={[...getCardStyles(), style]}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Sinon, utiliser un View simple
  return <View style={[...getCardStyles(), style]}>{children}</View>;
};

const styles = StyleSheet.create({});

export default Card;
