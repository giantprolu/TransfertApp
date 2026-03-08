import { logger } from "./logger";
import { RateLimitError } from "./errors";

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      let delay: number;

      if (error instanceof RateLimitError) {
        delay = error.retryAfter * 1000;
      } else {
        delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      }

      logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
        error: (error as Error).message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
