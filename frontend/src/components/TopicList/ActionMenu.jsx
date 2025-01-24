import React from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import ContextMenu from "../ContextMenu/ContextMenu.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import "./TopicList.css";

export default function ActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
  actionMenu,
  deleteTopic,
}) {
  const { currentUser } = useAuth();
  const buttons = [
    {
      text: "Видалити",
      icon: deleteIcon,
      onClick:
        actionMenu.selectedTopicItem?.author === currentUser?.uid
          ? () => {
              deleteTopic(actionMenu.selectedTopic);
            }
          : null,
    },
  ].filter(button => button.onClick);

  return (
    <menu
      ref={actionMenuRef}
      style={{
        top: positionY + 20 + "px",
        left: positionX,
      }}
      className={`context-menu ${isToggled && buttons?.length ? "active" : ""}`}
    >
      {buttons.map(({ text, icon, onClick }, index) => (
        <button
          key={index}
          onClick={e => {
            e.stopPropagation();
            if (onClick) {
              onClick();
              resetActionMenu();
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
