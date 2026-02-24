import type { UserWithoutPassword } from "@workspace/lib/db/schema";
import { forbidden } from "next/navigation";
import { getUser } from "./user";

export async function requireUser(): Promise<UserWithoutPassword> {
  const user = await getUser();
  if (!user) {
    forbidden();
  }
  return user;
}
