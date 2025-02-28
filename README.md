# HealthyCore 🏋️‍♀️ 

## 📱 Présentation

HealthyCore est une application mobile de santé et de fitness développée avec React Native et Expo. Elle permet aux utilisateurs de suivre leurs objectifs de santé, gérer leur alimentation et leurs activités physiques, tout en fournissant des recommandations personnalisées basées sur leur profil.

L'application utilise une architecture moderne avec un backend Node.js, Express et PostgreSQL, et un frontend React Native avec Expo et TypeScript.

## ✨ Fonctionnalités disponibles

- ✅ **Authentification complète** : Inscription en plusieurs étapes et connexion
- ✅ **Profil personnalisé** : Informations personnelles, objectifs de poids, préférences alimentaires
- ✅ **Calculs nutritionnels** : BMR, TDEE, calories quotidiennes recommandées
- ✅ **Plans nutritionnels** : Différents types de plans adaptés aux objectifs (perte/gain de poids, maintien)

## 🚀 Technologies utilisées

### Frontend

- **Framework** : React Native avec Expo
- **Langage** : TypeScript
- **Routing** : Expo Router (routing basé sur les fichiers)
- **Gestion d'état** : Context API
- **UI/UX** : Composants personnalisés avec styles intégrés

### Backend

- **Serveur** : Node.js
- **Framework** : Express
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : JWT (JSON Web Tokens)
- **Validation** : Express-validator et validateurs personnalisés

## 🔧 Prérequis

- Node.js
- npm
- Docker et Docker Compose (pour la base de données)

## 🛠️ Installation

### Configuration rapide

```bash
# Cloner le dépôt
git clone https://github.com/NicolasRbls/HealthyCore.git
cd healthycore

# Configuration complète pour la première utilisation
make first-launch

# Dans un autre terminal, lancer le frontend
cd frontend
npx expo start
```

Cette commande `first-launch` va:
1. Démarrer les conteneurs Docker (PostgreSQL et pgAdmin)
2. Installer les dépendances frontend et backend
3. Créer les tables de la base de données
4. Remplir la base de données avec les données initiales

## 📱 Utilisation de l'application

1. Ouvrez l'application sur votre émulateur ou appareil réel via Expo Go
2. Créez un compte en suivant le processus d'inscription en 8 étapes
3. Ou connectez-vous si vous avez déjà un compte

## 🗂️ Structure du projet

### Frontend

```
frontend/
├── app/                   # Routes et écrans (Expo Router)
│   ├── _layout.tsx        # Layout principal
│   ├── welcome.tsx        # Écran d'accueil
│   ├── auth/              # Authentification
│   ├── register/          # Processus d'inscription en 8 étapes
│   ├── admin/             # Interface administrateur
│   └── user/              # Interface utilisateur
├── components/            # Composants réutilisables
├── constants/             # Constantes de l'application
├── context/               # Contextes React pour la gestion d'état
├── hooks/                 # Hooks personnalisés
└── services/              # Services pour les appels API
```

### Backend

```
backend/
├── prisma/                # Configuration Prisma et migrations
├── src/
│   ├── config/            # Configuration centralisée
│   ├── modules/           # Organisation par domaine fonctionnel
│   │   ├── auth/          # Authentification
│   │   ├── validation/    # Validation des données
│   │   ├── user/          # Gestion des utilisateurs
│   │   └── data/          # Données communes
│   ├── services/          # Services partagés
│   ├── utils/             # Utilitaires
│   └── middleware/        # Middleware globaux
└── docker-compose.yml     # Configuration Docker
```

## 📋 Commandes utiles

### Commandes Make

```bash
# Démarrer les conteneurs Docker
make up

# Arrêter les conteneurs Docker
make down

# Supprimer les conteneurs et les volumes
make down-volumes

# Installer les dépendances frontend
make install-front

# Installer les dépendances backend
make install-back

# Créer les tables de la base de données
make migrate

# Initialiser les données
make seed

# Démarrer le backend
make start-back

# Configuration complète pour la première utilisation
make first-launch

# Démarrage rapide pour le développement
make work
```

## 👨‍💻 Utilisateur administrateur par défaut

Après initialisation de la base de données, un compte administrateur est créé avec les identifiants suivants:

- **Email** : admin@admin.com
- **Mot de passe** : admin

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique. Tous droits réservés.

---

<div align="center">
  <p>Développé dans le cadre du Master 1 Développement Web et Mobile (DWM)</p>
</div>
