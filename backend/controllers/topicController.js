import { pool } from "../db.js";

// для відображення на головній сторінці
export const getTopicsPreview = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `
      SELECT topics.id, fullname AS author_full_name, username, avatar AS author_avatar, 
             title, email, author, rating 
      FROM topics 
      INNER JOIN Users ON Users.uid = topics.author
      ORDER BY topics.date DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTopic = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      `SELECT uid, fullname AS authorFullName, username, avatar, title, author, description, attachments, TO_CHAR(topics.date, 'DD.MM.YYYY') AS formatted_date FROM topics INNER JOIN users 
        ON topics.author = users.uid 
        WHERE topics.id = $1`,
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const saveTopic = async (req, res) => {
  const {
    title,
    author,
    tags = ["u_tag"],
    description,
    rating = 0,
    status = "active",
    attachments = [],
  } = req.body;

  const client = await pool.connect();

  try {
    // Починаємо транзакцію
    await client.query("BEGIN");

    // 1. Додати теги, яких ще немає в таблиці tags
    const tagInsertQuery = `
      WITH tags_array AS (
        SELECT UNNEST($1::TEXT[]) AS tag_name
      )
      INSERT INTO tags (tag_name)
      SELECT tag_name
      FROM tags_array
      ON CONFLICT (tag_name) DO NOTHING;
    `;
    await client.query(tagInsertQuery, [tags]);

    // 2. Створити новий запис в таблиці topics
    const topicInsertQuery = `
      INSERT INTO topics (
        title, author, description, rating, status, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const topicResult = await client.query(topicInsertQuery, [
      title,
      author,
      description || null,
      rating,
      status,
      attachments,
    ]);
    const topicId = topicResult.rows[0].id;

    // 3. Отримати ID всіх тегів, які передані
    const getTagsIdQuery = `
      SELECT tag_id FROM tags WHERE tag_name = ANY($1::TEXT[]);
    `;
    const tagsResult = await client.query(getTagsIdQuery, [tags]);
    const tagIds = tagsResult.rows.map(row => row.tag_id);

    // 4. Додати зв'язки між темою і тегами в таблицю topic_tags
    const topicTagsInsertQuery = `
      INSERT INTO topic_tags (topic_id, tag_id)
      VALUES ($1, UNNEST($2::INTEGER[]))
      ON CONFLICT DO NOTHING;
    `;
    await client.query(topicTagsInsertQuery, [topicId, tagIds]);

    // Завершення транзакції
    await client.query("COMMIT");

    res.status(201).json({ message: "Topic created successfully" });
  } catch (error) {
    // У разі помилки відміняємо транзакцію
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Internal server error" });
    console.error(error);
  } finally {
    client.release(); // Звільняємо клієнт
  }
};

export const getTopicComments = async (req, res) => {
  const id = req.params.id;
  try {
    const query = `
    SELECT 
      c.id,
      c.text,
      c.timestamp,
      c.author_id,
      c.topic_id,
      c.attachments,
      c.reply,
      o.text AS reply_text,
      u.username AS author_username,
      u.avatar
    FROM 
      comments c
    LEFT JOIN
      users u ON c.author_id = u.uid
    LEFT JOIN
      comments o ON c.reply = o.id
    WHERE 
      c.topic_id = $1
    ORDER BY 
      c.timestamp DESC;
    `;
    const result = await pool.query(query, [id]);
    res.status(200).json(result.rows ?? []);
  } catch (error) {
    console.error("getTopicComments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const PostNewComment = async (req, res) => {
  const comm = req.body;
  try {
    const query = `
      INSERT INTO comments (
        text, timestamp, author_id, topic_id, attachments, reply
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const reply_text_query = `
      SELECT text FROM comments WHERE id = $1
    `;
    const result = await pool.query(query, [
      comm.text,
      comm.timestamp,
      comm.author_id,
      comm.topic_id,
      comm.attachments,
      comm.reply,
    ]);
    let reply_text = "";
    if (comm.reply !== -1) {
      reply_text = await pool.query(reply_text_query, [comm.reply]);
    }
    res.status(200).json({
      id: result.rows[0].id,
      reply_text: reply_text,
    });
  } catch (error) {
    console.error("PostNewComment error:", error);
    res.status(500);
  }
}

export const deleteComment = async (req, res) => {
  const id = req.params.id;
  try {
    const query = `DELETE FROM comments WHERE id = $1 RETURNING attachments`;
    const response = await pool.query(query, [id]);

    res.status(200).json({
      attachments: response.rows.length > 0 ? response.rows[0].attachments : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}