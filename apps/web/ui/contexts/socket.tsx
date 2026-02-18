"use client";

import { createContext, useContext, useEffect, useEffectEvent, type PropsWithChildren } from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

interface SocketProviderProps extends PropsWithChildren {
  socketUrl: string;
}

export function SocketProvider({ children, socketUrl }: SocketProviderProps) {
  const socket = io(socketUrl, { transports: ["websocket", "polling"], reconnection: true });
  const onDisconnect = useEffectEvent(() => socket.disconnect());

  useEffect(() => {
    return () => {
      onDisconnect();
    };
  }, [onDisconnect]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within SocketProvider.");
  }
  return socket;
}
