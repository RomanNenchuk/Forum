import React from "react";
import "./PopupMenu.css";

export default function ContextMenu({
  positionX,
  positionY,
  isToggled,
  contextMenuRef,
  buttons = [],
  resetContextMenu,
}) {
  return (
    <menu
      ref={contextMenuRef}
      style={{
        top: positionY + 2 + "px",
        left: positionX + 2 + "px",
      }}
      className={`context-menu ${isToggled ? "active" : ""}`}
    >
      {buttons.map(({ text, icon, onClick }, index) => (
        <button
          key={index}
          onClick={e => {
            e.stopPropagation();
            if (onClick) {
              onClick();
              resetContextMenu();
            }
          }}
          className={`context-menu-button ${!onClick ? "disabled" : ""}`}
          disabled={!onClick}
        >
          <span>{text}</span>
          <img src={icon} width="20" height="20" alt={text} className="icon" />
        </button>
      ))}
    </menu>
  );
}
