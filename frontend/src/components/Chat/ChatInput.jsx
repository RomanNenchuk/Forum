import React, { useState, useRef, useEffect } from "react";
import FileUploader from "../FileUploader.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import sendSmileIcon from "../../assets/send-smile.svg";
import { MdEdit } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import cancelIcon from "../../assets/cancel.svg";

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

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setText("");
    };
  }, []);

  const handleEmojiClick = emojiData => {
    setText(prev => prev + emojiData.emoji);
  };

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
        <FileUploader
          setFiles={setFiles}
          editId={editId}
          setIsEditModalOpen={setIsEditModalOpen}
          setIsSendModalOpen={setIsSendModalOpen}
          text={text}
          setText={text}
        />
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
      <div className="send-smile-container">
        <div className="send-smile-btn">
          <img src={sendSmileIcon} alt="Smile" />
        </div>
        <div className="invisible-gap"></div>
        <div className="emoji-picker">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            height={400}
            width={300}
          />
        </div>
      </div>
      {(editId === -1 || isEditModalOpen || isSendModalOpen) && (
        <div className="send-msg-btn" onClick={sendMessage}>
          <img src={sendMessageIcon} alt="Send" />
        </div>
      )}
      {editId !== -1 && !isEditModalOpen && !isSendModalOpen && (
        <>
          <MdEdit size={30} onClick={editMessage} />
          <img src={cancelIcon} alt="Cancel" onClick={onCancel} />
        </>
      )}
    </div>
  );
}
