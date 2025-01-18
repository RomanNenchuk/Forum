import React from "react";
import ContextMenu from "../ContextMenu/ContextMenu.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import editIcon from "../../assets/edit-file.svg";
import replyIcon from "../../assets/reply-context-menu.svg";

export default function TopicContextMenu({
  positionX,
  positionY,
  isToggled,
  contextMenuRef,
  resetContextMenu,
  currentUser,
  contextMenu,
  deleteComment,
  setEditId,
  setText,
  setReply
}) {
  const buttons = [
      {
        text: "Видалити",
        icon: deleteIcon,
        onClick: (contextMenu.selectedCommentItem?.author_id === currentUser?.uid ? () => {
          deleteComment(contextMenu.selectedComment);
        } : null),
      },
      {
        text: "Редагувати",
        icon: editIcon,
        onClick: (contextMenu.selectedCommentItem?.author_id == currentUser?.uid ? () => {
          setEditId(contextMenu.selectedComment);
          setText(contextMenu.selectedCommentItem.text);
        } : null),
      },
      {
        text: "Відповісти",
        icon: replyIcon,
        onClick: (contextMenu.selectedCommentItem?.reply === -1 ? () => {
          setReply(contextMenu.selectedCommentItem);
        } : null),
      },
    ].filter(button => button.onClick);
  return(
    <ContextMenu
      positionX={positionX}
      positionY={positionY}
      isToggled={isToggled}
      contextMenuRef={contextMenuRef}
      buttons={buttons}
      resetContextMenu={resetContextMenu}
    />
  );
}