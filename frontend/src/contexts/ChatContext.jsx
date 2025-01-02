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
      const response = await axios.delete(
        `http://localhost:5000/chats/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        console.log("Message deleted");
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getMessage(id) {
    try {
      const response = await axios.get(
        `http://localhost:5000/chats/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.text;
    } catch(err) {
      return err;
      console.error(err);
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
    getMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
