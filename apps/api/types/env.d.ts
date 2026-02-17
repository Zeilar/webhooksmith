export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DB_LOGGING?: "true" | "false";

      // Logging / runtime
      LOG_LEVEL?: "error" | "warn" | "log" | "debug" | "verbose";
      PORT?: string;
      NODE_ENV?: "development" | "test" | "production";

      WEB_HOST: string;

      // App URL
      NEXT_PUBLIC_APP_URL?: string;

      ALLOWED_ORIGINS: string;
      COOKIE_DOMAIN: string;
      SESSION_TTL: string;
      INITIAL_USERNAME: string;
      INITIAL_PASSWORD: string;
    }
  }
}
