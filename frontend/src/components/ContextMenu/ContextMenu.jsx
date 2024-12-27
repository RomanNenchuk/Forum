import React from "react";
import "./ContextMenu.css";

export default function ContextMenu({
  positionX,
  positionY,
  isToggled,
  buttons,
  contextMenuRef,
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
      {buttons.map((button, index) => {
        function handleClick(e) {
          e.stopPropagation();
          button.onClick();
        }

        return (
          <button
            onClick={handleClick}
            key={index}
            className="context-menu-button"
          >
            <span>{button.text}</span>
            <span className="icon">{button.icon}</span>
          </button>
        );
      })}
    </menu>
  );
}
