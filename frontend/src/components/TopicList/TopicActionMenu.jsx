import React from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import ActionMenu from "../PopupMenus/ActionMenu.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";

export default function TopicActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
  actionMenu,
  onDeleteClick,
  handleTopicToUser,
  switchText,
  handleShareClick,
}) {
  const { currentUser } = useAuth();

  const buttons = [
    {
      text: "Видалити",
      icon: deleteIcon,
      onClick:
        actionMenu.selectedTopicItem?.author === currentUser?.uid
          ? () => {
              onDeleteClick(actionMenu.selectedTopic);
            }
          : null,
    },
    {
      text: switchText,
      icon: null,
      onClick: 
        actionMenu.selectedTopicItem?.author !== currentUser?.uid ? 
        () => handleTopicToUser(currentUser.uid, actionMenu.selectedTopic) : null,
    },
    {
      text: "Переслати",
      icon: null,
      onClick: () => handleShareClick(),
    }
  ].filter(button => button.onClick);
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
