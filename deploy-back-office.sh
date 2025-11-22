#!/bin/bash

# Script to deploy the HealthyCore back-office on a production server.
# This script should be run from the root of the project directory.

# Exit immediately if a command exits with a non-zero status.
set -e

echo ">>> Starting Back-Office production deployment..."

# 1. Navigate to the back-office directory
cd back-office

# 2. Stop any running production containers and remove volumes to ensure a clean start
echo ">>> Stopping and removing old back-office container..."
# Use its own compose file. || true to prevent error if no containers are running.
docker compose -f docker-compose.prod.yml down -v --remove-orphans || true

# 3. Build and start the production service in detached mode
echo ">>> Building and starting new back-office container..."
docker compose -f docker-compose.prod.yml up --build -d

# 4. Clean up dangling images (optional but good practice)
echo ">>> Cleaning up old images..."
docker image prune -f

echo "✅ Deployment finished successfully!"
echo "HealthyCore Back-Office is now running."
echo "Access it via http://<your_vps_ip>:3000"
