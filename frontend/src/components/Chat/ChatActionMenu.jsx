import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import ActionMenu from "../PopupMenus/ActionMenu.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import cleanIcon from "../../assets/clean.svg";

export default function TopicActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
}) {
  const { deleteChat, clearChat } = useChat();
  const { currentUser } = useAuth();
  const { receiverId } = useParams();
  const buttons = [
    {
      text: "Видалити",
      icon: deleteIcon,
      onClick: () => {
        deleteChat(receiverId, currentUser.uid);
      },
    },
    {
      text: "Очистити",
      icon: cleanIcon,
      onClick: () => {
        clearChat(receiverId, currentUser.uid);
      },
    },
  ];
  return (
    <ActionMenu
      positionX={positionX}
      positionY={positionY}
      isToggled={isToggled}
      actionMenuRef={actionMenuRef}
      buttons={buttons}
      resetActionMenu={resetActionMenu}
    />
  );
}
