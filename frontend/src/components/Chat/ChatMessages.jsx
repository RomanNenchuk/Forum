import React, { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import MessageTriangle from "./MessageTriangle.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";
import replyIcon from "../../assets/reply.svg";

export default function ChatMessages({
  handleOnContextMenu,
  getMessage,
  getUserFullname,
}) {
  const { messages } = useChat();
  const { currentUser } = useAuth();
  const [replies, setReplies] = useState({});

  useEffect(() => {
    const fetchReplies = async () => {
      const replyData = {};
      for (const msg of messages) {
        if (msg.reply !== -1) {
          const reply = await new Promise(resolve =>
            getMessage({
              msg_id: msg.reply,
              callback: resolve,
            })
          );
          let author = {};
          if (reply.sender_id) {
            author = await new Promise(resolve =>
              getUserFullname({
                userId: reply.sender_id,
                callback: resolve,
              })
            );
          }
          replyData[msg.reply] = {
            text: reply.text || "*Видалене повідомлення*",
            author: author.fullname,
          };
        }
      }
      setReplies(replyData);
    };

    fetchReplies();
  }, [messages]);
  return (
    <ul className="chat-messages" style={{ listStyleType: "none" }}>
      {messages.map((msg, index) => {
        const replyInfo = replies[msg.reply] || {};
        return (
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
                  {replyInfo.author ? (replyInfo.author + ": ") : ""}
                  {replyInfo.text || "*Видалене повідомлення*"}
                </p>
              </div>
            )}
            <span className="message-author-name">{msg.fullname}</span>
            <AttachedFiles urls={msg?.attachments} />
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
        );
      })}
    </ul>
  );
}
