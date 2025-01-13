import React from "react";
import { useChat } from "../../contexts/ChatContext";
import "./ContextMenu.css";

export default function ContextMenu({
  positionX,
  positionY,
  isToggled,
  contextMenuRef,
  contextMenu,
  resetContextMenu,
  deleteMessage,
  resetEdit,
  setIsEditModalOpen,
  text,
  setText,
  setEditId,
  setFiles,
  currentUser,
  setReply,
}) {
  const { messages } = useChat();

  const buttons = [
    {
      text: "Delete",
      icon: "🗑️",
      onClick: () => {
        resetContextMenu();
        deleteMessage(contextMenu.selectedMessage);
        resetEdit();
      },
    },
    {
      text: "Edit",
      icon: "🖋️",
      onClick: () => {
        const dbFiles = contextMenu.selectedMessageItem?.attachments?.map(
          url => ({
            name: url.split("/").pop(),
            url,
            isFromDatabase: true,
          })
        );
        if (dbFiles) setFiles(prevFiles => [...dbFiles, ...prevFiles]);

        const selectedMessage = messages.find(
          message =>
            message.id === contextMenu.selectedMessage &&
            message.sender_id === currentUser.uid
        );

        if (selectedMessage) {
          setText(selectedMessage.text || "");
          setEditId(contextMenu.selectedMessage);
          console.log(contextMenu.selectedMessage);

          if (selectedMessage.attachments?.length) {
            setIsEditModalOpen(true);
          }
        } else {
          resetEdit();
        }
        resetContextMenu();
      },
    },
    {
      text: "Reply",
      icon: "↪️",
      onClick: () => {
        resetContextMenu();
        setReply(contextMenu.selectedMessage);
      },
    },
  ];

  return (
    <menu
      ref={contextMenuRef}
      style={{
        top: positionY + 2 + "px",
        left: positionX + 2 + "px",
      }}
      className={`context-menu ${isToggled ? "active" : ""}`}
    >
      {buttons.map((button, index) => (
        <button
          onClick={e => {
            e.stopPropagation();
            button.onClick();
          }}
          key={index}
          className="context-menu-button"
        >
          <span>{button.text}</span>
          <span className="icon">{button.icon}</span>
        </button>
      ))}
    </menu>
  );
}
