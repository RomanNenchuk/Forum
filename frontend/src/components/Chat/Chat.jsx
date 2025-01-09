import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { useSocket } from "../../contexts/SocketProviderContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import FileUploader from "../FileUploader.jsx";
import ContextMenu from "../ContextMenu/ContextMenu.jsx";
import LoadingSpinner from "../Spinner.jsx";
import axios from "axios";
import "react-bootstrap";

export default function Chat() {
  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({ started: false, pc: 0 });

  useBodyScrollLock(isContextMenuOpen);

  const contextMenuRef = useRef(null);
  const fileInputRef = useRef();

  const { receiverId } = useParams();
  const {
    messages,
    fetchOrCreateChat,
    setMessages,
    fetchChatList,
    getMessage,
  } = useChat();
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { currentUser } = useAuth();
  const { fullName } = useUserInfo();

  const [contextMenu, setContextMenu] = useState({
    selectedMessage: -1,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  useEffect(() => {
    if (!socket) return;
    (async () => {
      try {
        setLoading(true);
        await fetchOrCreateChat(receiverId, currentUser.uid);
        await fetchChatList();
      } finally {
        setLoading(false);
      }
    })();
  }, [receiverId, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", msg => {
      console.log(msg);
      setMessages(prev => [...prev, msg]);
    });

    socket.on("remove-message", id => {
      setMessages(prev => prev.filter(item => item.id !== id));
    });

    socket.on("edit-his-message", msg => {
      console.log(msg);
      setMessages(prev =>
        prev.map(item =>
          item.id === msg.id ? { ...item, text: msg.text } : item
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("remove-message");
      socket.off("edit-his-message");
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

  async function sendMessage() {
    let attachments = null;
    if (files) {
      const uploadResult = await handleUpload();
      attachments = uploadResult?.files?.map(attachment => attachment.url);
    }
    const msg = {
      id: -1,
      fullname: fullName,
      recipient_id: receiverId,
      sender_id: currentUser.uid,
      text,
      attachments,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send-message", msg, id => {
      msg.id = id;
      console.log(msg);
      setMessages(prev => [...prev, msg]);
      setText("");
      setFiles([]);
      fileInputRef.current.value = "";
    });
  }

  function deleteMessage(msg_id) {
    for (let i = 0; i < messages.length; i++) {
      if (msg_id == messages[i].id) {
        console.log(messages[i]);
        socket.emit("delete-message", {
          msg_id,
          initiator: currentUser.uid,
          users: [currentUser.uid, receiverId],
        });
        setMessages(prev => prev.filter(item => item.id !== msg_id));
        break;
      }
    }
  }

  const [editId, setEditId] = useState(-1);
  function resetEdit() {
    setEditId(-1);
    setText("");
  }

  function editMessage() {
    console.log(`Editing message with id ${editId}`);
    setMessages(prev => {
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].id == editId) {
          prev[i].text = text;
        }
      }
      return prev;
    });
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].id === editId) {
        console.log(messages[i]);
        socket.emit("edit-message", messages[i]);
      }
    }
    resetEdit();
  }
  async function handleUpload() {
    if (!files) {
      return console.log("No selected files");
    } else {
      try {
        const fd = new FormData();
        for (let i = 0; i < files.length; i++) fd.append("files", files[i]);

        setProgress(prev => {
          return { ...prev, started: true };
        });

        const response = await axios.post(
          `http://localhost:5000/attachments/${currentUser.uid}`,
          fd,
          {
            onUploadProgress: progressEvent => {
              setProgress(prev => {
                return { ...prev, pc: progressEvent.progress * 100 };
              });
            },
          }
        );

        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="chat-container">
      <ul className="chat-messages" style={{ listStyleType: "none" }}>
        {(() => {
          return messages?.map((msg, index) => (
            <li
              key={index}
              className="mb-4 p-4 border rounded w-50"
              style={
                msg.sender_id === currentUser.uid
                  ? { textAlign: "right", marginLeft: "auto" }
                  : { textAlign: "left", marginRight: "auto" }
              }
              onContextMenu={e => handleOnContextMenu(e, msg)}
            >
              <strong>{msg.fullname}</strong>
              <AttachedFiles urls={msg?.attachments} />
              <p>{msg.text}</p>
              <span style={{ fontSize: "0.8em", color: "gray" }}>
                {timestampToTime(msg.timestamp)}
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
        contextMenu={contextMenu}
        resetContextMenu={resetContextMenu}
        deleteMessage={deleteMessage}
        resetEdit={resetEdit}
        getMessage={getMessage}
        setText={setText}
        setEditId={setEditId}
        currentUser={currentUser}
      />

      <div className="chat-input">
        <FileUploader setFiles={setFiles} fileInputRef={fileInputRef} />
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введіть повідомлення"
        />
        {editId === -1 && <button onClick={sendMessage}>Надіслати</button>}
        {editId !== -1 && <button onClick={editMessage}>Редагувати</button>}
      </div>
    </div>
  );
}