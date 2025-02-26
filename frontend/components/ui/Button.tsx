import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
  TouchableOpacityProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

interface ButtonProps extends TouchableOpacityProps {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  // Animation pour l'effet de press
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Détermine les styles en fonction des variants et tailles
  const getButtonStyles = (): ViewStyle => {
    let baseStyle: ViewStyle = {
      borderRadius: Layout.borderRadius.pill,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    // Styles selon le variant
    switch (variant) {
      case "primary":
        baseStyle = {
          ...baseStyle,
          backgroundColor: Colors.brandBlue[0],
        };
        break;
      case "secondary":
        baseStyle = {
          ...baseStyle,
          backgroundColor: Colors.secondary[0],
        };
        break;
      case "outline":
        baseStyle = {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: Colors.brandBlue[0],
        };
        break;
      case "ghost":
        baseStyle = {
          ...baseStyle,
          backgroundColor: "transparent",
        };
        break;
    }

    // Styles selon la taille
    switch (size) {
      case "sm":
        baseStyle = {
          ...baseStyle,
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
        break;
      case "md":
        baseStyle = {
          ...baseStyle,
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
        break;
      case "lg":
        baseStyle = {
          ...baseStyle,
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
        break;
    }

    // Style pour bouton pleine largeur
    if (fullWidth) {
      baseStyle.width = "100%";
    }

    // Style pour bouton désactivé
    if (disabled || loading) {
      baseStyle.opacity = Colors.opacity.disabled;
    }

    return baseStyle;
  };

  // Détermine les styles de texte
  const getTextStyles = (): TextStyle => {
    let baseStyle: TextStyle = {
      ...TextStyles.buttonText,
    };

    // Styles selon le variant
    switch (variant) {
      case "primary":
      case "secondary":
        baseStyle.color = Colors.white;
        break;
      case "outline":
      case "ghost":
        baseStyle.color = Colors.brandBlue[0];
        break;
    }

    // Styles selon la taille
    switch (size) {
      case "sm":
        baseStyle.fontSize = 14;
        break;
      case "md":
        baseStyle.fontSize = 16;
        break;
      case "lg":
        baseStyle.fontSize = 18;
        break;
    }

    return baseStyle;
  };

  // Fonctions pour l'animation de press
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: Layout.animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: Layout.animation.fast,
      useNativeDriver: true,
    }).start();
  };

  // Icône adaptée au variant
  const iconColor =
    variant === "primary" || variant === "secondary"
      ? Colors.white
      : Colors.brandBlue[0];

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <TouchableOpacity
        onPress={loading || disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        {...props}
        style={[getButtonStyles(), style]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              variant === "primary" || variant === "secondary"
                ? Colors.white
                : Colors.brandBlue[0]
            }
          />
        ) : (
          <>
            {leftIcon && (
              <Ionicons
                name={leftIcon as any}
                size={size === "sm" ? 16 : size === "md" ? 20 : 24}
                color={iconColor}
                style={styles.leftIcon}
              />
            )}

            <Text style={[getTextStyles(), textStyle]}>{text}</Text>

            {rightIcon && (
              <Ionicons
                name={rightIcon as any}
                size={size === "sm" ? 16 : size === "md" ? 20 : 24}
                color={iconColor}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: "stretch",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
