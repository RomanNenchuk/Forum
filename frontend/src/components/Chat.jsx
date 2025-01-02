import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { useSocket } from "../contexts/SocketProviderContext";
import { useUserInfo } from "../contexts/UserInfoContext";
import { useBodyScrollLock } from "../hooks/BodyScrollLock";
import ContextMenu from "./ContextMenu/ContextMenu.jsx";
import LoadingSpinner from "./Spinner.jsx";
import "react-bootstrap";

export default function Chat() {
  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  useBodyScrollLock(isContextMenuOpen);

  const [contextMenu, setContextMenu] = useState({
    selectedMessage: -1,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  const contextMenuRef = useRef(null);

  const { receiverId } = useParams();
  const {
    messages,
    fetchOrCreateChat,
    setMessages,
    fetchChatList,
    deleteMessage,
  } = useChat();
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { currentUser } = useAuth();
  const { fullName } = useUserInfo();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchOrCreateChat(receiverId, currentUser.uid);
        await fetchChatList();
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

  useEffect(() => {
    function handler(e) {
      if (contextMenuRef.current) {
        if (!contextMenuRef.current.contains(e.target)) {
          resetContextMenu();
        }
      }
    }

    document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  }, []);

  function resetContextMenu() {
    setIsContextMenuOpen(false);
    setContextMenu({
      selectedMessage: -1,
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  function handleOnContextMenu(e, msg) {
    e.preventDefault();

    const contextMenuAttr = contextMenuRef.current.getBoundingClientRect();

    const isRight = e.clientX > window?.innerWidth / 2;
    const isBottom = e.clientY > window?.innerHeight / 2;

    let x = e.clientX;
    let y = e.clientY;

    if (isRight) x -= contextMenuAttr.width;
    if (isBottom) y -= contextMenuAttr.height;

    setIsContextMenuOpen(true);

    setContextMenu({
      selectedMessage: msg.id,
      position: {
        x,
        y,
      },
      toggled: true,
    });
  }

  function sendMessage() {
    const msg = {
      fullname: fullName,
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
      <ul className="chat-messages" style={{ listStyleType: "none" }}>
        {(() => {
          return messages?.map((msg, index) => (
            <li
              key={index}
              className="mb-4 p-4 border rounded"
              style={
                msg.sender_id === currentUser.uid
                  ? { textAlign: "right" }
                  : { textAlign: "left" }
              }
              onContextMenu={e => handleOnContextMenu(e, msg)}
            >
              <strong>{msg.fullname}</strong>
              <p>{msg.text}</p>
              <span style={{ fontSize: "0.8em", color: "gray" }}>
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </li>
          ));
        })()}
      </ul>

      <ContextMenu
        contextMenuRef={contextMenuRef}
        isToggled={contextMenu.toggled}
        positionX={contextMenu.position.x}
        positionY={contextMenu.position.y}
        buttons={[
          {
            text: "Delete",
            icon: "🗑️",
            onClick: () => {
              deleteMessage(contextMenu.selectedMessage);
              fetchOrCreateChat(receiverId, currentUser.uid);
              resetContextMenu();
            }
          },
          {
            text: "Edit",
            icon: "🖋️",
            onClick: () => alert("wow"),
          },
          {
            text: "Reply",
            icon: "↩️",
            onClick: () => alert("wow"),
          },
        ]}
      />

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
