#!/bin/bash

# Script to deploy the HealthyCore backend on a production server.
# This script should be run from the root of the project directory.

# Exit immediately if a command exits with a non-zero status.
set -e

echo ">>> Starting production deployment..."

# 1. Navigate to the backend directory
cd backend

# 2. Stop any running production containers and remove volumes to ensure a clean start
echo ">>> Stopping and removing old containers and volumes..."
docker compose -f docker-compose.prod.yml down -v || true # || true to prevent error if no containers are running

# 3. Build and start the production services in detached mode
echo ">>> Building and starting new containers..."
docker compose -f docker-compose.prod.yml up --build -d

# 4. Wait a few seconds for the database to be fully ready
echo ">>> Waiting 15 seconds for the database to initialize..."
sleep 15

# 5. Run database migrations
echo ">>> Applying database migrations..."
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "✅ Deployment finished successfully!"
echo "HealthyCore backend is now running."
echo "Access it via http://<your_vps_ip>:5000"
