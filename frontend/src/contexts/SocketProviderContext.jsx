import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState();
  const { currentUser } = useAuth();

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      query: { id: currentUser.uid },
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, [currentUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
