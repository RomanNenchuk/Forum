import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import Avatar from "../Avatar";
import "./Chat.css";

export default function ChatList() {
  const { chatList, setChatList } = useChat();
  const { currentUser } = useAuth();

  const handleChatClick = (index) => {
    const updatedChatList = chatList.map((chat, i) => ({
      ...chat,
      active: i === index,
      unread_messages_count: i === index ? 0 : chat.unread_messages_count,
    }));
  
    setChatList(updatedChatList);
  };

  return (
    <div className="chat-win-container">
      <div className="chat-list-ct">
        <div className="chat-hd"><p>Приватні чати</p></div>
        <div className="chat-list">
          {chatList.map((chat, index) => (
            <div
              key={index}
              className={`chat-item ${
                chat.unread_messages_count > 0 ? "unread" : ""
              } ${
                chat.active ? "active" : ""
              }`}
            >
              <Link 
                to={`/chats/${ chat.other_user_id }`}
                state={{ otherUserName: chat.other_user_name }}
                onClick={() => handleChatClick(index)}
              >
                <div className="chat-header">
                  <div className="chat-name-ct">
                    <div className="chat-pre-img"></div>
                    <div className="chat-name-text">
                      <p className="chat-name">{chat.other_user_name}</p>
                    </div>
                  </div>
                  
                  
                  {chat.unread_messages_count > 0 && (
                    <div className="chat-unread-msg">
                      <p className="unread-badge">{chat.unread_messages_count}</p>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        <Outlet />
      </div>
    </div>
  );
}