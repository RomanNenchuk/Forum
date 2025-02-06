import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import ActionMenu from "../PopupMenus/ActionMenu.jsx";
import ToastPortal from "../Toast/Toast.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import copyIcon from "../../assets/copy-icon.svg";
import savePlusIcon from "../../assets/save-plus.svg";
import saveMinusIcon from "../../assets/save-minus.svg";

export default function TopicActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
  actionMenu,
  onDeleteClick,
  handleTopicToUser,
  isTopicSaved,
}) {
  const { currentUser } = useAuth();
  const [toast, setToast] = useState(null);

  const handleCopyClick = topicId => {
    navigator.clipboard.writeText(
      `${window.location.origin}/topics/${topicId}`
    );

    if (toast) clearTimeout(toast.timeoutId);

    setToast({
      message: "Скопійовано до буфера обміну",
      type: "success",
      timeoutId: setTimeout(() => setToast(null), 3000),
    });
  };

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
      text: isTopicSaved ? "Не зберігати" : "Зберегти тему",
      icon: isTopicSaved ? saveMinusIcon : savePlusIcon,
      onClick:
        currentUser && actionMenu.selectedTopicItem?.author !== currentUser.uid
          ? () => handleTopicToUser(currentUser.uid, actionMenu.selectedTopic)
          : null,
    },
    {
      text: "Скопіювати URL",
      icon: copyIcon,
      onClick: () => handleCopyClick(actionMenu.selectedTopicItem.id),
    },
  ].filter(button => button.onClick);
  return (
    <>
      <ActionMenu
        positionX={positionX}
        positionY={positionY}
        isToggled={isToggled}
        actionMenuRef={actionMenuRef}
        buttons={buttons}
        resetActionMenu={resetActionMenu}
      />
      {toast && (
        <ToastPortal
          message={toast.message}
          type={toast.type}
          item={toast.item}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
