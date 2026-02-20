export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DB_HOST: string;
      DB_PORT?: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_LOGGING?: "true" | "false";

      // API
      NODE_ENV?: "development" | "test" | "production";
      LOG_LEVEL?: "error" | "warn" | "log" | "debug" | "verbose";
      PORT?: string;
      WEB_HOST: string;
      ALLOWED_ORIGINS: string;
      COOKIE_DOMAIN: string;
      SESSION_TTL: string;

      INITIAL_USERNAME: string;
      INITIAL_PASSWORD: string;
    }
  }
}
