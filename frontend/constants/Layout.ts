import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Dimensions et espacements standards
const Layout = {
  // Dimensions de l'écran
  window: {
    width,
    height,
  },

  // Déterminer si l'écran est en mode paysage
  isLandscape: width > height,

  // Espacement de sécurité pour les appareils avec encoche et barre home
  safeArea: {
    top: 44, // Pour les appareils avec encoche
    bottom: 34, // Pour les appareils avec barre home
    horizontal: 16,
  },

  // Marges et paddings standards
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Rayons de bordure
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 100,
  },

  // Tailles d'icône
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },

  // Élévations (iOS/Android)
  elevation: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // Durées d'animation
  animation: {
    fast: 150,
    normal: 300,
    slow: 450,
  },

  // Breakpoints pour les designs responsive
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },
};

export default Layout;
