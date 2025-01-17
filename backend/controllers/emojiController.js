import { pool } from "../db.js"; // Підключення до бази даних

export const setTopicReaction = async (req, res) => {
  const topicId = req.params.id;
  const { reaction } = req.body;
  const { uid } = req.user;

  try {
    // знаходжу emoji_id за ім'ям emoji
    const emojiQuery = `
      SELECT id FROM emoji
      WHERE name = $1
    `;
    const emojiResult = await pool.query(emojiQuery, [reaction]);

    if (emojiResult.rowCount === 0) {
      return res.status(404).json({ message: "Emoji not found" });
    }

    const emojiId = emojiResult.rows[0].id;

    // перевіряю, чи користувач ставив якусь реакцію під цією темою
    const existingReactionQuery = `
      SELECT id, emoji_id 
      FROM reactions
      WHERE topic_id = $1 AND user_id = $2
    `;

    const existingReactionResult = await pool.query(existingReactionQuery, [
      topicId,
      uid,
    ]);

    // якщо ставив
    if (existingReactionResult.rowCount > 0) {
      const existingReaction = existingReactionResult.rows[0];

      // і якщо нова реакція збігається з існуючою, видаляємо її
      if (existingReaction.emoji_id === emojiId) {
        const deleteQuery = `
          DELETE FROM reactions
          WHERE id = $1
          RETURNING *;
        `;
        const deleteResult = await pool.query(deleteQuery, [
          existingReaction.id,
        ]);
        return res.status(200).json({
          message: "Reaction removed",
          reaction: deleteResult.rows[0],
        });
      }

      // якщо нова реакція відрізняється, оновлюємо
      const updateQuery = `
        UPDATE reactions
        SET emoji_id = $1, timestamp = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;
      const updateResult = await pool.query(updateQuery, [
        emojiId,
        existingReaction.id,
      ]);
      return res
        .status(200)
        .json({ message: "Reaction updated", reaction: updateResult.rows[0] });
    }

    // якщо реакції ще немає, додаємо нову
    const insertQuery = `
      INSERT INTO reactions (user_id, topic_id, emoji_id, timestamp)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [uid, topicId, emojiId]);
    return res
      .status(201)
      .json({ message: "Reaction added", reaction: insertResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
