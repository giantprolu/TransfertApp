# Music Transfer - Spotify to Apple Music

Transfer your Liked Songs and playlists from Spotify to Apple Music with intelligent song matching.

## Features

- **Liked Songs Transfer** - Import all your Spotify Liked Songs to Apple Music
- **Playlist Transfer** - Select and transfer individual Spotify playlists
- **Smart Matching** - Intelligent song matching using Levenshtein distance on title, artist & album
- **Real-time Progress** - Live progress bar with matched/unmatched track counts
- **Import History** - Dashboard showing all past transfers with details
- **Automatic Token Refresh** - Spotify tokens are refreshed automatically
- **Rate Limit Handling** - Retry logic with exponential backoff

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Auth**: Spotify OAuth2, Apple Music MusicKit JS
- **Database**: PostgreSQL + Prisma ORM
- **Deployment**: Vercel

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** database (local or hosted)
- **Spotify Developer Account**
- **Apple Developer Account** (for Apple Music API)

---

## Getting Started (Local Development)

### 1. Install Dependencies

```bash
cd music-transfer
npm install
```

### 2. Set up PostgreSQL

Make sure PostgreSQL is running locally. Create a database:

```bash
createdb music_transfer
```

Or via psql:
```sql
CREATE DATABASE music_transfer;
```

### 3. Configure Environment Variables

Edit `.env.local` and fill in your values:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_transfer
```

### 4. Set up Spotify OAuth

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add redirect URI: `http://localhost:3000/api/auth/spotify/callback`
4. Copy Client ID and Client Secret to `.env.local`

### 5. Set up Apple Music

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles** > **Keys**
3. Create a new key with **MusicKit** enabled
4. Download the `.p8` private key file
5. Note the **Key ID** and your **Team ID**
6. Convert the private key to a single-line format:

   **Mac/Linux:**
   ```bash
   awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' AuthKey_XXXXX.p8
   ```

   **Windows PowerShell:**
   ```powershell
   (Get-Content AuthKey_XXXXX.p8 -Raw) -replace "`r`n", "\n" -replace "`n", "\n"
   ```
7. Paste the result as `APPLE_MUSIC_PRIVATE_KEY` in `.env.local`

### 6. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
music-transfer/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # OAuth endpoints
│   │   │   ├── spotify/       # Spotify data endpoints
│   │   │   ├── transfer/      # Transfer orchestration
│   │   │   └── imports/       # Import history
│   │   ├── dashboard/         # Dashboard page
│   │   ├── transfer/[id]/     # Transfer progress page
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── components/            # React UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Config, errors, logging, retry
│   └── services/              # Spotify, Apple Music, Matching
├── .env.local
├── package.json
└── README.md
```

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/music-transfer.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add the following **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` |
| `SPOTIFY_CLIENT_ID` | Your Spotify Client ID |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify Client Secret |
| `APPLE_MUSIC_KEY_ID` | Your Apple Music Key ID |
| `APPLE_MUSIC_TEAM_ID` | Your Apple Developer Team ID |
| `APPLE_MUSIC_PRIVATE_KEY` | Your Apple Music private key (single-line with `\n`) |
| `DATABASE_URL` | Your PostgreSQL connection string |

### 3. Set up PostgreSQL for Production

Recommended options:
- **Vercel Postgres** (built-in)
- **Supabase** (free tier available)
- **Neon** (serverless Postgres, free tier)
- **Railway** (simple setup)

### 4. Update Spotify Redirect URI

After deployment, go to your Spotify app settings and add:
```
https://your-app.vercel.app/api/auth/spotify/callback
```

### 5. Run Production Migrations

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### 6. Deploy

```bash
vercel deploy --prod
```

Or push to `main` for automatic deploys.

---

## Matching Algorithm

| Criterion | Weight |
|-----------|--------|
| Title similarity | 40% |
| Artist similarity | 40% |
| Album similarity | 20% |

- **Levenshtein distance** for string similarity
- Normalizes strings (removes feat., remix, brackets, special chars)
- Multiple search queries for better results
- Threshold: **60%** match score required
- Early exit at **85%** confidence

---

## Rate Limits & Error Handling

| API | Strategy |
|-----|----------|
| Spotify | Exponential backoff + Retry-After header |
| Apple Music | 150-200ms delay between requests + backoff |

- All API calls use `withRetry()` (max 3 retries, exponential backoff)
- Spotify tokens auto-refresh when expired
- Failed tracks are logged individually and don't stop the transfer
- Import status tracks progress in the database

---

## License

MIT
