# Strava Runs Visualizer

Une application web qui affiche tous vos parcours de course enregistrés sur Strava sur une carte interactive en plein écran.

## Fonctionnalités

- Authentification avec Strava via OAuth 2.0
- Affichage de tous vos parcours de course sur une carte interactive
- Filtrage des activités par type (course, vélo)
- Statistiques sur vos activités (distance totale, dénivelé, etc.)
- Interface responsive pour mobile et desktop

## Stack technique

- ViteJS comme bundler/environnement de développement
- React pour le framework frontend
- Tailwind CSS pour le styling
- Leaflet pour l'affichage et la gestion de la carte
- API Strava pour la récupération des données

## Prérequis

- Node.js (v16 ou supérieur)
- Un compte Strava
- Une application Strava enregistrée (pour obtenir les identifiants API)

## Configuration

1. Créez une application sur la [console développeur Strava](https://www.strava.com/settings/api)
2. Notez votre Client ID et Client Secret
3. Configurez l'URL de callback pour l'authentification OAuth à `http://localhost:5173/auth/callback` (pour le développement)

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

3. Configurez vos identifiants Strava
   Ouvrez le fichier `src/services/strava.ts` et remplacez les valeurs suivantes :
   ```typescript
   const STRAVA_CLIENT_ID = 'VOTRE_CLIENT_ID';
   const STRAVA_CLIENT_SECRET = 'VOTRE_CLIENT_SECRET';
   ```

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
