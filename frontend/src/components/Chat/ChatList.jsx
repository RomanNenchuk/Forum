import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import LoadingSpinner from "../Spinner.jsx";
import "./Chat.css"

export default function ChatList() {
  const { chatList, setChatList, fetchChatList } = useChat();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="d-flex justify-content-around chat-area">
      <ul>
        {chatList.map((chat, index) => (
          <li key={index} className="mb-4 p-4 border rounded">
            <Link
              to={`/chats/${chat.other_user_id}`}
              onClick={() => {
                const updatedChatList = chatList.map((c, i) =>
                  i === index ? { ...c, unread_messages_count: 0 } : c
                );
                setChatList(updatedChatList);
              }}
            >
              <p>
                {chat.other_user_name}
                {"  "}
                {chat.unread_messages_count != 0
                  ? `(${chat.unread_messages_count})`
                  : ""}
              </p>
            </Link>
            <p>
              {chat.text && (
                <>
                  {chat.last_message_sender_id === currentUser.uid
                    ? "You"
                    : chat.other_user_name}
                  : {chat.text}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  );
}
