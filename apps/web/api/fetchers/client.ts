"use client";

import { fetcher, type FetcherResult } from "./fetcher";

export type ClientFetcher = <T = unknown>(uri: `/${string}`, options?: RequestInit) => Promise<FetcherResult<T>>;

export function useFetcher(): ClientFetcher {
  return (uri: `/${string}`, options?: RequestInit) => fetcher(`/api${uri}`, options);
}
