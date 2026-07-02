// ─── Logger ───────────────────────────────────────────────────────
// Centralized, dev-only logging utility.
// Every log line is prefixed with the feature tag: [AUTH], [API], etc.
// Production builds are completely silent (zero runtime cost).

type LogLevel = "log" | "warn" | "error";

function print(level: LogLevel, feature: string, message: string, data?: unknown): void {
  if (!__DEV__) return;

  const tag = `[${feature.toUpperCase()}]`;
  const args: unknown[] = [`${tag} ${message}`];
  if (data !== undefined) args.push(data);

  switch (level) {
    case "log":
      console.log(...args);
      break;
    case "warn":
      console.warn(...args);
      break;
    case "error":
      console.error(...args);
      break;
  }
}

export const logger = {
  log(feature: string, message: string, data?: unknown): void {
    print("log", feature, message, data);
  },
  warn(feature: string, message: string, data?: unknown): void {
    print("warn", feature, message, data);
  },
  error(feature: string, message: string, data?: unknown): void {
    print("error", feature, message, data);
  },
};
