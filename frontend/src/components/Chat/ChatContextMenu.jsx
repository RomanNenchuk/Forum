import React from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import deleteIcon from "../../assets/delete-context-menu.svg";
import editIcon from "../../assets/edit-file.svg";
import replyIcon from "../../assets/reply-context-menu.svg";

export default function ChatContextMenu(props) {
  const {
    positionX,
    positionY,
    isToggled,
    contextMenuRef,
    resetContextMenu,
    deleteMessage,
    resetEdit,
    setIsEditModalOpen,
    setText,
    setEditId,
    setFiles,
    currentUser,
    setReply,
    contextMenu,
  } = props;

  const buttons = [
    {
      text: "Видалити",
      icon: deleteIcon,
      onClick: deleteMessage
        ? () => {
            deleteMessage(contextMenu.selectedMessage);
            resetEdit();
          }
        : null,
    },
    {
      text: "Редагувати",
      icon: editIcon,
      onClick:
        contextMenu.selectedMessageItem?.sender_id === currentUser.uid
          ? () => {
              const dbFiles = contextMenu.selectedMessageItem?.attachments?.map(
                url => ({
                  name: url.split("/").pop(),
                  url,
                  isFromDatabase: true,
                })
              );

              if (dbFiles) setFiles(prevFiles => [...dbFiles, ...prevFiles]);

              console.log(contextMenu.selectedMessageItem);
              setText(contextMenu.selectedMessageItem?.text || "");
              setEditId(contextMenu.selectedMessage);

              if (contextMenu.selectedMessageItem?.attachments?.length) {
                setIsEditModalOpen(true);
              }
            }
          : null,
    },
    {
      text: "Відповісти",
      icon: replyIcon,
      onClick: setReply
        ? () => {
            console.log(contextMenu.selectedMessageItem);
            setReply({
              id: contextMenu.selectedMessageItem.id,
              author: contextMenu.selectedMessageItem.fullname,
              text: contextMenu.selectedMessageItem.text,
              attachment: contextMenu.selectedMessageItem.attachments[0],
            });
          }
        : null,
    },
  ].filter(button => button.onClick);

  return (
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
