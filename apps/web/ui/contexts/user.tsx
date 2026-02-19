"use client";

import type { UserWithoutPassword } from "@workspace/lib/db/schema";
import { createContext, useContext, type PropsWithChildren } from "react";

const UserContext = createContext<UserWithoutPassword | null>(null);

interface UserProviderProps extends PropsWithChildren {
  user: UserWithoutPassword | null;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): UserWithoutPassword | null {
  return useContext(UserContext);
}
