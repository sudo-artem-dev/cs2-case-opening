# CS2 Case Opening  
Projet fil rouge de 3ème année en autonomie  
**Application mobile** + ⚙️ **Backend NestJS** + **MongoDB**  

Cette application simule un **système d’ouverture de caisses (case opening)** inspiré de **CS2**.  

---

## Prérequis  
Avant de commencer, assure-toi d’avoir installé :  
- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/install/)  
- Git  
---

## Installation du projet  

### Cloner le projet  
```bash
git clone https://github.com/<ton-username>/cs2-case-opening.git
cd cs2-case-opening
````

### Créer les fichiers d’environnement

```bash
cp .env.example .env       # Développement
cp .env.example .env.prod  # Production
```

* `.env` → développement (`NODE_ENV=development`)
* `.env.prod` → production (`NODE_ENV=production`, mots de passe réels, etc.)

---

## Lancement en développement (Docker)

Ce mode inclut :

* Hot reload pour l’API
* Mongo Express (UI web pour MongoDB)

### ▶️ Démarrer les conteneurs

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

### ▶️ Démarrer en arrière-plan

⚠️ **Important :** en prod, on utilise le fichier `.env.prod`.  
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
* ⚙️ **API NestJS** se connecte automatiquement à MongoDB via les variables définies dans `.env` ou `.env.prod`.
* En **développement**, tu peux explorer la base avec **Mongo Express** → [http://localhost:8081](http://localhost:8081).
* En **production**, seuls l’API et MongoDB tournent → plus **léger et sécurisé**.
