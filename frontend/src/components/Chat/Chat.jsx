import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
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
import { MdEdit } from "react-icons/md";
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

  const location = useLocation();
  const otherUserName = location.state?.otherUserName || "Користувач";  // Getting name of the other user

  return (
    <div className="chat-container">
      <div className="chat-ct-hd">
        <div className="chat-ct-hd-name"><p>{ otherUserName }</p></div>
        <div className="chat-ct-hd-pre-svg"><svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_603_22)"><path d="M17.5 0C7.85021 0 0 7.85021 0 17.5C0 27.1498 7.85021 35 17.5 35C27.1498 35 35 27.1498 35 17.5C35 7.85021 27.1498 0 17.5 0ZM17.5 27.7083C16.2925 27.7083 15.3125 26.7283 15.3125 25.5208C15.3125 24.3133 16.2925 23.3333 17.5 23.3333C18.7075 23.3333 19.6875 24.3133 19.6875 25.5208C19.6875 26.7283 18.7075 27.7083 17.5 27.7083ZM17.5 19.6875C16.2925 19.6875 15.3125 18.7075 15.3125 17.5C15.3125 16.2925 16.2925 15.3125 17.5 15.3125C18.7075 15.3125 19.6875 16.2925 19.6875 17.5C19.6875 18.7075 18.7075 19.6875 17.5 19.6875ZM17.5 11.6667C16.2925 11.6667 15.3125 10.6867 15.3125 9.47917C15.3125 8.27167 16.2925 7.29167 17.5 7.29167C18.7075 7.29167 19.6875 8.27167 19.6875 9.47917C19.6875 10.6867 18.7075 11.6667 17.5 11.6667Z" fill="currentColor"/></g><defs><clipPath id="clip0_603_22"><rect width="35" height="35" fill="white"/></clipPath></defs></svg></div>
      </div>
      <ul className="chat-messages" style={{ listStyleType: "none" }}>
        {(() => {
          return messages?.map((msg, index) => (
            <li
              key={index}
              className="uTou-message"
              style={
                msg.sender_id === currentUser.uid
                  ? { textAlign: "right", marginLeft: "auto", backgroundColor: "#a3beb7" }
                  : { textAlign: "left", marginRight: "auto", backgroundColor: "gray"}
              }
              onContextMenu={e => handleOnContextMenu(e, msg)}
            >
              <span>{msg.fullname}</span>
              <AttachedFiles urls={msg?.attachments}/>
              <p style = {{marginLeft: "20px", marginRight: "20px"}}>{msg.text}</p>
              <span style={{ fontSize: "15px", color: "black", fontWeight: 100 }}>
                {timestampToTime(msg.timestamp)}
              </span>
              <div className="mes-triangle" style = { msg.sender_id === currentUser.uid ? 
                {bottom: "-25px", right: "-17px", backgroundColor: "#a3beb7", transform: "rotate(135deg)" }:
                {bottom: "-25px", left: "-17px",backgroundColor: "gray",transform: "rotate(225deg)"}}></div>
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
          placeholder="Напишіть повідомлення..."
        />
        <div className="send-smile-btn" onClick={sendMessage}><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_603_4)"><path d="M16.045 0.0362535C11.7138 -0.254997 7.45251 1.33125 4.38626 4.40125C1.32126 7.47 -0.26374 11.7225 0.0362599 16.0675C0.58751 24.01 7.60251 30 16.3538 30H23.75C27.1963 30 30 27.1963 30 23.75V15.425C30 7.3275 23.8713 0.567503 16.045 0.0362535ZM10.625 10C11.66 10 12.5 10.84 12.5 11.875C12.5 12.91 11.66 13.75 10.625 13.75C9.59001 13.75 8.75001 12.91 8.75001 11.875C8.75001 10.84 9.59001 10 10.625 10ZM20.88 19.0125C20.7875 19.1038 18.58 21.25 15 21.25C11.42 21.25 9.21251 19.105 9.12001 19.0125C8.63001 18.5263 8.62501 17.7363 9.11126 17.245C9.59876 16.755 10.3875 16.75 10.88 17.2363C10.9375 17.2925 12.48 18.7488 15 18.7488C17.52 18.7488 19.0625 17.2913 19.1275 17.23C19.6225 16.7525 20.4125 16.7625 20.8913 17.255C21.3713 17.7463 21.3675 18.53 20.88 19.0125ZM19.375 13.75C18.34 13.75 17.5 12.91 17.5 11.875C17.5 10.84 18.34 10 19.375 10C20.41 10 21.25 10.84 21.25 11.875C21.25 12.91 20.41 13.75 19.375 13.75Z" fill="currentColor"/></g><defs><clipPath id="clip0_603_4"><rect width="30" height="30" fill="none"/></clipPath></defs></svg></div>
        
        {editId === -1 && <div className="send-msg-btn" onClick = {sendMessage}><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_603_6)"><path d="M29.6235 2.14804L6.48615 25.2791C6.98635 25.5229 7.53499 25.651 8.09141 25.6539H12.054C12.3855 25.653 12.7035 25.7848 12.9372 26.0199L15.0847 28.1662C16.2493 29.3388 17.8332 29.9988 19.4858 30.0001C20.1681 29.9994 20.8457 29.8876 21.4921 29.669C23.7202 28.9385 25.3409 27.007 25.6733 24.6858L29.8945 4.63531C30.0961 3.79986 30.0002 2.92037 29.6235 2.14804Z" fill="black"/><path d="M25.401 0.0965088L5.39928 4.31026C1.98169 4.77979 -0.408202 7.93094 0.0613198 11.3485C0.246775 12.6982 0.868373 13.9503 1.83143 14.9139L3.97766 17.0601C4.21224 17.2946 4.34394 17.6128 4.3437 17.9446V21.9072C4.34657 22.4636 4.4747 23.0123 4.71848 23.5124L27.852 0.37513C27.0918 0.00152692 26.2256 -0.09691 25.401 0.0965088Z" fill="currentColor"/></g><defs><clipPath id="clip0_603_6"><rect width="30" height="30" fill="none"/></clipPath></defs></svg></div>}
        {editId !== -1 && <MdEdit size = {30} onClick={editMessage}/>} 
      </div>
    </div>
  );
}