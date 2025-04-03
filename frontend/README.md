# HealthyCore Frontend 🏋️‍♀️

## 📱 Présentation

HealthyCore est une application mobile de suivi de santé et de fitness développée en React Native avec Expo, conçue dans le cadre d'un projet de Master 1 Développement Web et Mobile (DWM).

## 🚀 Technologies Principales

- **Framework**: React Native avec Expo
- **Langage**: TypeScript
- **Routing**: Expo Router (Routing basé sur les fichiers)

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
frontend/
├── app/                   # Routes et écrans principaux
│   ├── _layout.tsx        # Layout global de l'application
│   ├── welcome.tsx        # Écran d'accueil
│   ├── auth/              # Authentification
│   ├── register/          # Processus d'inscription
│   ├── admin/             # Routes admin
│   └── user/              # Routes utilisateur
│
├── components/            # Composants réutilisables
│   ├── ui/                # Composants UI de base
│   ├── layout/            # Composants de mise en page
│   └── registration/      # Composants spécifiques à l'inscription
│
├── constants/             # Styles et valeurs constantes
│   ├── Colors.ts
│   ├── Fonts.ts
│   └── Layout.ts
│
├── context/               # Contextes React
│   ├── AuthContext.tsx
│   └── RegistrationContext.tsx
│
├── hooks/                 # Hooks personnalisés
│   ├── useForm.ts
│   ├── useNumericInput.ts
│   └── useDatePicker.ts
│
└── services/              # Services pour les appels API
    ├── api.service.ts
    ├── auth.service.ts
    └── validation.service.ts
```

### Principes Architecturaux

1. **Routing Basé sur les Fichiers**

   - Utilisation d'Expo Router
   - Chaque fichier dans `app/` devient une route
   - Routes dynamiques et imbriquées

2. **Séparation des Préoccupations**

   - Composants UI indépendants
   - Services dédiés aux appels API
   - Contextes pour la gestion d'état global

3. **Hooks Personnalisés**
   - Logique réutilisable
   - Séparation de la logique de la présentation
   - Validation et gestion des formulaires centralisée
