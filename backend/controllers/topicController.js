import { pool } from "../db.js";

export const getTopics = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, avatar, title, tags, rating FROM Topics INNER JOIN Users ON Users.uid = Topics.author"
    );
    console.log(result);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No topics found" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};
