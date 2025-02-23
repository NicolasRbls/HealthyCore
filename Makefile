FRONT_DIR = ./frontend
BACK_DIR = ./backend
DOCKER_COMPOSE = docker-compose -f $(BACK_DIR)/docker-compose.yml

# Démarre les conteneurs Docker (pgAdmin et PostgreSQL)
up:
	$(DOCKER_COMPOSE) up -d

# Arrête et supprime les conteneurs Docker
down:
	$(DOCKER_COMPOSE) down

# Arrête, supprime les conteneurs et les volumes associés
down-volumes:
	$(DOCKER_COMPOSE) down -v

# Installe les dépendances pour le front-end
install-front:
	cd $(FRONT_DIR) && npm install

# Installe les dépendances pour le back-end
install-back:
	cd $(BACK_DIR) && npm install

# Crée les tables
migrate:
	cd $(BACK_DIR) && npx prisma migrate dev

# Insère des données dans la base de données
seed:
	cd $(BACK_DIR) && npx prisma db seed

# Démarre le back-end
start-back:
	cd $(BACK_DIR) && npm start

# ATTENTION : À utiliser uniquement à la première exécution (démarrage des conteneurs, installation des dépendances, migration, insertion des données)
first-launch: up install-front install-back migrate seed

# Un seul appel pour tout configurer et démarrer, sans migration ni installation
work: up start-back
