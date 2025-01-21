import { pool } from "../db.js";

// для відображення на головній сторінці
export const getTopicsPreview = async (req, res) => {
  const { page = 1, limit = 10, sort, user_id, tags } = req.query;
  const offset = (page - 1) * limit;

  const sortCriteria = {
    asc: "topics.date ASC",
    desc: "topics.date DESC",
    rating: "rating DESC",
  };
  const orderBy = sortCriteria[sort] || "topics.date DESC";

  try {
    let tagsFilterQuery = "";
    let tagsParams = [];
    if (tags) {
      const tagList = tags.split(",").map(tag => tag.trim());
      tagsParams = [...tagList];
      const placeholders = tagList
        .map((_, index) => `$${index + 3}`)
        .join(", ");
      tagsFilterQuery = `
        AND topics.id IN (
          SELECT topic_id
          FROM topic_tags
          INNER JOIN tags ON tags.tag_id = topic_tags.tag_id
          WHERE tags.tag_name IN (${placeholders})
        )
      `;
    }

    // Основний запит для тем
    const topicsResult = await pool.query(
      `
      SELECT 
        topics.id, 
        fullname AS author_full_name, 
        username, 
        avatar AS author_avatar, 
        title, 
        email, 
        author, 
        COALESCE(SUM(emoji.score), 0) AS rating,
        topics.date
      FROM topics
      INNER JOIN users ON users.uid = topics.author
      LEFT JOIN reactions
        ON topics.id = reactions.topic_id
      LEFT JOIN emoji
        ON emoji.id = reactions.emoji_id
      WHERE 1=1
        ${tagsFilterQuery}
      GROUP BY 
        topics.id, 
        fullname, 
        username, 
        avatar, 
        title, 
        email, 
        author, 
        topics.date
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2;
      `,
      [limit, offset, ...tagsParams]
    );

    const topics = topicsResult.rows;

    // Запит для всіх реакцій
    const reactionsResult = await pool.query(
      `
      SELECT 
        topic_id,
        emoji.name,
        emoji.icon,
        COUNT(*) AS count
      FROM reactions
      INNER JOIN emoji ON reactions.emoji_id = emoji.id
      GROUP BY topic_id, emoji.name, emoji.icon;
      `
    );

    const reactions = reactionsResult.rows;

    // Запит для реакцій конкретного користувача (якщо user_id передано)
    let userReactions = [];
    if (user_id) {
      const userReactionsResult = await pool.query(
        `
        SELECT 
          topic_id, 
          emoji.name AS name
        FROM reactions
        LEFT JOIN emoji ON reactions.emoji_id = emoji.id
        WHERE user_id = $1;
        `,
        [user_id]
      );
      userReactions = userReactionsResult.rows;
    }

    // Формування фінального результату
    const topicsWithReactions = topics.map(topic => {
      const topicReactions = reactions
        .filter(reaction => reaction.topic_id === topic.id)
        .map(reaction => ({
          icon: reaction.icon,
          name: reaction.name,
          count: parseInt(reaction.count, 10),
        }));

      const userReaction = userReactions.find(
        reaction => reaction.topic_id === topic.id
      );

      return {
        ...topic,
        reactions: topicReactions,
        user_reaction: userReaction || null,
      };
    });

    res.status(200).json(topicsWithReactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    // 1. базова інформація про тему
    const topicResult = await pool.query(
      `
      SELECT 
        topics.id,
        uid, 
        fullname AS authorFullName, 
        username, 
        avatar, 
        title, 
        author, 
        description, 
        attachments, 
        TO_CHAR(topics.date, 'DD.MM.YYYY') AS formatted_date 
      FROM topics 
      INNER JOIN users 
        ON topics.author = users.uid 
      WHERE topics.id = $1
      `,
      [id]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const topic = topicResult.rows[0];

    // 2. всі реакції до теми
    const reactionsResult = await pool.query(
      `
      SELECT 
        emoji.name AS name, 
        emoji.icon AS icon, 
        COUNT(*) AS count
      FROM reactions
      INNER JOIN emoji ON reactions.emoji_id = emoji.id
      WHERE reactions.topic_id = $1
      GROUP BY emoji.name, emoji.icon
      `,
      [id]
    );

    const reactions = reactionsResult.rows.map(reaction => ({
      name: reaction.name,
      icon: reaction.icon,
      count: parseInt(reaction.count, 10),
    }));

    // 3. реакція конкретного користувача (якщо user_id передано)
    let userReaction = null;
    if (user_id) {
      const userReactionResult = await pool.query(
        `
        SELECT 
          emoji.name AS name, 
          emoji.icon AS icon
        FROM reactions
        INNER JOIN emoji ON reactions.emoji_id = emoji.id
        WHERE reactions.topic_id = $1 AND reactions.user_id = $2
        LIMIT 1
        `,
        [id, user_id]
      );

      if (userReactionResult.rows.length > 0) {
        userReaction = userReactionResult.rows[0];
      }
    }

    // 4. результати
    res.status(200).json({
      ...topic,
      reactions,
      user_reaction: userReaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const saveTopic = async (req, res) => {
  const {
    title,
    author,
    tags = [],
    description,
    rating = 0,
    status = "active",
    attachments = [],
  } = req.body;

  const client = await pool.connect();

  try {
    let processedTags = tags?.filter(tag => tag);
    if (!processedTags.length) processedTags.push("u_tag");

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
    await client.query(tagInsertQuery, [processedTags]);

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
    const tagsResult = await client.query(getTagsIdQuery, [processedTags]);
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
      u.username AS author_username,
      u.avatar,
      o.text AS reply_text,
      o.timestamp AS reply_timestamp
    FROM 
      comments c
    LEFT JOIN
      users u ON c.author_id = u.uid
    LEFT JOIN
      comments o ON c.reply = o.id
    WHERE 
      c.topic_id = $1
    ORDER BY 
      c.id ASC;
    `;
    const result = (await pool.query(query, [id])).rows;
    res.status(200).json(result ?? []);
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
      reply_text = (await pool.query(reply_text_query, [comm.reply])).rows[0]
        .text;
    }
    res.status(200).json({
      id: result.rows[0].id,
      reply_text: reply_text,
    });
  } catch (error) {
    console.error("PostNewComment error:", error);
    res.status(500);
  }
};

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
};

export const editComments = async (req, res) => {
  const { text, attachments, id } = req.body;
  try {
    const query = `
      UPDATE comments 
      SET text = $1, attachments = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [text, attachments, id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error with editComments: ", error);
    res.status(500);
  }
};
