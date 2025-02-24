import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const PROTOCOL = import.meta.env.VITE_PROTOCOL;
const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(`${PROTOCOL}://${HOST}:${PORT}`, {
      query: { id: currentUser.uid },
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave-chat", currentUser.uid);
      newSocket.off();
      newSocket.close();
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
