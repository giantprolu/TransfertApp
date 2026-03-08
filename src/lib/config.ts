export const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/spotify/callback`,
    scopes: ["user-library-read", "playlist-read-private"],
    tokenUrl: "https://accounts.spotify.com/api/token",
    authorizeUrl: "https://accounts.spotify.com/authorize",
    apiBaseUrl: "https://api.spotify.com/v1",
  },

  appleMusic: {
    keyId: process.env.APPLE_MUSIC_KEY_ID || "",
    teamId: process.env.APPLE_MUSIC_TEAM_ID || "",
    privateKey: process.env.APPLE_MUSIC_PRIVATE_KEY || "",
  },
};
