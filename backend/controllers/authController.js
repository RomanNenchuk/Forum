import { pool } from "../db.js";

export const checkUserRegistration = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE uid = $1`, [id]);

    if (result.rows.length > 0) {
      res.status(200).json({ message: "User found" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
