import React from "react";
import "./ContextMenu.css";

function findMessageById(messages, id) {
  const message = messages.find(msg => msg.id === id);
  if (message) {
    return {
      text: message.text,
      attachments: message.attachments,
    };
  } else {
    return null; // Повідомлення не знайдено
  }
}

export default function ContextMenu({
  positionX,
  positionY,
  isToggled,
  contextMenuRef,
  contextMenu,
  resetContextMenu,
  deleteMessage,
  resetEdit,
  getMessage,
  setText,
  setEditId,
  setFiles,
  currentUser,
}) {
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
        resetContextMenu();
        const dbFiles = contextMenu.selectedMessageItem.attachments.map(
          url => ({
            name: url.split("/").pop(),
            url,
            isFromDatabase: true,
          })
        );
        setFiles(prevFiles => [...dbFiles, ...prevFiles]);
        console.log(dbFiles);
        //
        getMessage({
          msg_id: contextMenu.selectedMessage,
          callback: res => {
            if (res.text && res.sender_id === currentUser.uid) {
              setText(res.text);
              setEditId(contextMenu.selectedMessage);
            } else {
              resetEdit();
            }
          },
        });
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
