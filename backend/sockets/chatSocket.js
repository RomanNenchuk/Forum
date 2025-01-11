import {
  saveMessage,
  deleteMessage,
  editMessage,
} from "../controllers/chatController.js";
import { deleteAttachments } from "../controllers/fileController.js";

const activeChats = new Map();

export const chatSocket = io => {
  io.on("connection", socket => {
    const id = socket.handshake.query.id;
    socket.join(id);
    console.log(id);

    socket.on("join-chat", ({ user_id, chat_id }) => {
      activeChats.set(user_id, chat_id);
    });

    socket.on("leave-chat", user_id => {
      activeChats.delete(user_id);
    });

    socket.on(
      "send-message",
      async (
        { id, fullname, sender_id, text, attachments, timestamp },
        recipient_id,
        callback
      ) => {
        try {
          const chat_id = [recipient_id, sender_id]
            .sort((a, b) => a.localeCompare(b))
            .join("_");

          let isActive = activeChats.get(recipient_id) === chat_id;
          id = await saveMessage({
            chat_id,
            recipient_id,
            sender_id,
            text,
            attachments,
            timestamp,
            read: isActive,
          });

          if (isActive) {
            socket.to(recipient_id).emit("receive-message", {
              id,
              attachments,
              fullname,
              sender_id,
              text,
              timestamp,
            });
          }
          // надсилаю id доданого повідомлення, як результат, через колбек
          callback(id);
        } catch (error) {
          console.error(error);
        }
      }
    );

    socket.on(
      "delete-message",
      async ({ msg_id, initiator_id, recipient_id }) => {
        try {
          const attachments = await deleteMessage(msg_id);
          const chat_id = [initiator_id, recipient_id]
            .sort((a, b) => a.localeCompare(b))
            .join("_");
          if (activeChats.get(recipient_id) === chat_id) {
            socket.to(recipient_id).emit("delete-message", msg_id);
          }
          if (Array.isArray(attachments)) await deleteAttachments(attachments);
        } catch (error) {
          console.error(error);
        }
      }
    );

    socket.on(
      "edit-message",
      async (msg, filesToDelete, initiator_id, recipient_id) => {
        try {
          const chat_id = [initiator_id, recipient_id]
            .sort((a, b) => a.localeCompare(b))
            .join("_");
          await editMessage(msg);

          if (activeChats.get(recipient_id) === chat_id) {
            socket.to(recipient_id).emit("edit-message", msg);
          }
          if (Array.isArray(filesToDelete) && filesToDelete.length)
            await deleteAttachments(filesToDelete);
        } catch (error) {
          console.error(error);
        }
      }
    );
  });
};
