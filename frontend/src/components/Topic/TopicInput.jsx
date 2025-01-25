import React, { useState } from "react";
import FileUploader from "../FileUploader.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import sendSmileIcon from "../../assets/send-smile.svg";
import EmojiPickerButton from "../EmojiPickerButton/EmojiPickerButton.jsx";
import { MdEdit } from "react-icons/md";
import cancelIcon from "../../assets/cancel.svg";

export default function TopicInput({
  isEditModalOpen,
  isSendModalOpen,
  setIsSendModalOpen,
  setFiles,
  text,
  setText,
  sendComment,
  editComment,
  editId,
  onCancel,
  reply,
  setReply,
}) {
  function onChange(e) {
    if (isEditModalOpen || isSendModalOpen) return;
    setText(e.target.value);
  }

  return (
    <div className="comment-input-container">
      {reply.id !== -1 && (
        <div className="reply-label">
          <div className="reply-label-info">
            <span className="reply-label-author">
              {reply.author || "Невідомий автор"}
            </span>
            <span>
              :{" "}
              {reply.text ||
                reply.attachment?.slice(reply.attachment.indexOf("_") + 1) ||
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

      <FileUploader
        setFiles={setFiles}
        setIsSendModalOpen={setIsSendModalOpen}
      />
      <input
        id="comment-input"
        type="text"
        value={isEditModalOpen || isSendModalOpen ? "" : text}
        onChange={onChange}
        placeholder="Напишіть коментар..."
        autoComplete="off"
      />
      <EmojiPickerButton setText={setText} />
      {(editId === -1 || isEditModalOpen || isSendModalOpen) && (
        <div onClick={sendComment}>
          <img src={sendMessageIcon} alt="Send" />
        </div>
      )}
      {editId !== -1 && !isEditModalOpen && !isSendModalOpen && (
        <>
          <MdEdit size="30px" onClick={editComment} />
          <img src={cancelIcon} alt="Cancel" onClick={onCancel} />
        </>
      )}
    </div>
  );
}
