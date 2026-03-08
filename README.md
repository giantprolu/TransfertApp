# Music Transfer — Spotify → Apple Music

Transfer your Spotify Liked Songs and playlists to Apple Music.  
Generates Apple Music search links + export CSV/JSON/Text — **no Apple Developer account required**.

## Features

- Spotify OAuth2 login
- Fetch all Liked Songs (paginated)
- Import any Spotify playlist
- Apple Music search links per track
- Export CSV / JSON / Text
- Search / filter tracks
- Progress bar while loading
- "Open all in Apple Music" button
- Vercel-ready (no database needed)

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, TypeScript, Tailwind CSS v4
- **Spotify OAuth2** (user-library-read, playlist-read-private)
- **Vercel** deployment

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Get Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set the Redirect URI to `http://localhost:3000/api/auth/spotify/callback`
4. Copy the Client ID and Client Secret into `.env.local`

## How It Works

1. User clicks **Connect Spotify** → OAuth2 login
2. App fetches Liked Songs (or any playlist) via Spotify API
3. For each track, generates an Apple Music search link:
   `https://music.apple.com/search?term=TITLE+ARTIST`
4. User can:
   - Click individual links to open in Apple Music
   - **Open all** links at once
   - **Export** as CSV, JSON, or plain text

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── songs/page.tsx        # Tracks list + export + links
│   └── api/
│       ├── auth/spotify/     # OAuth flow
│       ├── spotify/tracks/   # Liked songs endpoint
│       ├── spotify/playlists/# Playlists + playlist tracks
│       └── export/           # CSV/JSON/Text export
├── lib/
│   └── config.ts             # App config + env vars
└── services/
    ├── spotifyService.ts     # Spotify API client
    ├── appleSearchService.ts # Apple Music link generator
    └── exportService.ts      # CSV/JSON/Text formatters
```

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_BASE_URL` → `https://your-app.vercel.app`
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Add `https://your-app.vercel.app/api/auth/spotify/callback` as a Redirect URI in Spotify Developer Dashboard
5. Deploy!

## License

MIT
