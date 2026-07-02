import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────
// Every EXPO_PUBLIC_* variable the app needs must be declared here.
// Zod validates at runtime; TypeScript infers the types.

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url("EXPO_PUBLIC_API_URL must be a valid URL"),
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"], {
    message: "EXPO_PUBLIC_APP_ENV must be development | staging | production",
  }),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().min(1, "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is required"),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_SUBSCRIPTION_URL: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url("EXPO_PUBLIC_SUBSCRIPTION_URL must be a valid URL").optional(),
  ),
});

// ─── Parse ────────────────────────────────────────────────────────
// Expo inlines EXPO_PUBLIC_* into the JS bundle at build time via
// process.env.EXPO_PUBLIC_<NAME>.  No dotenv import is needed.

const result = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  EXPO_PUBLIC_SUBSCRIPTION_URL: process.env.EXPO_PUBLIC_SUBSCRIPTION_URL,
});

if (!result.success) {
  const formatted = result.error.issues
    .map((i) => `  ✗ ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  // Always throw – catches misconfigurations before anything else runs.
  throw new Error(
    `\n❌ Invalid environment variables:\n${formatted}\n\n` +
      "Hint: copy .env.example → .env and fill in the values, then restart the bundler.\n",
  );
}

// ─── Typed Export ─────────────────────────────────────────────────

const parsed = result.data;

export const env = {
  API_URL: parsed.EXPO_PUBLIC_API_URL,
  APP_ENV: parsed.EXPO_PUBLIC_APP_ENV,

  /** Google OAuth client IDs */
  GOOGLE_WEB_CLIENT_ID: parsed.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: parsed.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID: parsed.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,

  /** Subscription management web URL (undefined until the page is live) */
  SUBSCRIPTION_URL: parsed.EXPO_PUBLIC_SUBSCRIPTION_URL,

  /** true when APP_ENV === "development" */
  isDev: parsed.EXPO_PUBLIC_APP_ENV === "development",
  /** true when APP_ENV === "production" */
  isProd: parsed.EXPO_PUBLIC_APP_ENV === "production",
  /** true when APP_ENV === "staging" */
  isStaging: parsed.EXPO_PUBLIC_APP_ENV === "staging",
} as const;
