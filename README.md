# HealthyCore Backend - Documentation pour les Développeurs

Bienvenue dans le backend de l'application HealthyCore. Cette documentation explique comment configurer, exécuter, et tester le backend pour collaborer efficacement avec l'équipe front-end.

---

## **1. Prérequis**

### **Outils nécessaires :**
- [Node.js](https://nodejs.org/) (v14 ou plus récent)
- [PostgreSQL](https://www.postgresql.org/) (installé localement)
- [Postman](https://www.postman.com/) ou un autre outil pour tester les API
- Git pour cloner le projet

---

## **2. Installation du backend**

### **Étape 1 : Cloner le projet**
Exécute la commande suivante pour cloner le dépôt :
```bash
git clone <lien_du_depot_git>
```

Ensuite, navigue dans le dossier du projet :
```bash
cd HealthyCore
```

### **Étape 2 : Installer les dépendances**
Installe toutes les dépendances nécessaires avec npm :
```bash
npm install
```

### **Étape 3 : Configurer PostgreSQL**
1. Crée une base de données PostgreSQL nommée `HealthyCore` :
   ```sql
   CREATE DATABASE "HealthyCore";
   ```
2. Note les informations suivantes pour la connexion :
   - Nom de la base : `HealthyCore`
   - Utilisateur : `postgres`
   - Mot de passe : `ton_mot_de_passe`
   - Hôte : `localhost`
   - Port : `5432`

### **Étape 4 : Créer le fichier `.env`**
Dans le dossier racine du projet, crée un fichier nommé `.env` avec le contenu suivant :
```env
DB_NAME="HealthyCore"
DB_USER=postgres
DB_PASSWORD=ton_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=une_cle_secrete_generée
PORT=5001
```
- **`JWT_SECRET`** : Utilise une clé secrète aléatoire (générée par exemple avec Node.js : `require('crypto').randomBytes(64).toString('hex');`).
- **`PORT`** : Numéro du port sur lequel le serveur écoute.

### **Étape 5 : Synchroniser la base de données**
Le backend synchronise automatiquement les modèles Sequelize avec PostgreSQL. Lors du premier démarrage, les tables seront créées.

---

## **3. Démarrer le backend**

Exécute la commande suivante pour démarrer le serveur en mode développement :
```bash
node server.js
```

Tu devrais voir des logs confirmant la connexion à PostgreSQL et le lancement du serveur :
```
Tentative de connexion à la base de données...
Connexion réussie à PostgreSQL
Modèles synchronisés avec PostgreSQL
Serveur lancé sur le port 5001
```

Le serveur est maintenant accessible sur :
```
http://localhost:5001
```

---


## **4. Gestion des erreurs courantes**

### **Problème : Port déjà utilisé**
Si tu vois une erreur comme :
```
Error: listen EADDRINUSE: address already in use :::5001
```
- Vérifie quel processus utilise le port 5001 :
  ```bash
  netstat -ano | findstr :5001
  ```
- Tue le processus avec :
  ```bash
  taskkill /PID <PID> /F
  ```

### **Problème : Impossible de se connecter à PostgreSQL**
- Vérifie que PostgreSQL est bien démarré.
- Assure-toi que les informations dans `.env` sont correctes.

### **Problème : Tables manquantes dans PostgreSQL**
- Supprime les tables existantes et laisse Sequelize les recréer.
  ```sql
  DROP TABLE IF EXISTS users;
  ```
- Redémarre le serveur.

---

## **5. Collaboration avec le front-end**

### **Accès aux routes :**
- Toutes les routes sont disponibles sur `http://localhost:5001`.
- L'équipe front-end peut utiliser le token JWT pour sécuriser les requêtes protégées.

### **Exemple d'intégration front-end :**
Dans une requête Axios (React) :
```javascript
axios.post('http://localhost:5001/api/users/login', {
  email: 'janedoe@example.com',
  mot_de_passe: 'mon_mot_de_passe',
})
.then(response => {
  console.log('Token reçu :', response.data.token);
})
.catch(error => {
  console.error('Erreur de connexion :', error.response.data);
});
```

---

## **6. Structure des fichiers**

```
HealthyCore-backend/
├── config/
│   └── db.js            # Configuration de la base de données
├── models/
│   └── User.js          # Modèle utilisateur
├── routes/
│   └── userRoutes.js    # Routes utilisateur (inscription, connexion, etc.)
├── middlewares/
│   └── authMiddleware.js # Middleware de protection JWT
├── server.js            # Point d'entrée principal
├── .env                 # Fichier de configuration (non inclus dans Git)
├── package.json         # Dépendances et scripts npm
```

---

## **7. Commandes utiles**

- **Installer les dépendances :**
  ```bash
  npm install
  ```

- **Démarrer le serveur :**
  ```bash
  node server.js
  ```

- **Tester les routes avec Postman :**
  Configure Postman avec les exemples donnés plus haut.

---

Avec ces informations, chaque membre de l'équipe peut facilement configurer, exécuter et tester le backend HealthyCore. Si vous avez des questions, n'hésitez pas à demander ! 🚀

