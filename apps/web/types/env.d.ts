export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      API_URL: string;
      SOCKET_URL: string;
      NEXT_TELEMETRY_DISABLED: string;
    }
  }
}
