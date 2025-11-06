import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  ReturnKeyTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: string;
  error?: string;
  touched?: boolean;
  helper?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  isPassword?: boolean;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  rightIcon?: string;
  onRightIconPress?: () => void;
  onInputPress?: () => void;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  touched,
  helper,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  isPassword = false,
  showPassword = false,
  togglePasswordVisibility,
  rightIcon,
  onRightIconPress,
  onInputPress,
  fullWidth = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus && props.onFocus({} as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur && props.onBlur({} as any);
  };

  // Détermine le style du conteneur
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: Layout.spacing.md,
    };

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    return baseStyle;
  };

  // Détermine le style du conteneur d'input
  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isFocused
        ? Colors.brandBlue[0]
        : error && touched
        ? Colors.error
        : Colors.gray.light,
      borderRadius: Layout.borderRadius.md,
      backgroundColor: isFocused
        ? Colors.white
        : error && touched
        ? Colors.error + "10"
        : Colors.gray.ultraLight,
      paddingHorizontal: Layout.spacing.md,
      height: 56,
    };

    return baseStyle;
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            isFocused && styles.focusedLabel,
            error && touched && styles.errorLabel,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={
              isFocused
                ? Colors.brandBlue[0]
                : error && touched
                ? Colors.error
                : Colors.gray.dark
            }
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.gray.medium}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {/* Affiche l'icône de mot de passe si applicable */}
        {isPassword && togglePasswordVisibility && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={Colors.gray.dark}
            />
          </TouchableOpacity>
        )}

        {/* Affiche une icône personnalisée à droite si applicable */}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={Colors.gray.dark}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Message d'erreur */}
      {error && touched && (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      )}

      {/* Texte d'aide */}
      {helper && !error && (
        <Text style={[styles.helper, helperStyle]}>{helper}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...TextStyles.label,
    marginBottom: Layout.spacing.xs,
    color: Colors.black,
  },
  focusedLabel: {
    color: Colors.brandBlue[0],
  },
  errorLabel: {
    color: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    paddingVertical: Layout.spacing.md,
  },
  leftIcon: {
    marginRight: Layout.spacing.sm,
  },
  error: {
    ...TextStyles.caption,
    marginTop: Layout.spacing.xs,
    color: Colors.error,
  },
  helper: {
    ...TextStyles.caption,
    marginTop: Layout.spacing.xs,
    color: Colors.gray.dark,
  },
});

export default Input;
