import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { useSocket } from "../../contexts/SocketProviderContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.jsx";
import getChatId from "../../utils/getChatId.jsx";
import handleUpload from "../../utils/uploadFiles.jsx";
import ChatInput from "./ChatInput.jsx";
import FileSendModal from "../FileModal/FileSendModal.jsx";
import FileEditModal from "../FileModal/FileEditModal.jsx";
import ChatContextMenu from "./ChatContextMenu.jsx";
import ChatMessages from "./ChatMessages.jsx";
import LoadingSpinner from "../Spinner.jsx";
import chatControllerIcon from "../../assets/chat-controller.svg";
import "react-bootstrap";

export default function Chat() {
  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Список файлів на видалення
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [userSentMessage, setUserSentMessage] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [reply, setReply] = useState({
    id: -1,
    author: null,
    text: "",
  });

  useBodyScrollLock(isContextMenuOpen);

  const contextMenuRef = useRef(null);

  const { receiverId } = useParams();
  const {
    messages,
    fetchOrCreateChat,
    setMessages,
    fetchChatList,
    sortChatList,
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
  }, [receiverId, socket, currentUser]);

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

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", msg => {
      console.log(msg);
      setMessages(prev => [...prev, msg]);
      sortChatList(getChatId(currentUser.uid, receiverId));
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

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsSendModalOpen(false);
    setEditId(-1);
    setText("");
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
    console.log(msg);

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
        reply: reply?.id,
        reply_fullname: reply?.author,
        reply_text: reply?.text,
      };
      socket.emit("send-message", msg, receiverId, res => {
        msg.id = res.id;
        // msg.reply_text = res.reply_text;
        setMessages(prev => [...prev, msg]);
        setText(""); // очищення текстового поля
      });
    } else {
      // якщо користувач обере більше 10 файлів, то розбиваємо їх на частини по 10
      const CHUNK_SIZE = 10;
      const fileChunks = [];
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        fileChunks.push(files.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < fileChunks.length; i++) {
        const chunk = fileChunks[i];
        const attachments = await handleUpload(chunk, currentUser.uid);

        console.log(attachments);

        const msg = {
          id: -1,
          attachments,
          fullname: fullName,
          sender_id: currentUser.uid,
          text: i === fileChunks.length - 1 ? text : "", // додаю текст до останнього повідомлення
          timestamp: new Date().toISOString(),
          reply: reply?.id,
          reply_fullname: reply?.author,
          reply_text: reply?.text,
        };

        socket.emit("send-message", msg, receiverId, res => {
          msg.id = res.id;
          // msg.reply_text = res.reply_text;
          setMessages(prev => [...prev, msg]);

          if (i === fileChunks.length - 1) {
            setText("");
            setFiles([]);
          }
        });
        setIsSendModalOpen(false);
      }
    }

    setUserSentMessage(true);
    sortChatList(getChatId(currentUser.uid, receiverId));
    setReply({
      id: -1,
      author: null,
      text: "",
    });
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

  function resetEdit() {
    setEditId(-1);
    setText("");
  }

  async function editMessage() {
    const newAttachments = files.filter(file => !file.isFromDatabase);
    let newAttachmentsUrls = null;

    // Завантаження нових файлів
    if (newAttachments.length) {
      newAttachmentsUrls = await handleUpload(newAttachments, currentUser.uid);
    }

    let updatedMessage;

    setMessages(prev => {
      return prev.map(message => {
        if (message.id === editId) {
          // Новий масив вкладень
          let cleanedAttachments = [];
          if (message.attachments) {
            const updatedAttachments = message.attachments.map(attachment => {
              // Перевірка, чи потрібно замінити це вкладення
              const replacementIndex = filesToDelete.findIndex(
                file => file.url === attachment
              );
              if (replacementIndex !== -1) {
                // Якщо є заміна, беремо перший новий файл
                return newAttachmentsUrls?.shift() || null;
              }
              return attachment; // Якщо немає заміни, залишаємо оригінал
            });

            // Видаляємо всі null (вкладення, які замінилися)
            cleanedAttachments = updatedAttachments.filter(
              attachment => attachment !== null
            );

            // Якщо залишилися нові вкладення, додаємо їх у кінець
            if (newAttachmentsUrls?.length) {
              cleanedAttachments.push(...newAttachmentsUrls);
            }
          }

          // Оновлене повідомлення
          updatedMessage = {
            ...message,
            text: text || message.text,
            attachments: cleanedAttachments, // Оновлені вкладення
          };
          return updatedMessage; // Повертаю оновлене повідомлення
        }
        return message; // Інші повідомлення залишаємо без змін
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
    setIsEditModalOpen(false);
    setFiles([]);
    setFilesToDelete([]);
    resetEdit();
  }

  if (loading) return <LoadingSpinner />;

  const location = useLocation();
  const otherUserName = location.state?.otherUserName || "Користувач";

  return (
    <div className="chat-container">
      <div className="chat-ct-hd">
        <div className="chat-ct-hd-name">
          <Link
            to={`/profiles/${receiverId}`}
            state={{ backgroundLocation: location }}
          >
            <p>{otherUserName}</p>
          </Link>
        </div>
        <div className="chat-ct-hd-pre-svg">
          <img src={chatControllerIcon} alt="Settings" />
        </div>
      </div>
      <ChatMessages
        handleOnContextMenu={handleOnContextMenu}
        userSentMessage={userSentMessage}
        setUserSentMessage={setUserSentMessage}
      />

      <ChatContextMenu
        positionX={contextMenu.position.x}
        positionY={contextMenu.position.y}
        isToggled={contextMenu.toggled}
        contextMenuRef={contextMenuRef}
        resetContextMenu={resetContextMenu}
        deleteMessage={deleteMessage}
        resetEdit={resetEdit}
        setIsEditModalOpen={setIsEditModalOpen}
        setText={setText}
        setEditId={setEditId}
        setFiles={setFiles}
        currentUser={currentUser}
        contextMenu={contextMenu}
        setReply={setReply}
      />

      <ChatInput
        isEditModalOpen={isEditModalOpen}
        isSendModalOpen={isSendModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        setIsSendModalOpen={setIsSendModalOpen}
        setFiles={setFiles}
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        editMessage={editMessage}
        editId={editId}
        onCancel={handleCloseModal}
        reply={reply}
        setReply={setReply}
      />

      {isEditModalOpen && (
        <FileEditModal
          files={files}
          setFiles={setFiles}
          onClose={handleCloseModal}
          text={text}
          setText={setText}
          setFilesToDelete={setFilesToDelete}
          editId={editId}
          onEdit={editMessage}
        />
      )}
      {isSendModalOpen && (
        <FileSendModal
          files={files}
          setFiles={setFiles}
          onClose={handleCloseModal}
          text={text}
          setText={setText}
          onSubmit={sendMessage}
        />
      )}
    </div>
  );
}
