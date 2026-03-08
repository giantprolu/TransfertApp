"use client";

import { useState, useEffect } from "react";

interface AppleMusicConnectButtonProps {
  onConnected: () => void;
}

declare global {
  interface Window {
    MusicKit: {
      configure: (config: {
        developerToken: string;
        app: { name: string; build: string };
      }) => Promise<void>;
      getInstance: () => {
        authorize: () => Promise<string>;
        isAuthorized: boolean;
        musicUserToken: string;
      };
    };
  }
}

export default function AppleMusicConnectButton({
  onConnected,
}: AppleMusicConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musicKitLoaded, setMusicKitLoaded] = useState(false);

  // Load MusicKit JS
  useEffect(() => {
    if (typeof window !== "undefined" && !window.MusicKit) {
      const script = document.createElement("script");
      script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        setMusicKitLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.MusicKit) {
      setMusicKitLoaded(true);
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get developer token from our API
      const tokenRes = await fetch("/api/auth/apple-music/token");
      const { token: developerToken } = await tokenRes.json();

      if (!developerToken) {
        throw new Error("Failed to get developer token");
      }

      // Configure MusicKit
      await window.MusicKit.configure({
        developerToken,
        app: {
          name: "Music Transfer",
          build: "1.0.0",
        },
      });

      // Authorize user
      const music = window.MusicKit.getInstance();
      await music.authorize();

      if (!music.isAuthorized) {
        throw new Error("Authorization failed");
      }

      // Send user token to our API
      const saveRes = await fetch("/api/auth/apple-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: music.musicUserToken }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save Apple Music token");
      }

      onConnected();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading || !musicKitLoaded}
        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FC3C44] to-[#FA2D55] hover:from-[#FF4F58] hover:to-[#FF3D66] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.8.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.104 1.604-.318 2.31-.768 1.053-.67 1.752-1.612 2.13-2.79.166-.518.244-1.05.283-1.59.033-.413.053-.828.06-1.244V6.124zM17.34 17.17c-.31.47-.79.705-1.3.705-.24 0-.49-.053-.73-.172-2.37-1.16-5.06-1.34-7.68-.67a4.6 4.6 0 01-.35.083c-.61.116-1.1-.32-1.15-.87a.934.934 0 01.73-1.02c3.06-.78 6.21-.58 9 .78.6.31.85.95.48 1.16zm1.12-2.96a1.21 1.21 0 01-1.63.56c-2.63-1.62-6.64-2.09-9.76-1.14-.464.14-.96-.13-1.1-.592a1.133 1.133 0 01.59-1.37c3.55-1.08 7.96-.555 10.99 1.3.38.218.55.71.31 1.24zm.1-3.083c-3.15-1.87-8.35-2.04-11.36-1.13-.483.146-1-.13-1.15-.61-.146-.482.13-.99.613-1.14 3.44-1.04 9.17-.84 12.79 1.3.443.263.59.85.326 1.29-.264.444-.85.59-1.22.29z" />
        </svg>
        {loading
          ? "Connecting..."
          : !musicKitLoaded
          ? "Loading MusicKit..."
          : "Connect Apple Music"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
