import { saveMessage, editMessage } from "../controllers/chatController.js";

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
      async ({ fullname, recipient_id, sender_id, text, timestamp }) => {
        const chat_id = [recipient_id, sender_id]
          .sort((a, b) => a.localeCompare(b))
          .join("_");

        let read = false;

        if (activeChats.get(recipient_id) === chat_id) {
          socket
            .to(recipient_id)
            .emit("receive-message", { fullname, text, sender_id, timestamp });
          read = true;
        }

        await saveMessage({
          chat_id,
          recipient_id,
          sender_id,
          chat_id,
          text,
          timestamp,
          read,
        });
      }
    );

    socket.on("edit-message", async ({msg_id, msg_text}) => {
      const edited_msg = {
        msg_text: msg_text, 
        msg_id: msg_id,
      }
      await editMessage(edited_msg);
    });
  });
};
