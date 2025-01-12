import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { useSocket } from "../../contexts/SocketProviderContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.jsx";
import ChatInput from "./ChatInput.jsx";
import FileModal from "../FileModal.jsx";
import ContextMenu from "../ContextMenu/ContextMenu.jsx";
import ChatMessages from "./ChatMessages.jsx";
import LoadingSpinner from "../Spinner.jsx";
import chatControllerIcon from "../../assets/chat-controller.svg";
import "react-bootstrap";
import axios from "axios";

export default function Chat() {
  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Список файлів на видалення
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    getUserFullname,
  } = useChat();
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { currentUser } = useAuth();
  const { fullName } = useUserInfo();

  const [contextMenu, setContextMenu] = useState({
    selectedMessage: -1,
    selectedMessageItem: null,
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
      setMessages(prev => [...prev, msg]);
    });

    socket.on("delete-message", id => {
      setMessages(prev => prev.filter(item => item.id !== id));
    });

    socket.on("edit-message", msg => {
      setMessages(prev =>
        prev.map(item =>
          item.id === msg.id
            ? { ...item, text: msg.text, attachments: msg.attachments }
            : item
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("delete-message");
      socket.off("edit-message");
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRemoveFile = index => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles[index];
      if (fileToRemove.isFromDatabase) {
        // Додаємо файл у список на видалення
        setFilesToDelete(prev => [...prev, fileToRemove]);
      }
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  const handleAddFile = file => {
    setFiles(prevFiles => [
      ...prevFiles,
      { name: file.name, data: file, isFromDatabase: false },
    ]);
  };

  function resetContextMenu() {
    setIsContextMenuOpen(false);
    setContextMenu({
      selectedMessage: -1,
      selectedMessageItem: null,
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
    setFilesToDelete([]);
    setFiles([]);
    setIsContextMenuOpen(true);

    setContextMenu({
      selectedMessage: msg.id,
      selectedMessageItem: msg,
      position: {
        x,
        y,
      },
      toggled: true,
    });
  }
  const sendMessage = async () => {
    // якщо вкладень (файлів) немає, але є текст, надсилаю лише текстове повідомлення
    if (files.length === 0 && text.trim() !== "") {
      const msg = {
        id: -1,
        attachments: [],
        fullname: fullName,
        sender_id: currentUser.uid,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        reply: replyId,
      };
      socket.emit("send-message", msg, receiverId, res => {
        msg.id = res.id;
        msg.reply_text = res.reply_text;
        setMessages(prev => [...prev, msg]);
        setText(""); // очищення текстового поля
      });
      resetReply();
      return;
    }

    // якщо користувач обере більше 10 файлів, то розбиваємо їх на частини по 10
    const CHUNK_SIZE = 10;
    const fileChunks = [];
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      fileChunks.push(files.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < fileChunks.length; i++) {
      const chunk = fileChunks[i];
      const attachments = await handleUpload(chunk);

      const msg = {
        id: -1,
        attachments: [],
        fullname: fullName,
        sender_id: currentUser.uid,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        reply: replyId,
      };

      socket.emit("send-message", msg, receiverId, res => {
        msg.id = res.id;
        msg.reply_text = res.reply_text;
        setMessages(prev => [...prev, msg]);

        if (i === fileChunks.length - 1) {
          setText("");
          setFiles([]);
          fileInputRef.current.value = "";
        }
      });
    }
    resetReply();
  };

  function deleteMessage(msg_id) {
    for (let i = 0; i < messages.length; i++) {
      if (msg_id == messages[i].id) {
        socket.emit("delete-message", {
          msg_id,
          initiator_id: currentUser.uid,
          recipient_id: receiverId,
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

  async function editMessage() {
    const newAttachments = files.filter(file => !file.isFromDatabase);
    let newAttachmentsUrls = null;

    // завантаження нових файлів
    if (newAttachments.length) {
      newAttachmentsUrls = await handleUpload(newAttachments);
    }

    let updatedMessage;

    setMessages(prev => {
      return prev.map(message => {
        if (message.id === editId) {
          // залишаємо попередні файли, які не в списку filesToDelete
          const previousAttachments = message.attachments.filter(
            attachment => !filesToDelete.some(file => file.url === attachment)
          );

          // формуємо оновлене повідомлення
          updatedMessage = {
            ...message,
            text: text,
            attachments: [
              ...previousAttachments,
              ...(newAttachmentsUrls || []),
            ],
          };

          return updatedMessage; // повертаємо оновлене повідомлення
        }
        return message; // а інші залишаємо без змін
      });
    });

    if (updatedMessage) {
      socket.emit(
        "edit-message",
        updatedMessage,
        filesToDelete.map(file => file.url),
        currentUser.uid,
        receiverId
      );
    }

    // Очистка станів
    setFiles([]);
    setFilesToDelete([]);
    resetEdit();
  }

  const handleUpload = async files => {
    try {
      const fd = new FormData();
      files.forEach(file => fd.append("files", file.data));
      const response = await axios.post(
        `http://localhost:5000/attachments/${currentUser.uid}`,
        fd
      );
      return response.data.files.map(file => file.url);
    } catch (err) {
      console.error(err);
    }
  };

  const [replyId, setReply] = useState(-1);
  function resetReply() {
    setReply(-1);
  }

  if (loading) return <LoadingSpinner />;

  const location = useLocation();
  const otherUserName = location.state?.otherUserName || "Користувач";

  return (
    <div className="chat-container">
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
        setFiles={setFiles}
        currentUser={currentUser}
        setReply={setReply}
      />
      <div className="chat-ct-hd">
        <div className="chat-ct-hd-name">
          <p>{otherUserName}</p>
        </div>
        <div className="chat-ct-hd-pre-svg">
          <img src={chatControllerIcon} alt="Settings" />
        </div>
      </div>
      <ChatMessages 
        handleOnContextMenu={handleOnContextMenu}
        getMessage={getMessage}
        getUserFullname={getUserFullname}
      />

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
        setFiles={setFiles}
        currentUser={currentUser}
        setReply={setReply}
      />

      <ChatInput
        setIsModalOpen={setIsModalOpen}
        setFiles={setFiles}
        fileInputRef={fileInputRef}
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        editMessage={editMessage}
        editId={editId}
        setEditId={setEditId}
        replyId={replyId}
        resetReply={resetReply}
        getMessage={getMessage}
        getUserFullname={getUserFullname}
      />

      {isModalOpen && (
        <FileModal
          files={files}
          filesToDelete={filesToDelete}
          onClose={handleCloseModal}
          onRemoveFile={handleRemoveFile}
          onAddFile={handleAddFile}
          setFiles={setFiles}
        />
      )}
    </div>
  );
}
