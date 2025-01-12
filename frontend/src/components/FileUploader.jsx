import React, { useRef } from "react";
import { useChat } from "../contexts/ChatContext.jsx";
import addFileIcon from "../assets/add-file.svg";
import editFileIcon from "../assets/edit-file.svg";

export default function FileUploader({
  setFiles,
  editId,
  setIsEditModalOpen,
  setIsSendModalOpen,
}) {
  const { messages } = useChat();
  const fileInputRef = useRef();

  function handleImageClick() {
    fileInputRef.current.click();
  }

  function hasAttachments() {
    const message = messages.find(msg => msg.id === editId);
    return message?.attachments?.length > 0 || false;
  }

  // if (editId !== -1 && !hasAttachments()) return null;

  return (
    <div>
      <img
        src={addFileIcon}
        style={{ cursor: "pointer" }}
        alt="Add file"
        onClick={handleImageClick}
      />

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={e => {
          setFiles(
            Array.from(e.target.files).map(file => ({
              data: file,
              name: file.name,
              isFromDatabase: false,
            }))
          );
          setIsSendModalOpen(true);
        }}
        multiple
      />
    </div>
  );
}
