export interface FetcherResult<T = unknown> {
  data: T | null;
  ok: boolean;
  status: number;
  statusText?: string;
}

export async function fetcher<T = unknown>(
  url: string,
  { headers, ...options }: RequestInit = {},
): Promise<FetcherResult<T>> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...headers },
      credentials: "include",
      ...options,
    });
    let data = null as T;
    if (res.headers.get("Content-Type")?.includes("application/json")) {
      data = await res.json();
    }
    return { data, ok: res.ok, status: res.status, statusText: res.statusText };
  } catch (error) {
    console.error(error);
    return { data: null, ok: false, status: 500 };
  }
}
