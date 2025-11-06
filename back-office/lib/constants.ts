export const Colors = {
  // Couleurs principales de la marque
  brandBlue: ["#92A3FD", "#9DCEFF"], // Dégradé de bleu
  secondary: ["#C58BF2", "#EEA4CE"], // Dégradé secondaire

  // Couleurs de base
  black: "#1D1617",
  white: "#FFFFFF",

  // Nuances de gris
  gray: {
    dark: "#7B6F72",
    medium: "#ADA4A5",
    light: "#DDDADA",
    ultraLight: "#F7F8F8",
  },

  // Couleurs de fond
  background: "#FFFFFF",
  border: "#F7F8F8",

  // Couleurs sémantiques
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#FF5252",
  info: "#2196F3",

  // Couleurs pour les plans nutritionnels
  plan: {
    cardio: {
      primary: "#4A90E2",
      secondary: "#D4E6FC",
      text: "#FFFFFF",
    },
    durable: {
      primary: "#4CAF50",
      secondary: "#D7F2D8",
      text: "#FFFFFF",
    },
    athlete: {
      primary: "#FFC107",
      secondary: "#FFF8E1",
      text: "#FFFFFF",
    },
    muscle: {
      primary: "#E53935",
      secondary: "#FFEBEE",
      text: "#FFFFFF",
    },
  },

  // Opacités pour différents états
  opacity: {
    disabled: 0.5,
    pressed: 0.7,
  },
};

export const FontFamilies = {
  primary: "Poppins",
  primaryBold: "Poppins",
  primarySemiBold: "Poppins",
  primaryLight: "Poppins",
  primaryMedium: "Poppins",
};

export const API_ROUTES = {
  // Utilisateurs
  USERS: "/api/admin/users",
  USER_COUNT: "/api/admin/users/count",
  USER_DETAIL: (id: number) => `/api/admin/users/${id}`,

  // Tags
  TAGS: "/api/admin/tags",
  TAG_DETAIL: (id: number) => `/api/admin/tags/${id}`,

  // Exercices
  EXERCISES: "/api/admin/exercises",
  EXERCISE_DETAIL: (id: number) => `/api/admin/exercises/${id}`,

  // Séances
  SESSIONS: "/api/admin/sessions",
  SESSION_DETAIL: (id: number) => `/api/admin/sessions/${id}`,

  // Programmes
  PROGRAMS: "/api/admin/programs",
  PROGRAM_DETAIL: (id: number) => `/api/admin/programs/${id}`,

  // Aliments
  FOODS: "/api/admin/foods",
  FOOD_DETAIL: (id: number) => `/api/admin/foods/${id}`,
  FOOD_STATS: "/api/admin/foods/stats",
};
