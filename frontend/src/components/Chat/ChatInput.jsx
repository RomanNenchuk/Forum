import React, { useState, useRef } from "react";
import FileUploader from "../FileUploader.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import sendSmileIcon from "../../assets/send-smile.svg";
import { MdEdit } from "react-icons/md";

export default function ChatInput({
  setIsModalOpen,
  setFiles,
  fileInputRef,
  text,
  setText,
  sendMessage,
  editMessage,
  editId,
  setEditId,
  replyId,
  resetReply,
  getMessage,
  getUserFullname,
}) {
  const [replyText, setReplyText] = useState(null);
  const [replyAuthor, setReplyAuthor] = useState(null);
  if (replyId !== -1) {
    getMessage({
      msg_id: replyId,
      callback: (res1) => {
          setReplyText(res1.text);
          getUserFullname({
            userId: res1.sender_id, 
            callback: (res2) => {
              setReplyAuthor(res2.fullname);
            }
          });
      },
    });
  }
  return (
    <div className="chat-reply-input">
      {replyId !== -1 && <div className="chat-reply">
        <span>{replyAuthor || "Невідомий автор"}</span>
        <span>: {replyText || "*Видалене повідомлення*"}</span>
        <button onClick={() => resetReply()}>Х</button>
      </div>}
      <div className="chat-input">
        <FileUploader
          setFiles={setFiles}
          fileInputRef={fileInputRef}
          editId={editId}
          setIsModalOpen={setIsModalOpen}
        />
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Напишіть повідомлення..."
        />
        <div className="send-smile-btn" onClick={sendMessage}>
          <img src={sendSmileIcon} alt="Smile" />
        </div>

        {editId === -1 && (
          <div className="send-msg-btn" onClick={sendMessage}>
            <img src={sendMessageIcon} alt="Send" />
          </div>
        )}
        {editId !== -1 && <MdEdit size={30} onClick={editMessage} />}
        {editId !== -1 && (
          <button onClick={() => setEditId(-1)}>Скасувати</button>
        )}
      </div>
    </div>
  );
}
