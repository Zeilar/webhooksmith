import { cookies } from "next/headers";
import { fetcher, type FetcherResult } from "./fetcher";

export async function serverFetcher<T = unknown>(
  uri: `/${string}`,
  { headers, ...options }: RequestInit = {},
): Promise<FetcherResult<T>> {
  return fetcher(`${process.env.API_URL}${uri}`, {
    headers: {
      ...headers,
      cookie: `${await cookies()}`,
    },
    ...options,
  });
}
