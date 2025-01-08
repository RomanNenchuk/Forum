import { pool } from "../db.js";

// для відображення на головній сторінці
export const getTopicsPreview = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `
      SELECT topics.id, fullname AS author_full_name, username, avatar AS author_avatar, 
             title, email, author, tags, rating 
      FROM topics 
      INNER JOIN Users ON Users.uid = topics.author
      ORDER BY topics.created_at DESC
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
      `SELECT uid, fullname AS authorFullName, username, avatar, title, author, tags, description, attachments, TO_CHAR(topics.created_at, 'DD.MM.YYYY') AS formatted_date FROM topics INNER JOIN users 
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
    tags,
    description,
    rating = 0,
    status = "active",
    access_level = "public",
    attachments = [],
  } = req.body;

  try {
    const query = `
        INSERT INTO topics (
          title, author, tags, description, rating, status, access_level, attachments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
    const values = [
      title,
      author,
      tags || null, // Масив тегів або null
      description || null, // Опис або null
      rating || 0,
      status,
      access_level || "public",
      attachments || null, // Масив вкладень або null
    ];

    const result = await pool.query(query, values);

    res.status(201).json({ message: "Topic created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.error(error);
  }
};
