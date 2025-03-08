# Strava Runs Visualizer

Une application web qui affiche tous vos parcours de course enregistrés sur Strava sur une carte interactive en plein écran.

## Fonctionnalités

- Authentification avec Strava via OAuth 2.0
- Affichage de tous vos parcours de course sur une carte interactive
- Filtrage des activités par type (course, vélo, etc.)
- Filtrage des activités par année
- Statistiques détaillées sur vos activités (distance totale, dénivelé, temps total)
- Sélection d'une activité spécifique pour voir son parcours en détail
- Différents styles de carte disponibles (clair, sombre)
- Interface responsive pour mobile et desktop
- Affichage/masquage de la barre latérale pour une vue plein écran de la carte

## Stack technique

- ViteJS comme bundler/environnement de développement
- React pour le framework frontend
- Tailwind CSS pour le styling
- Leaflet pour l'affichage et la gestion de la carte
- Mapbox pour les styles de carte
- API Strava pour la récupération des données

## Prérequis

- Node.js (v16 ou supérieur)
- Un compte Strava
- Une application Strava enregistrée (pour obtenir les identifiants API)
- Un compte Mapbox (pour obtenir un token d'accès)

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
VITE_STRAVA_CLIENT_ID=votre_client_id_strava
VITE_STRAVA_CLIENT_SECRET=votre_client_secret_strava
VITE_MAPBOX_TOKEN=votre_token_mapbox
```

Pour obtenir ces valeurs :
1. **VITE_STRAVA_CLIENT_ID** et **VITE_STRAVA_CLIENT_SECRET** : Créez une application sur la [console développeur Strava](https://www.strava.com/settings/api)
2. **VITE_MAPBOX_TOKEN** : Créez un compte sur [Mapbox](https://www.mapbox.com/) et générez un token d'accès public

## Configuration

1. Créez une application sur la [console développeur Strava](https://www.strava.com/settings/api)
2. Notez votre Client ID et Client Secret
3. Configurez l'URL de callback pour l'authentification OAuth à `http://localhost:5173/auth/callback` (pour le développement)
4. Créez un compte sur [Mapbox](https://www.mapbox.com/) et générez un token d'accès public

## Installation

1. Clonez ce dépôt
   ```bash
   git clone https://github.com/votre-username/strava-visualizer.git
   cd strava-visualizer
   ```

2. Installez les dépendances
   ```bash
   npm install
   ```

3. Configurez vos variables d'environnement
   Créez un fichier `.env` à la racine du projet avec les variables mentionnées ci-dessus.

4. Lancez l'application en mode développement
   ```bash
   npm run dev
   ```

5. Ouvrez votre navigateur à l'adresse [http://localhost:5173](http://localhost:5173)

## Déploiement

Pour construire l'application pour la production :

```bash
npm run build
```

Les fichiers générés seront dans le dossier `dist` et pourront être déployés sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages, etc.).

N'oubliez pas de mettre à jour l'URL de callback dans votre application Strava pour qu'elle corresponde à votre URL de production.

## Considérations de sécurité

Cette application stocke les tokens d'accès dans le localStorage du navigateur. Bien que cela soit suffisant pour une application personnelle, ce n'est pas recommandé pour une application destinée à un large public. Dans ce cas, il serait préférable d'implémenter un backend pour gérer les tokens de manière plus sécurisée.

## Licence

MIT
