import { pool } from "../db.js";

export const getChatList = async (req, res) => {
  const { uid } = req.user;

  const query = `
  SELECT 
  chats.id AS chat_id, 
  CASE 
    WHEN chats.user1_id = $1 THEN chats.user2_id
    ELSE chats.user1_id
  END AS other_user_id,
  CASE 
    WHEN chats.user1_id = $1 THEN u2.fullname
    ELSE u1.fullname
  END AS other_user_name,
  last_message.text,
  last_message.sender_id AS last_message_sender_id,
  last_message.timestamp AS last_message_timestamp,
  COALESCE(unread_count.unread_messages, 0) AS unread_messages_count
  FROM chats
    INNER JOIN users u1 ON chats.user1_id = u1.uid
    INNER JOIN users u2 ON chats.user2_id = u2.uid
    LEFT JOIN LATERAL (
      SELECT 
        text, 
        sender_id, 
        timestamp
      FROM messages
      WHERE messages.chat_id = chats.id
      ORDER BY timestamp DESC
      LIMIT 1
    ) last_message ON true
    LEFT JOIN (
      SELECT 
        chat_id, 
        COUNT(*) AS unread_messages
      FROM messages
      WHERE read = false AND sender_id != $1
      GROUP BY chat_id
    ) unread_count ON chats.id = unread_count.chat_id
    WHERE chats.user1_id = $1 OR chats.user2_id = $1
    ORDER BY chats.timestamp DESC;
  `;

  try {
    const result = await pool.query(query, [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No chats found" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchOrCreateChat = async (req, res) => {
  const chat_id = req.params.id;
  const { sender_id, receiver_id } = req.body;

  const client = await pool.connect();

  try {
    // починаю транзакцію
    await client.query("BEGIN");

    const chatInsertQuery = `
      INSERT INTO chats (id, user1_id, user2_id, timestamp)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    const result = await pool.query(chatInsertQuery, [
      chat_id,
      sender_id,
      receiver_id,
    ]);

    const updateMessagesQuery = `
    UPDATE messages
    SET read = true
    WHERE chat_id = $1 AND read = false AND sender_id != $2;
    `;
    await pool.query(updateMessagesQuery, [chat_id, sender_id]);

    const messagesQuery = `
      SELECT 
          m.id, 
          u.fullname, 
          m.sender_id, 
          m.text, 
          m.attachments, 
          m.timestamp, 
          m.reply,
          r.text AS reply_text
      FROM 
          messages m
      INNER JOIN 
          users u ON m.sender_id = u.uid
      LEFT JOIN 
          messages r ON m.reply = r.id
      WHERE 
          m.chat_id = $1
      ORDER BY 
          m.timestamp ASC;
    `;
    const messages = await pool.query(messagesQuery, [chat_id]);
    
    // завершую транзакцію
    await client.query("COMMIT");

    res.status(200).json({
      chat_id,
      messages: messages.rows,
      isNewChat: result.rowCount > 0,
    });
  } catch (error) {
    console.error("Error handling chat:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const saveMessage = async ({
  sender_id,
  chat_id,
  text,
  attachments,
  timestamp,
  read,
  reply,
}) => {
  const query = `
    INSERT INTO messages (chat_id, sender_id, text, attachments, timestamp, read, reply)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const reply_text_query = `
   SELECT text FROM messages WHERE id = $1
  `;
  try {
    const result = await pool.query(query, [
      chat_id, // $1
      sender_id, // $2
      text, // $3
      attachments, // $4
      timestamp, // $5
      read, // $6
      reply, // &7
    ]);
    let reply_text = "";
    if (reply !== -1) {
      reply_text = (await pool.query(reply_text_query, [reply])).rows[0].text;
    }
    return {
      id: result.rows[0].id,
      reply_text,
    }
  } catch (error) {
    console.log(error);
  }
};

export const deleteMessage = async id => {
  const query = `DELETE FROM messages WHERE id = $1 RETURNING attachments`;
  try {
    const response = await pool.query(query, [id]);

    if (response.rows.length > 0) return response.rows[0].attachments;
    else return [];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete message");
  }
};

export const getMessage = async (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM messages WHERE id = $1`;
  try {
    const response = await pool.query(query, [id]);
    if (response.rows.length) {
      res.status(200).json({
        text: response.rows[0].text,
        sender_id: response.rows[0].sender_id,
      });
    } else {
      console.log(`msg with id ${id} not found`);
      res.status(200).json({});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
};

export const editMessage = async msg => {
  const query = `
    UPDATE messages 
    SET text = $1, attachments = $2
    WHERE id = $3
    RETURNING *;
    `;
  try {
    const result = await pool.query(query, [msg.text, msg.attachments, msg.id]);
  } catch (error) {
    console.error(error);
  }
};
