import { pool } from "../db.js";

export const saveUser = async (req, res) => {
  try {
    // Дані з req.user (JWT токен) та req.body (додаткові дані з клієнта)
    const { uid, email } = req.user;
    console.log(req.user);

    const { fullName, profilePicture, joinedAt } = req.body;

    // Перевірка, чи користувач вже існує
    const result = await pool.query("SELECT * FROM users WHERE uid = $1", [
      uid,
    ]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Додавання нового користувача
    const createdAt = joinedAt ? joinedAt : new Date(); // Поточна дата, якщо joinedAt не надано
    const newUser = await pool.query(
      `INSERT INTO users (uid, username, email, avatar, created_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [uid, fullName, email, profilePicture, createdAt]
    );

    res.status(201).json({
      message: "User created successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const uid = req.params.id;
    const { userName, email } = req.body;

    // Перевірка, чи користувач існує
    const result = await pool.query(`SELECT * FROM users WHERE uid = $1`, [
      uid,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Оновлення користувача
    const updateData = [];
    const fields = [];

    if (userName) {
      fields.push(`username = $${fields.length + 1}`);
      updateData.push(userName);
    }

    if (email) {
      fields.push(`email = $${fields.length + 1}`);
      updateData.push(email);
    }

    // Якщо немає даних для оновлення
    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updateData.push(uid); // UID для WHERE

    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE uid = $${fields.length + 1}
      RETURNING *`;

    const updatedUser = await pool.query(query, updateData);
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const uid = req.params.id;

    // Знайти користувача за UID
    const result = await pool.query(
      "SELECT username, avatar, TO_CHAR(created_at, 'DD.MM.YYYY') AS formatted_date, email FROM users WHERE uid = $1",
      [uid]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    // Відправка даних користувача
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
