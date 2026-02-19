import type { UserWithoutPassword } from "@workspace/lib/db/schema";
import { cookies } from "next/headers";
import { fetcher } from "../fetcher";

/**
 * Should be memoized by React. Any subsequent uses in for example page server components should hit a cache.
 */
export async function getUser(): Promise<UserWithoutPassword | null> {
  try {
    const { data, ok } = await fetcher<UserWithoutPassword>("/v1/users/me", {
      headers: { cookie: `${await cookies()}` },
    });
    return ok ? data : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
