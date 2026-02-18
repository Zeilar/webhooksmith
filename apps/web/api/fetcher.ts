export interface FetcherResult<T = unknown> {
  data: T | null;
  ok: boolean;
  status: number;
  statusText: string;
}

export async function fetcher<T = unknown>(
  uri: `/${string}`,
  { headers, ...options }: RequestInit = {},
): Promise<FetcherResult<T>> {
  const API_URL = "https://api-webhooksmith.angelin.foo";
  const res = await fetch(`${API_URL}${uri}`, {
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include",
    ...options,
  });
  let data = null as T;
  if (res.headers.get("Content-Type")?.includes("application/json")) {
    data = await res.json();
  }
  return { data, ok: res.ok, status: res.status, statusText: res.statusText };
}
