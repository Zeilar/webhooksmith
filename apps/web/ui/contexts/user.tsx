"use client";

import type { User } from "@workspace/lib/db/schema";
import { createContext, useContext, type PropsWithChildren } from "react";

export type CurrentUser = Omit<User, "password">;

const UserContext = createContext<CurrentUser | null>(null);

interface UserProviderProps extends PropsWithChildren {
  user: CurrentUser | null;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): CurrentUser | null {
  return useContext(UserContext);
}
