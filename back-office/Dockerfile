# back-office/Dockerfile

# --- Étape 1: Build ---
# On utilise une image Node.js complète pour installer les dépendances et construire l'application.
FROM node:18-alpine AS builder

# Définir l'environnement de production
ENV NODE_ENV=production

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances et les installer
# On copie package-lock.json aussi pour des installations déterministes
COPY package*.json ./
RUN npm ci

# Copier le reste du code source de l'application
COPY . .

# Construire l'application Next.js pour la production
# Cette commande génère le dossier .next
RUN npm run build

# --- Étape 2: Runner ---
# On utilise une image Node.js légère pour l'exécution
FROM node:18-alpine AS runner

# Définir l'environnement de production
ENV NODE_ENV=production

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances pour installer uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev

# Copier le build de production depuis l'étape 'builder'
COPY --from=builder /usr/src/app/.next ./.next

# Copier le dossier public et le fichier de configuration de Next.js
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.mjs ./next.config.mjs

# Exposer le port sur lequel Next.js s'exécute (par défaut 3000)
EXPOSE 3000

# La commande pour démarrer l'application en production
# npm start exécute "next start"
CMD ["npm", "start"]
