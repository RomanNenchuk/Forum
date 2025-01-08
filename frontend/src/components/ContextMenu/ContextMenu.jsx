import React from "react";
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
  getMessage,
  setText,
  setEditId,
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
