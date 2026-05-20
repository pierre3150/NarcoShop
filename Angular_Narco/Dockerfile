# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Construire l'application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Installer un serveur HTTP simple pour servir l'application
RUN npm install -g http-server

# Copier les fichiers construits depuis le stage builder
COPY --from=builder /app/dist/narco-frontend ./dist

# Exposer le port
EXPOSE 4200

# Lancer l'application
CMD ["http-server", "dist", "-p", "4200", "--cors"]

