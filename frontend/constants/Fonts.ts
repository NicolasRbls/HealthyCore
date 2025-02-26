import { TextStyle } from "react-native";

// Configuration des polices et styles de texte
const FontFamilies = {
  primary: "Poppins-Regular",
  primaryBold: "Poppins-Bold",
  primarySemiBold: "Poppins-SemiBold",
  primaryLight: "Poppins-Light",
  primaryMedium: "Poppins-Medium",
};

// Tailles de police pour les différents niveaux de hiérarchie
const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};

// Poids de police
const FontWeights = {
  light: "300" as TextStyle["fontWeight"],
  normal: "400" as TextStyle["fontWeight"],
  medium: "500" as TextStyle["fontWeight"],
  semiBold: "600" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
  extraBold: "800" as TextStyle["fontWeight"],
};

// Hauteurs de ligne
const LineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Styles de texte prédéfinis
const TextStyles: Record<string, TextStyle> = {
  // Titres
  h1: {
    fontFamily: FontFamilies.primaryBold,
    fontSize: FontSizes["4xl"],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes["4xl"] * LineHeights.tight,
  },
  h2: {
    fontFamily: FontFamilies.primaryBold,
    fontSize: FontSizes["3xl"],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes["3xl"] * LineHeights.tight,
  },
  h3: {
    fontFamily: FontFamilies.primaryBold,
    fontSize: FontSizes["2xl"],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes["2xl"] * LineHeights.tight,
  },
  h4: {
    fontFamily: FontFamilies.primarySemiBold,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSizes.xl * LineHeights.tight,
  },
  h5: {
    fontFamily: FontFamilies.primarySemiBold,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSizes.lg * LineHeights.tight,
  },

  // Paragraphes
  bodyLarge: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg * LineHeights.normal,
  },
  body: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * LineHeights.normal,
  },
  bodySmall: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * LineHeights.normal,
  },

  // Textes d'emphase
  caption: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.sm,
    color: "#ADA4A5", // Couleur grisée
  },
  buttonText: {
    fontFamily: FontFamilies.primarySemiBold,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semiBold,
  },
  label: {
    fontFamily: FontFamilies.primaryMedium,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
};

export { FontFamilies, FontSizes, FontWeights, LineHeights, TextStyles };
