import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import scrollToBottom from "../../utils/scrollToBottom.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import MessageTriangle from "./MessageTriangle.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";
import replyIcon from "../../assets/reply.svg";
import Linkify from "react-linkify";

export default function ChatMessages({
  handleOnContextMenu,
  userSentMessage,
  setUserSentMessage,
  chatMessagesRef,
}) {
  const { messages } = useChat();
  const { currentUser } = useAuth();

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

  const [scaleValue, setScaleValue] = useState(window.innerHeight * 0.0015);
    const updateScaleValue = () => {
      setScaleValue(window.innerHeight * 0.0015);
    };
  
    useEffect(() => {
      window.addEventListener("resize", updateScaleValue);
      return () => {
        window.removeEventListener("resize", updateScaleValue);
      };
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
                    display: "flex", flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginLeft: "auto",
                    backgroundColor: "#a3beb7",
                  }
                : {
                    display: "flex", flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginRight: "auto",
                    backgroundColor: "#c2c1be",
                  }
                }
              >
                <div style = {{transform: `scale(${scaleValue})`}}><img src={replyIcon} alt="Reply to" /> {"  "}</div>
                {msg.reply_fullname ? msg.reply_fullname + ": " : ""}
                {msg.reply_text ||
                  msg.reply_attachment?.slice(
                    msg.reply_attachment?.indexOf("_") + 1
                  ) ||
                  "*Видалене повідомлення*"}
              </p>
            </div>
          )}
          <span className="message-author-name">{msg.fullname}</span>
          <AttachedFiles
            urls={msg?.attachments}
            onImageLoad={() => scrollToBottom(chatMessagesRef)}
          />
          <Linkify>
            <p
              style={{
                margin: "0 6% 2vh 6%",
                fontSize: "2.5vh",              userSelect: "text",
                overflowWrap: "break-word"
              }}
            >
              {msg.text}
            </p>
          </Linkify>
          <span
            className="message-timestamp"
            style={{ fontWeight: 100 }}
          >
            {timestampToTime(msg.timestamp)}
          </span>
          <MessageTriangle isSender={msg.sender_id === currentUser.uid} />
        </li>
      ))}
    </ul>
  );
}
