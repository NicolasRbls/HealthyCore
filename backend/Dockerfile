# 1. Base Image: Use a specific Node.js version for stability
FROM node:18-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files and install dependencies
# This leverages Docker's layer caching.
COPY package*.json ./
RUN npm install

# 4. Copy Prisma schema and generate Prisma Client
# This needs to happen after npm install which brings in the prisma CLI
COPY prisma ./prisma/
RUN npx prisma generate

# 5. Copy the rest of the application source code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 5000

# 7. Command to run the application
CMD ["node", "server.js"]
