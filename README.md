# 🎬 RT2025 — Scraper Rotten Tomatoes + Dashboard interactif

## 📌 Présentation du projet

Ce projet a pour objectif de construire une chaîne complète de traitement de données autour des films Rotten Tomatoes 2025, en respectant les contraintes suivantes :

* Scraper un site web réel
* Stocker les données dans une base de données
* Créer une application web de visualisation
* Conteneuriser l’ensemble avec Docker
* Fournir une documentation technique et fonctionnelle

Le projet simule un mini pipeline de data engineering complet, de la collecte à la visualisation.

---

# 🧠 Architecture globale

Le système repose sur 3 services principaux :

1. Scraper (Scrapy)
   → récupère les données sur Rotten Tomatoes

2. MongoDB
   → stocke les données

3. Dashboard (Flask + JS)
   → lit la base et affiche les résultats

Flux de données :

Scrapy → MongoDB → Flask API → Frontend (JS)

---

# ⚙️ Choix techniques

## 🕷️ Scraping : Scrapy

Choisi car :

* Plus robuste que BeautifulSoup
* Gestion native des pipelines
* Gestion des délais (anti-ban)
* Architecture propre (spiders / pipelines)

Le scraper :

* Récupère la liste des films 2025
* Visite chaque page
* Extrait :

  * titre
  * tomatometer
  * audience score
  * URL

---

## 🗄️ Base de données : MongoDB

Choisi car :

* Adapté aux données semi-structurées
* Simple à connecter avec Python
* Facile à utiliser en Docker
* Flexible pour évoluer

Collection utilisée :

movies

---

## 🌐 Backend : Flask

Choisi car :

* Léger
* Rapide à mettre en place
* Parfait pour exposer une API locale
* Idéal pour projets académiques

Rôle :

* Se connecter à MongoDB
* Fournir les données au frontend

---

## 🎨 Frontend : HTML / CSS / JavaScript

Le frontend :

* Appelle l’API Flask
* Affiche :

  * Graphiques
  * Statistiques
  * Liste des films

Librairie graphique utilisée :
Chart.js

---

## 🐳 Conteneurisation : Docker

Docker permet :

* D’éviter les conflits de versions
* De reproduire le projet facilement
* De lancer tous les services ensemble

Conteneurs :

* mongo
* scraper
* dashboard

---

# 🚀 Comment lancer le projet

## 1) Prérequis

Installer :

* Docker Desktop
* Git

---

## 2) Lancement

À la racine du projet :

docker compose up --build

Cela démarre automatiquement :

* MongoDB
* Le scraper
* Le dashboard

---

## 3) Accès à l’application

Ouvrir :

[http://127.0.0.1:8050](http://127.0.0.1:8050)

---

# 🗃️ Vérifier les données

Ouvrir MongoDB :

docker exec -it rt2025_mongo mongosh

Puis :

use rt2025
db.movies.countDocuments()

---

# 📊 Fonctionnalités du dashboard

## Page "Vue d’ensemble"

* Statistiques globales

## Page "Graphiques"

* Distribution Tomatometer
* Distribution Audience Score

## Page "Films"

* Liste complète des films scrapés

---

# ⚠️ Difficultés rencontrées

## 1) Scraping dynamique

Problème :

* Rotten Tomatoes charge certaines données dynamiquement

Solution :

* Scraper les pages individuelles des films

---

## 2) Connexion MongoDB entre conteneurs

Problème :

* Le dashboard ne voyait pas les données

Cause :

* Mauvaise URL MongoDB

Solution :

Utiliser :

mongodb://mongo:27017

au lieu de :

localhost

---

## 3) Problème de port Flask

Problème :

* Flask tournait sur 5000
* Docker exposait 8050

Solution :

* Faire écouter Flask sur 8050

---

## 4) Données visibles dans Mongo mais pas dans l’app

Problème :

* Le frontend ne récupérait rien

Cause :

* Mauvaise connexion backend → Mongo

Solution :

* Corriger les variables d’environnement

---

## 5) Gestion des bins graphiques

Problème :

* Le graphique affichait "80–100" deux fois

Solution :

* Créer un bin spécifique pour "100 uniquement"

---

# 📈 Résultat

Le projet permet maintenant :

✔ Scraper automatiquement tous les films
✔ Stocker 200+ films en base
✔ Visualiser les données en temps réel
✔ Déployer en un seul docker compose

---

# 🧩 Améliorations possibles

* Recherche par titre
* Filtres par score
* Mise à jour automatique quotidienne
* Ajout d’autres années
* Export CSV

---

# 🏁 Conclusion

Ce projet met en place une chaîne complète de traitement de données :

Scraping → Stockage → API → Visualisation

Il couvre des compétences clés :

* Data scraping
* Backend Python
* Base de données NoSQL
* Frontend interactif
* Dockerisation

Ce type d’architecture est proche de ce qu’on retrouve dans de vrais projets data en production.

