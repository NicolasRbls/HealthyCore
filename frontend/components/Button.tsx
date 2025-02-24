import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import Colors from "../constants/Colors";

type ButtonProps = {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
};

const Button = ({ text, onPress, style }: ButtonProps) => {
  // Valeur d'animation pour la transition
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Gérer la pression
  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  // Gérer le relâchement
  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Interpoler les couleurs
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.brandBlue[1], Colors.brandBlue[0]],
  });

  // Scale pour le bouton
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  return (
    <Animated.View
      style={[styles.buttonContainer, style, { transform: [{ scale }] }]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor,
            },
          ]}
        >
          <Text style={styles.buttonText}>{text}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 50,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.brandBlue[1],
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
});

export default Button;
