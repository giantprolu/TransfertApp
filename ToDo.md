Tu es un ingénieur software senior expert en :

- Next.js
- Node.js
- Spotify API
- web scraping léger
- SaaS architecture
- Vercel deployment

IMPORTANT

Je développe une web app qui transfère les "Liked Songs" Spotify vers Apple Music.

MAIS je ne veux PAS utiliser l’Apple Music API car je ne veux pas payer l’Apple Developer Program.

Le projet doit donc fonctionner SANS :

- Apple Music API
- MusicKit
- Apple Developer account

L’objectif est de créer un outil gratuit qui aide l’utilisateur à migrer sa musique Spotify vers Apple Music.

STACK

Frontend
Next.js 14
React
Typescript
Tailwind

Backend
Next.js API routes

Deployment
Vercel

DEV

Mac + Windows

npm install
npm run dev

FONCTIONNEMENT

1. L’utilisateur connecte Spotify
2. On récupère ses liked songs
3. On extrait :

- title
- artist
- album

4. On génère pour chaque chanson :

un lien Apple Music search :

https://music.apple.com/search?term=TITLE+ARTIST

Exemple :

https://music.apple.com/search?term=daft+punk+get+lucky

5. L’utilisateur peut cliquer pour ouvrir la chanson dans Apple Music.

EXPORT

Créer aussi :

1. export JSON
2. export CSV
3. export playlist format texte

CSV exemple :

title,artist
Get Lucky,Daft Punk
Blinding Lights,The Weeknd

INTERFACE

Page 1

Landing page

bouton :

Connect Spotify

Page 2

Login Spotify OAuth

Scopes :

user-library-read
playlist-read-private

Page 3

Récupération des liked songs

Endpoint :

GET https://api.spotify.com/v1/me/tracks

Pagination 50 items.

Afficher :

- titre
- artiste
- album

Page 4

Boutons :

Export CSV
Export JSON
Open Apple Music links

STRUCTURE PROJET

/music-transfer

/app
/components
/api
/lib
/services

Créer fichiers :

spotifyService.ts
exportService.ts
appleSearchService.ts

SPOTIFY

Configurer OAuth2.

Variables env :

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000

Créer callback :

/api/auth/spotify/callback

DEPLOIEMENT

Préparer projet pour Vercel.

Expliquer :

- comment configurer variables env
- comment ajouter redirect URI Spotify
- comment déployer

BONUS

Ajouter :

- import playlists Spotify
- barre de progression
- recherche dans la liste
- bouton "ouvrir toutes les chansons Apple Music"

Le projet doit être simple, propre et prêt pour production.