import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
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
  // Animation pour l'effet de sélection
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const backgroundColorAnim = React.useRef(new Animated.Value(0)).current;

  // Effet lorsque la sélection change
  React.useEffect(() => {
    if (selected) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundColorAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(backgroundColorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [selected]);

  // Effet d'animation lors du press
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Interpolation pour l'animation de couleur
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.gray.ultraLight, Colors.brandBlue[1]],
  });

  const textColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.black, Colors.white],
  });

  const subtitleColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.gray.dark, Colors.white],
  });

  // Détermine la couleur de l'icône
  const finalIconColor = iconColor
    ? iconColor
    : selected
    ? Colors.white
    : Colors.gray.dark;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
        selected && Layout.elevation.sm,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
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
            <Animated.Text
              style={[styles.title, { color: textColor }]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>

            {subtitle && (
              <Animated.Text
                style={[styles.subtitle, { color: subtitleColor }]}
                numberOfLines={2}
              >
                {subtitle}
              </Animated.Text>
            )}
          </View>
        </View>

        {selected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    overflow: "hidden",
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
  },
  subtitle: {
    ...TextStyles.caption,
  },
  checkmark: {
    marginLeft: Layout.spacing.sm,
  },
});

export default SelectableOption;
