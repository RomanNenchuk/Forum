import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { useSocket } from "../contexts/SocketProviderContext";
import { useUserInfo } from "../contexts/UserInfoContext";
import LoadingSpinner from "./Spinner.jsx";
import "react-bootstrap";

export default function Chat() {
  const { receiverId } = useParams();
  const { messages, fetchOrCreateChat, setMessages } = useChat();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { currentUser } = useAuth();
  const { userName } = useUserInfo();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchOrCreateChat(receiverId, currentUser.uid);
      } finally {
        setLoading(false);
      }
    })();
  }, [receiverId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", msg => {
      console.log(msg);
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
      socket.emit("leave-chat", currentUser.uid);
    };
  }, [socket, currentUser, receiverId]);

  function sendMessage() {
    const msg = {
      username: userName,
      recipient_id: receiverId,
      sender_id: currentUser.uid,
      text,
      timestamp: new Date(),
    };
    console.log(msg);
    socket.emit("send-message", msg);
    setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
    setText("");
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {(() => {
          return messages?.map((msg, index) => (
            <div key={index}>
              <div
                className="mb-4 p-4 border rounded"
                style={
                  msg.sender_id === currentUser.uid
                    ? { textAlign: "right" }
                    : { textAlign: "left" }
                }
              >
                <strong>{msg.username}</strong>
                <p>{msg.text}</p>
                <span style={{ fontSize: "0.8em", color: "gray" }}>
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ));
        })()}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введіть повідомлення"
        />
        <button onClick={sendMessage}>Надіслати</button>
      </div>
    </div>
  );
}
