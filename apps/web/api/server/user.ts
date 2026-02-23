import type { UserWithoutPassword } from "@workspace/lib/db/schema";
import { serverFetcher } from "../fetchers/server";

/**
 * Should be memoized by React. Any subsequent uses in for example page server components should hit a cache.
 */
export async function getUser(): Promise<UserWithoutPassword | null> {
  try {
    const { data, ok } = await serverFetcher<UserWithoutPassword>("/v1/users/me");
    return ok ? data : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
