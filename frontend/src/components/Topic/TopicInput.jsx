import React, { useState } from "react";
import FileUploader from "../FileUploader.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import sendSmileIcon from "../../assets/send-smile.svg";
import { MdEdit } from "react-icons/md";
import cancelIcon from "../../assets/cancel.svg";

export default function TopicInput({
  isEditModalOpen,
  isSendModalOpen,
  setIsEditModalOpen,
  setIsSendModalOpen,
  setFiles,
  text,
  setText,
  sendComment,
  editComment,
  editId,
  onCancel,
  reply,
  resetReply,
}) {
  function onChange(e) {
    if (isEditModalOpen || isSendModalOpen) return;
    setText(e.target.value);
  }

  return (
    <div>
      {reply && <div>
        <span>{reply.author_username}</span>
        <span>: {reply.text}</span>
        <button onClick={() => resetReply()}>Х</button>
      </div>}
      <div style = {{display: "flex", flexDirection: "row",alignItems:"center", width: "95%", gap: "0.5vh"}}>
          {/* <FileUploader
            setFiles={setFiles}
            editId={editId}
            setIsEditModalOpen={setIsEditModalOpen}
            setIsSendModalOpen={setIsSendModalOpen}
            text={text}
            setText={text}
          /> */}
          <input
            type="text"
            value={isEditModalOpen || isSendModalOpen ? "" : text}
            onChange={onChange}
            placeholder="Напишіть повідомлення..."
            style = {{flex: "1", height: "4vh",}}
          />
          <div onClick={sendComment}>
            <img style = {{width: "3vh", height: "3vh"}} src={sendSmileIcon} alt="Smile" />
          </div>
          {(editId === -1 || isEditModalOpen || isSendModalOpen) && (
            <div onClick={sendComment}>
              <img style = {{width: "3vh", height: "3vh"}} src={sendMessageIcon} alt="Send" />
            </div>
          )}
          {editId !== -1 && !isEditModalOpen && !isSendModalOpen && (
            <>
              <MdEdit size="3vh" onClick={editComment} />
              <img src={cancelIcon} alt="Cancel" onClick={onCancel} />
            </>
          )}
        </div>
    </div>
  );
}