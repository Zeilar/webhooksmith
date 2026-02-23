import { serverFetcher } from "../fetchers/server";

export async function getDbHealth(): Promise<boolean> {
  try {
    const { ok } = await serverFetcher("/v1/health/db");
    return ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
