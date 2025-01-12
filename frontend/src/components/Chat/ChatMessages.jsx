import React from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import MessageTriangle from "./MessageTriangle.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";

export default function ChatMessages({ handleOnContextMenu }) {
  const { messages } = useChat();
  const { currentUser } = useAuth();

  return (
    <ul className="chat-messages" style={{ listStyleType: "none" }}>
      {messages.map((msg, index) => (
        <li
          key={msg.id}
          className="uTou-message"
          style={
            msg.sender_id === currentUser.uid
              ? {
                  textAlign: "right",
                  marginLeft: "auto",
                  backgroundColor: "#a3beb7",
                }
              : {
                  textAlign: "left",
                  marginRight: "auto",
                  backgroundColor: "#c2c1be",
                }
          }
          onContextMenu={e => handleOnContextMenu(e, msg)}
        >
          <span>{msg.fullname}</span>
          <AttachedFiles urls={msg?.attachments} />
          <p style={{ margin: "20px" }}>{msg.text}</p>
          <span style={{ fontSize: "15px", color: "black", fontWeight: 100 }}>
            {timestampToTime(msg.timestamp)}
          </span>
          <MessageTriangle isSender={msg.sender_id === currentUser.uid} />
        </li>
      ))}
    </ul>
  );
}
