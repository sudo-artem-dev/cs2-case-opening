FROM node:20-alpine

# Dépendances utiles pour NestJS hot reload
RUN apk update && apk upgrade && apk add --no-cache bash libc6-compat

WORKDIR /app

COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies)
RUN npm install

COPY . .

EXPOSE 3000

# Lancer en mode dev avec hot reload
CMD ["npm", "run", "start:dev"]
