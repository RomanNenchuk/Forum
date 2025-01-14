import React, { useState, useRef, useEffect } from "react";
import FileUploader from "../FileUploader.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import sendSmileIcon from "../../assets/send-smile.svg";
import { MdEdit } from "react-icons/md";
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
  replyId,
  resetReply,
  getMessage,
  getUserFullname,
  onCancel,
}) {
  const [replyText, setReplyText] = useState(null);
  const [replyAuthor, setReplyAuthor] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setText("");
    };
  }, []);

  useEffect(() => {
    if (replyId !== -1) {
      getMessage({
        msg_id: replyId,
        callback: res1 => {
          setReplyText(res1.text);
          getUserFullname({
            userId: res1.sender_id,
            callback: res2 => {
              setReplyAuthor(res2.fullname);
            },
          });
        },
      });
    }
  }, [replyId]);

  function onChange(e) {
    if (isEditModalOpen || isSendModalOpen) return;
    setText(e.target.value);
  }
  return (
    <div className="chat-input">
      {replyId !== -1 && (
        <div className="reply-label">
          <div className="reply-label-info">
            <span className="reply-label-author">
              {replyAuthor || "Невідомий автор"}
            </span>
            <span>: {replyText || "*Видалене повідомлення*"}</span>
          </div>
          <img src={cancelIcon} alt="Cancel" onClick={() => resetReply()} />
        </div>
      )}

      <FileUploader
        setFiles={setFiles}
        editId={editId}
        setIsEditModalOpen={setIsEditModalOpen}
        setIsSendModalOpen={setIsSendModalOpen}
        text={text}
        setText={text}
      />

      <input
        type="text"
        value={isEditModalOpen || isSendModalOpen ? "" : text}
        onChange={onChange}
        ref={inputRef}
        placeholder="Напишіть повідомлення..."
      />
      <div className="send-smile-btn" onClick={sendMessage}>
        <img src={sendSmileIcon} alt="Smile" />
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
