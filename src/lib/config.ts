export const config = {
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    get redirectUri() {
      const base =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
      return `${base}/api/auth/spotify/callback`;
    },
    scopes: ["user-library-read", "playlist-read-private"],
    tokenUrl: "https://accounts.spotify.com/api/token",
    authorizeUrl: "https://accounts.spotify.com/authorize",
    apiBaseUrl: "https://api.spotify.com/v1",
  },
};
