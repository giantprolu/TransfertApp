type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case "error":
      console.error(prefix, message, data ?? "");
      break;
    case "warn":
      console.warn(prefix, message, data ?? "");
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(prefix, message, data ?? "");
      }
      break;
    default:
      console.log(prefix, message, data ?? "");
  }
}

export const logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
  debug: (message: string, data?: unknown) => log("debug", message, data),
};
