Tu es un ingénieur software senior expert en :
- Next.js
- Node.js
- OAuth2
- Spotify API
- Apple Music API (MusicKit)
- Prisma
- PostgreSQL
- Vercel deployment
- SaaS architecture

Je veux créer un site web qui permet de transférer les "Liked Songs" et playlists de Spotify vers Apple Music.

Le site doit fonctionner comme SongShift ou TuneMyMusic.

IMPORTANT
Le projet doit être prêt pour :

1) développement local
2) déploiement sur Vercel

Je n’ai PAS encore l’URL de production.

Donc le projet doit fonctionner avec :

LOCAL
http://localhost:3000

PRODUCTION
une URL Vercel future (ex: https://mon-app.vercel.app)

Les redirect URIs OAuth doivent être configurables via variables d’environnement.

OBJECTIF

Créer une web app qui :

1. Connecte le compte Spotify d’un utilisateur
2. Récupère ses "Liked Songs"
3. Connecte son compte Apple Music
4. Recherche chaque titre dans Apple Music
5. Crée une playlist Apple Music
6. Ajoute les morceaux dans cette playlist

Je veux un projet complet prêt à lancer.

STACK TECHNIQUE

Frontend
- Next.js 14 (App Router)
- React
- Typescript
- TailwindCSS

Backend
- API routes Next.js

Auth
- Spotify OAuth2
- Apple Music MusicKit JS

Database
- PostgreSQL
- Prisma ORM

Deployment
- Vercel

FONCTIONNALITÉS

Landing page
bouton :

"Connect Spotify"

Authentification Spotify

Scopes nécessaires :
user-library-read
playlist-read-private

Une fois connecté :

récupérer :

GET /v1/me/tracks

gérer la pagination.

Connexion Apple Music

via MusicKit JS.

Matching des chansons

Pour chaque track Spotify :

extraire :

- title
- artist
- album

Puis utiliser Apple Music API :

/v1/catalog/{storefront}/search

Implémenter un matching intelligent :

score basé sur

- similarité titre
- similarité artiste
- similarité album

Utiliser Levenshtein distance.

Créer fonction :

matchTrack(spotifyTrack)

Retourne :

- meilleur résultat Apple Music
- score de matching

Création playlist Apple Music

Nom :

"Imported from Spotify"

Ajouter toutes les chansons trouvées.

Afficher UI :

- progression
- nombre de chansons trouvées
- chansons non trouvées

GESTION DES TOKENS

Spotify

- access token
- refresh token

Apple Music

- developer token
- user token

Ne jamais exposer developer token côté client.

DATABASE

Créer tables :

users
spotify_tokens
apple_music_tokens
imports
tracks

STRUCTURE DU PROJET

/music-transfer

/app
/components
/lib
/services
/prisma
/api

Créer fichiers :

spotifyService.ts
appleMusicService.ts
matchingService.ts

DEV LOCAL

Le projet doit fonctionner avec :

npm install
npm run dev

sur Mac et Windows.

ENV VARIABLES

Créer fichier :

.env.local

avec :

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
APPLE_MUSIC_KEY_ID=
APPLE_MUSIC_TEAM_ID=
APPLE_MUSIC_PRIVATE_KEY=

VERCEL

Préparer le projet pour :

vercel deploy

et expliquer :

1. comment ajouter variables d’environnement
2. comment configurer redirect URIs Spotify après déploiement
3. comment générer l’Apple Music developer token

DONNE MOI :

1. architecture complète du projet
2. tous les fichiers
3. le code complet
4. configuration Prisma
5. configuration OAuth Spotify
6. configuration Apple Music MusicKit
7. instructions Mac + Windows
8. étapes déploiement Vercel
9. gestion erreurs API
10. gestion rate limits
11. retry automatique

BONUS

Ajouter :

- import playlists Spotify
- barre de progression temps réel
- logs
- dashboard simple historique imports

Le projet doit être structuré comme une vraie application SaaS prête à être mise en production.