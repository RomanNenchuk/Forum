import React, { useState, useRef, useEffect } from "react";
import FileUploader from "../FileUploader.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import { MdEdit } from "react-icons/md";
import cancelIcon from "../../assets/cancel.svg";
import EmojiPickerButton from "../EmojiPickerButton/EmojiPickerButton.jsx";

export default function ChatInput({
  isEditModalOpen,
  isSendModalOpen,
  setIsEditModalOpen,
  setIsSendModalOpen,
  setFiles,
  text,
  setText,
  sendMessage,
  editMessage,
  editId,
  reply,
  setReply,
  onCancel,
}) {
  const inputRef = useRef();
  const { messages } = useChat();

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

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setText("");
    };
  }, []);

  function hasAttachments() {
    const message = messages.find(msg => msg.id === editId);
    return message?.attachments?.length > 0 || false;
  }

  function onChange(e) {
    if (isEditModalOpen || isSendModalOpen) return;
    setText(e.target.value);
  }

  function onKeyDown(e) {
    if (
      editId === -1 &&
      e.key === "Enter" &&
      !isEditModalOpen &&
      !isSendModalOpen
    ) {
      sendMessage();
    }
  }

  return (
    <div className="chat-input">
      {reply.id !== -1 && (
        <div className="reply-label">
          <div className="reply-label-info">
            <span className="reply-label-author">
              {reply.author || "Невідомий автор"}
            </span>
            <span>
              :{" "}
              {reply.text ||
                reply.attachment.slice(reply.attachment.indexOf("_") + 1) ||
                "*Видалене повідомлення*"}
            </span>
          </div>
          <img
            src={cancelIcon}
            alt="Cancel"
            onClick={() =>
              setReply({
                id: -1,
                author: null,
                text: "",
                attachment: "",
              })
            }
          />
        </div>
      )}

      {editId === -1 && !hasAttachments() ? (
        <div style = {{transform: `scale(${scaleValue})`}}><FileUploader
          setFiles={setFiles}
          editId={editId}
          setIsEditModalOpen={setIsEditModalOpen}
          setIsSendModalOpen={setIsSendModalOpen}
          text={text}
          setText={text}
        /></div>
      ) : null}

      <input
        id="chat-message-input"
        type="text"
        value={isEditModalOpen || isSendModalOpen ? "" : text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        ref={inputRef}
        placeholder="Напишіть повідомлення..."
      />
      <div style = {{transform: `scale(${scaleValue})`}}><EmojiPickerButton setText={setText} /></div>
      {(editId === -1 || isEditModalOpen || isSendModalOpen) && (
        <div className="send-msg-btn" onClick={sendMessage}>
          <div style = {{transform: `scale(${scaleValue})`}}><img src={sendMessageIcon} alt="Send" /></div>
        </div>
      )}
      {editId !== -1 && !isEditModalOpen && !isSendModalOpen && (
        <>
          <MdEdit size="3vh" onClick={editMessage} />
          <div style = {{transform: `scale(${scaleValue})`}}><img src={cancelIcon} alt="Cancel" onClick={onCancel} /></div>
        </>
      )}
    </div>
  );
}
