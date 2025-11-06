# CS2 Case Opening  
Projet fil rouge de 3ème année en autonomie  
**Application mobile** + **Backend NestJS** + **MongoDB**  

Cette application simule un **système d’ouverture de caisses (case opening)** inspiré de **CS2**.  

---

## Prérequis  
Avant de commencer, assurez-vous d’avoir installé :  
- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/install/)  
- Git  
---

## Installation du projet  

### Cloner le projet  
Dans le dossier que vous avez créé ou dans votre répertoire préféré
```bash
git clone https://github.com/<ton-username>/cs2-case-opening.git
cd cs2-case-opening
````

### Créer les fichiers d’environnement à la racine du projet /cs2-case-opening

```bash
cp .env.example .env       # Développement
cp .env.example .env.prod  # Production
```

* `.env` → développement (`NODE_ENV=development`, etc)
* `.env.prod` → production (`NODE_ENV=production`, mots de passe réels, etc.)

---

## Lancement en développement (Docker)

Ce mode inclut :

* Hot reload pour l’API
* Mongo Express (UI web pour MongoDB)

### Démarrer les conteneurs
Allez dans le dossier /back-cs2-case-opening :
```bash
cd /back-cs2-case-opening
```
Puis exécutez:
```bash
docker-compose -f docker-compose-dev.yml up --build
```

### Services accessibles

* API NestJS → [http://localhost:3000](http://localhost:3000)
* MongoDB → port **27017**
* Mongo Express → [http://localhost:8081](http://localhost:8081)

### Arrêter les conteneurs

```bash
docker-compose -f docker-compose-dev.yml down
```

---

## Lancement en production (Docker)

Ce mode utilise une image optimisée (`Dockerfile.prod`) **sans Mongo Express**.

### Démarrer en arrière-plan
Allez dans le dossier /back-cs2-case-opening :
```bash
cd /back-cs2-case-opening
```

**Important :** en prod, on utilise le fichier `.env.prod`.  
Il faut donc préciser `--env-file .env.prod` lors du lancement :

```bash
docker compose -f docker-compose-prod.yml --env-file .env.prod up -d --build
```

### Services accessibles

* API NestJS compilée (`dist/`) en **production**
* MongoDB sécurisé avec les credentials définis dans `.env.prod`

### Arrêter les conteneurs

```bash
docker compose -f docker-compose-prod.yml --env-file .env.prod down
```

---

## Vérification du bon fonctionnement

* Lister les conteneurs actifs :

  ```bash
  docker ps
  ```

* Suivre les logs de l’API en production :

  ```bash
  docker-compose -f docker-compose-prod.yml logs -f api
  ```

---

## Explication rapide

* **MongoDB** tourne dans un conteneur avec un volume persistant (`mongo_data`) → les données survivent à la suppression du conteneur.
* **API NestJS** se connecte automatiquement à MongoDB via les variables définies dans `.env` ou `.env.prod`.
* En **développement**, tu peux explorer la base avec **Mongo Express** → [http://localhost:8081](http://localhost:8081).
* En **production**, seuls l’API et MongoDB tournent → plus **léger et sécurisé**.

---

## Lancement du Frontend (front-cs2-case-opening)

### Fichiers d’environnement

Créer deux fichiers dans le dossier `front-cs2-case-opening/` :

#### `.env.development`

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000
```

#### `.env.production`

```env
EXPO_PUBLIC_API_URL=https://api.mondomaine.com
```

Remplacer **`192.168.1.25`** par l’IP locale de ton PC si vous testez sur smartphone physique avec **Expo Go**.

Dans ton code, vous récuperez l’URL de l’API ainsi :

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

### Installation des dépendances

```bash
cd front-cs2-case-opening
npm install
```

---

### Scripts disponibles

Dans `package.json` du frontend, configure les scripts :

```json
"scripts": {
  "start:dev": "expo start --clear",
  "start:prod": "expo start --clear",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

Expo charge automatiquement les fichiers `.env.development` ou `.env.production` selon le mode.
Le `--clear` permet de vider le cache Metro à chaque démarrage.

---

### Lancer en développement

```bash
npm run start:dev
```

### Lancer en production

```bash
npm run start:prod
```

---

### Disponible aussi sur le web

Expo démarre également un serveur web local :

* Par défaut, Expo utilise le port **8081**.
* Mais dans ce projet, le **Backend (Mongo Express)** occupe déjà ce port.
* Expo se décale automatiquement sur le port suivant disponible → **[http://localhost:8082](http://localhost:8082)**.

En développement, ouvrez **[http://localhost:8082](http://localhost:8082)** pour tester le frontend dans un navigateur.

---

### Tester sur smartphone

* Scanner le **QR Code** affiché dans le terminal ou Expo DevTools avec l’app **Expo Go**.
* Vérifier que le **téléphone et le PC soient sur le même réseau Wi-Fi**.

---

## Vérification du bon fonctionnement

* **Backend** : vérifier avec `docker ps` que l’API et MongoDB tournent.
* **Frontend** : l’application doit s’afficher et appeler l’API via `EXPO_PUBLIC_API_URL`.

---

## Explication rapide

* **Frontend (React Native + Expo)** : utilise des variables d’environnement statiques avec le préfixe `EXPO_PUBLIC_`.
* **Dev** → API locale + Expo Go / Web.
* **Prod** → API déployée + build mobile.

