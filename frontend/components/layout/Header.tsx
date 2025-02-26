import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  rightIconName?: string;
  onRightIconPress?: () => void;
  backgroundColor?: string;
  titleColor?: string;
  style?: ViewStyle;
  alignCenter?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  rightIconName,
  onRightIconPress,
  backgroundColor = Colors.white,
  titleColor = Colors.black,
  style,
  alignCenter = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top + Layout.spacing.sm,
        },
        style,
      ]}
    >
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={
          backgroundColor === Colors.white ? "dark-content" : "light-content"
        }
      />

      <View
        style={[styles.headerContent, alignCenter && styles.centeredContent]}
      >
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color={titleColor} />
          </TouchableOpacity>
        )}

        <Text
          style={[
            styles.title,
            { color: titleColor },
            alignCenter && styles.centeredTitle,
            showBackButton && styles.titleWithBack,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {rightComponent ? (
          <View style={styles.rightComponent}>{rightComponent}</View>
        ) : rightIconName ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightIconPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={rightIconName as any}
              size={24}
              color={titleColor}
            />
          </TouchableOpacity>
        ) : (
          // Espace vide pour équilibrer l'affichage si alignCenter est false
          !alignCenter && <View style={styles.placeholderRight} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
    height: 56,
  },
  centeredContent: {
    justifyContent: "center",
  },
  backButton: {
    marginRight: Layout.spacing.sm,
  },
  title: {
    ...TextStyles.h4,
    flex: 1,
  },
  centeredTitle: {
    textAlign: "center",
    flex: undefined,
  },
  titleWithBack: {
    marginLeft: -28, // Compenser l'espace du bouton retour pour un centrage parfait
  },
  rightComponent: {
    marginLeft: Layout.spacing.sm,
  },
  rightButton: {
    marginLeft: Layout.spacing.sm,
  },
  placeholderRight: {
    width: 28, // Même taille que le bouton retour pour équilibrer
  },
});

export default Header;
