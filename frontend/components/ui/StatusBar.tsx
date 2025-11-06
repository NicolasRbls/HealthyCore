import React from "react";
import {
  StatusBar as RNStatusBar,
  StatusBarProps,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/Colors";

interface CustomStatusBarProps extends StatusBarProps {
  backgroundColor?: string;
  translucent?: boolean;
}

const StatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor = Colors.white,
  barStyle = "dark-content",
  translucent = false,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  // Calcul de la hauteur de la barre d'état en tenant compte du safe area
  const statusBarHeight = translucent ? 0 : insets.top;

  return (
    <>
      <RNStatusBar
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        translucent={translucent}
        {...props}
      />
      {!translucent && (
        <View
          style={[
            styles.statusBarBackground,
            { backgroundColor, height: statusBarHeight },
          ]}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default StatusBar;
