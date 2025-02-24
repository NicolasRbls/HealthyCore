# Guide d'installation du projet

## État Actuel : 🚧 EN TRAVAUX 🚧

### Étapes Terminées ✅

- Création de la base de données
- Migration vers PostgreSQL
- Remplissage avec les données initiales

## Structure du Projet

Le projet est divisé en deux répertoires principaux :

- `frontend/` : Contient l'application front-end
- `backend/` : Contient l'application back-end et la configuration de la base de données

## Instructions d'Installation

### Première Installation

Pour une première installation du projet, utilisez :

```bash
make first-launch
```

Cette commande va :

1. Démarrer les conteneurs Docker (PostgreSQL et pgAdmin)
2. Installer les dépendances front-end
3. Installer les dépendances back-end
4. Exécuter les migrations de la base de données
5. Remplir la base de données avec les données initiales

### Installation pour le Développement

Pour le développement quotidien après la première installation :

```bash
make work
```

Cette commande va :

1. Démarrer les conteneurs Docker
2. Lancer le serveur back-end

### Lancement du Frontend

Pour lancer l'application frontend, ouvrez un nouveau terminal et exécutez :

```bash
cd frontend
npx expo start
```

⚠️ Note : Le frontend doit être lancé dans un terminal séparé pendant que le backend tourne.

### Gestion de la Base de Données

#### Avec Migrations

Si vous devez apporter des modifications à la base de données :

1. Effectuez vos modifications dans le schéma Prisma
2. Lancez les migrations : `make migrate`
3. Remplissez la base de données : `make seed`

#### Sans Migrations

Si vous démarrez simplement la base de données existante :

1. Démarrez les conteneurs : `make up`
2. Lancez le back-end : `make start-back`

## Commandes Disponibles

### Gestion Docker

- `make up` : Démarre les conteneurs Docker
- `make down` : Arrête et supprime les conteneurs
- `make down-volumes` : Arrête et supprime les conteneurs et leurs volumes

### Installation

- `make install-front` : Installe les dépendances front-end
- `make install-back` : Installe les dépendances back-end

### Opérations sur la Base de Données

- `make migrate` : Crée les tables de la base de données
- `make seed` : Remplit la base de données avec les données initiales

### Gestion de l'Application

- `make start-back` : Démarre le serveur back-end
- `make first-launch` : Configuration complète pour la première utilisation
- `make work` : Démarrage rapide pour le développement

## Détails Techniques

Le projet utilise :

- Docker Compose pour la gestion des conteneurs
- PostgreSQL comme base de données
- pgAdmin pour l'administration de la base de données
- Prisma pour les migrations et le remplissage de la base de données
- Expo pour le frontend React Native
