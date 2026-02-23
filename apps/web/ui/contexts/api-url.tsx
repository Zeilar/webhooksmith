"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

const ApiUrlContext = createContext<string | null>(null);

export function ApiUrlProvider({ apiUrl, children }: PropsWithChildren<{ apiUrl: string }>) {
  return <ApiUrlContext.Provider value={apiUrl}>{children}</ApiUrlContext.Provider>;
}

export function useApiUrl(): string {
  const apiUrl = useContext(ApiUrlContext);
  if (!apiUrl) {
    throw new Error("ApiUrlProvider is missing from the component tree.");
  }
  return apiUrl;
}
