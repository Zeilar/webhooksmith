"use client";

import { fetcher, type FetcherFn } from "./fetcher";
import { useApiUrl } from "@/ui/contexts";

export function useFetcher(): FetcherFn {
  const apiUrl = useApiUrl();
  return (uri, options) => fetcher(apiUrl, uri, options);
}
