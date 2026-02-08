#  Scraping des films Rotten Tomatoes 2025 & Dashboard interactif

##  Présentation du projet

Ce projet a été réalisé dans le cadre du module de Data Engineering.
L’objectif était de construire une chaîne complète de traitement de données, depuis la récupération des informations sur un site web jusqu’à leur visualisation dans une application web.

Pour cela, j’ai choisi de travailler sur le site Rotten Tomatoes en récupérant les films sortis en 2025 ainsi que leurs scores critiques et spectateurs.

Le projet repose sur trois étapes principales :
scraper les données, les stocker dans une base de données, puis les afficher via un dashboard interactif.

---

##  Démarche et choix techniques

J’ai utilisé Scrapy pour réaliser le scraping car il permet de structurer proprement le code et de parcourir facilement un grand nombre de pages.
Le spider récupère d’abord la liste des films 2025, puis visite chaque page individuelle afin d’extraire les informations importantes comme le titre, le score critique (Tomatometer) et le score des spectateurs (Audience Score).

Les données sont ensuite stockées dans une base MongoDB.
Ce choix s’est imposé naturellement car MongoDB est très bien adapté aux données issues du web scraping, qui sont souvent semi-structurées et évolutives.

Pour la partie visualisation, j’ai développé une application web en Python avec Flask.
Le backend se connecte à MongoDB pour récupérer les données et les transmettre au frontend, qui affiche des graphiques et une liste des films.

Enfin, l’ensemble du projet a été conteneurisé avec Docker afin de pouvoir être lancé facilement sur n’importe quelle machine.

---

##  Architecture du projet

Le projet fonctionne selon un flux simple :

Le scraper collecte les données → les enregistre dans MongoDB → le dashboard lit la base → les données sont affichées dans l’interface web.

Trois conteneurs sont utilisés :

* MongoDB (base de données)
* Scraper (Scrapy)
* Dashboard (Flask + JavaScript)

---

##  Comment lancer le projet

Une fois Docker installé, il suffit de se placer à la racine du projet et d’exécuter :

docker compose up --build

Cette commande lance automatiquement :

* la base de données
* le scraping
* l’application web

L’interface est ensuite accessible à l’adresse :

[http://127.0.0.1:8050](http://127.0.0.1:8050)

---

##  Résultats obtenus

Le dashboard constitue la seconde partie centrale du projet. Il exploite directement les données collectées par le spider afin de produire des visualisations interactives permettant d’analyser les films sortis en 2025.

### Fonctionnement technique

**Connexion à la base de données**
L’application web se connecte automatiquement à la même base MongoDB que celle utilisée par le scraper. Elle récupère les films stockés dans la collection `movies`, contenant notamment le titre, le score critique et le score spectateur.

**Récupération et traitement des données**
Les données sont extraites depuis MongoDB puis organisées et triées afin de pouvoir être utilisées pour les visualisations. Les films sont notamment analysés selon leurs scores critiques (Tomatometer) et leurs scores spectateurs (Audience Score).

**Création des visualisations**
Plusieurs graphiques sont générés à partir des données récupérées. Le dashboard permet notamment d’afficher :

* la distribution des scores critiques sous forme d’histogramme,
* la distribution des scores spectateurs,
* une vue globale permettant de comparer la perception des films par la critique et par le public.

Ces graphiques offrent une lecture rapide et intuitive des tendances sur les films de 2025.

**Interface utilisateur**
L’interface web permet de naviguer facilement entre différentes vues :

* une page d’aperçu général,
* des graphiques statistiques,
* une liste des films scrapés.

Les données sont chargées dynamiquement depuis le backend, ce qui permet une mise à jour automatique si la base MongoDB évolue.

**Exécution de l’application**
L’application fonctionne via un serveur web local lancé dans un conteneur Docker. L’utilisateur peut ainsi accéder aux visualisations directement depuis son navigateur et interagir avec les données collectées.

---

## ️ Difficultés rencontrées

L’une des principales difficultés a été liée au scraping du site Rotten Tomatoes.
Certaines informations ne sont pas directement visibles dans le HTML classique et sont intégrées sous forme de données structurées. Il a fallu explorer la page en détail pour trouver les bonnes variables à extraire.

Un autre problème important concernait la connexion entre les conteneurs Docker et MongoDB.
Au départ, l’application n’arrivait pas à récupérer les données car elle tentait de se connecter à "localhost".
La solution a été d’utiliser le nom du service Docker ("mongo") comme adresse de connexion.

J’ai également rencontré un souci où les données étaient bien présentes dans la base mais n’apparaissaient pas dans le dashboard.
Cela venait d’une mauvaise configuration de la connexion entre le backend Flask et MongoDB.

---

##  Améliorations possibles

Le projet pourrait être enrichi de plusieurs façons :

* ajouter un moteur de recherche par film
* ajouter des filtres par score
* scraper d’autres années
* ajouter des statistiques comparatives plus avancées

---

##  Conclusion

Ce projet m’a permis de mettre en pratique plusieurs compétences importantes en data engineering :

* scraping de données web
* manipulation de bases NoSQL
* création d’API backend
* visualisation de données
* conteneurisation avec Docker

Il constitue une chaîne complète de traitement de données, de la collecte jusqu’à l’affichage.

