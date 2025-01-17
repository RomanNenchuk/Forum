import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import scrollToBottom from "../../utils/scrollToBottom.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import MessageTriangle from "./MessageTriangle.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";
import replyIcon from "../../assets/reply.svg";

export default function ChatMessages({
  handleOnContextMenu,
  userSentMessage,
  setUserSentMessage,
}) {
  const { messages } = useChat();
  const { currentUser } = useAuth();
  const chatMessagesRef = useRef(null);

  const isAtBottom = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      return scrollHeight - scrollTop - clientHeight <= 200; // додано буфер
    }
    return false;
  };

  useEffect(() => {
    const chatMessagesElement = chatMessagesRef.current;
    if (chatMessagesElement) {
      // Якщо користувач вже знаходиться внизу, автоматично скролимо вниз
      if (userSentMessage || isAtBottom()) {
        scrollToBottom(chatMessagesRef);
        setUserSentMessage(false);
      }
    }
  }, [messages]);

  useEffect(() => {
    // Скрол донизу при завантаженні сторінки
    scrollToBottom(chatMessagesRef);
  }, []);

  return (
    <ul
      ref={chatMessagesRef}
      className="chat-messages"
      style={{ listStyleType: "none" }}
    >
      {messages.map((msg, index) => (
        <li
          key={index}
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
          {msg.reply !== -1 && (
            <div className="message-reply-wrapper">
              <p
                className="message-reply-label"
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
              >
                <img src={replyIcon} alt="Reply to" /> {"  "}
                {msg.reply_fullname ? msg.reply_fullname + ": " : ""}
                {msg.reply_text || "*Порожнє повідомлення*"}
              </p>
            </div>
          )}
          <span className="message-author-name">{msg.fullname}</span>
          <AttachedFiles
            urls={msg?.attachments}
            onImageLoad={() => scrollToBottom(chatMessagesRef)}
          />
          <p
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              fontSize: "17px",
            }}
          >
            {msg.text}
          </p>
          <span
            className="message-timestamp"
            style={{ fontSize: "15px", color: "black", fontWeight: 100 }}
          >
            {timestampToTime(msg.timestamp)}
          </span>
          <MessageTriangle isSender={msg.sender_id === currentUser.uid} />
        </li>
      ))}
    </ul>
  );
}
