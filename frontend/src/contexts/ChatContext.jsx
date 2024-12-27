import React, { useContext, useState, createContext } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketProviderContext";
import axios from "axios";

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const socket = useSocket();
  const { currentUser, token } = useAuth();

  async function fetchChatList() {
    try {
      const result = await axios.get("http://localhost:5000/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(result.data);

      setChatList(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchOrCreateChat(receiver_id, sender_id) {
    const chat_id = [receiver_id, sender_id]
      .sort((a, b) => a.localeCompare(b))
      .join("_");

    const response = await axios.put(
      `http://localhost:5000/chats/${chat_id}`,
      {
        receiver_id,
        sender_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    socket.emit("join-chat", { user_id: currentUser.uid, chat_id });

    console.log(response.data.messages);

    setMessages(response.data.messages);
  }

  async function deleteMessage(id) {
    try {
      console.log(id);
      const result = axios.delete(
        `http://localhost:5000/chats/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  const value = {
    chatList,
    setChatList,
    messages,
    setMessages,
    fetchChatList,
    fetchOrCreateChat,
    deleteMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
