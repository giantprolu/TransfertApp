export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class SpotifyApiError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, "SPOTIFY_API_ERROR");
    this.name = "SpotifyApiError";
  }
}

export class AppleMusicApiError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, "APPLE_MUSIC_API_ERROR");
    this.name = "AppleMusicApiError";
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class RateLimitError extends AppError {
  public retryAfter: number;

  constructor(retryAfter: number = 1) {
    super(`Rate limited. Retry after ${retryAfter} seconds`, 429, "RATE_LIMIT");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}
