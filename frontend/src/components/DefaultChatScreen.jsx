import React, { useState, useEffect } from "react";
import LoadingSpinner from "./Spinner.jsx";
import { useChat } from "../contexts/ChatContext";

export default function DefaultChatScreen() {
  const [loading, setLoading] = useState(true);
  const { fetchChatList } = useChat();
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchChatList();
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) return <LoadingSpinner />;
  return <h1>Виберіть чат для спілкування</h1>;
}
