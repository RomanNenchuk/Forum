import React, { useContext, useState, createContext, useEffect } from "react";
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

  useEffect(() => {
    if (!socket) return;

    socket.on("message-notification-background", (chat_id, deltaCount) => {
      console.log(chat_id);
      setChatList(prev =>
        prev.map(chat => {
          if (chat.chat_id === chat_id) {
            const unreadMessagesCount =
              +chat.unread_messages_count + deltaCount;
            return {
              ...chat,
              unread_messages_count:
                unreadMessagesCount > 0 ? unreadMessagesCount : 0,
            };
          }
          return chat;
        })
      );
      sortChatList(chat_id);
    });

    return () => {
      socket.off("message-notification-background");
    };
  }, [socket, currentUser]);

  async function fetchChatList() {
    try {
      const result = await axios.get("http://localhost:5000/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChatList(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  function sortChatList(chat_id) {
    setChatList(prevChats => {
      // оновлюю інформацію чату
      const updatedChats = prevChats.map(chat =>
        chat.chat_id === chat_id
          ? {
              ...chat,
              last_message_timestamp: new Date().toISOString(),
            }
          : chat
      );
      // переміщую чат на початок списку
      const movedChat = updatedChats.find(chat => chat.chat_id === chat_id);
      return [
        movedChat,
        ...updatedChats.filter(chat => chat.chat_id !== chat_id),
      ];
    });
  }

  async function fetchOrCreateChat(receiver_id, sender_id) {
    if (!socket) {
      return;
    }
    const chat_id = [receiver_id, sender_id]
      .sort((a, b) => a.localeCompare(b))
      .join("_");

    try {
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

      setMessages(response.data.messages);
    } catch (error) {
      console.error(error);
    }
  }

  async function getMessage({ msg_id, callback }) {
    const response = await axios.get(
      `http://localhost:5000/chats/messages/${msg_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    callback({
      text: response.data.text,
      sender_id: response.data.sender_id,
    });
  }

  async function getUserFullname({ userId, callback }) {
    const response = await axios.get(`http://localhost:5000/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    callback({
      fullname: response.data.fullname,
    });
  }

  const value = {
    chatList,
    setChatList,
    messages,
    setMessages,
    fetchChatList,
    fetchOrCreateChat,
    getMessage,
    getUserFullname,
    sortChatList,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
