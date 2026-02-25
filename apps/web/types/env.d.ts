export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      WEB_URL: string;
      API_URL: string;
      SOCKET_URL: string;
      NEXT_TELEMETRY_DISABLED: string;
    }
  }
}
