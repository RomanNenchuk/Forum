import multer from "multer";
import { pool } from "../db.js";
import cloudinary from "../utils/cloudinary.js";

// Налаштування multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Максимум 5 МБ
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Непідтримуваний формат файлу"), false);
  },
});

export const saveImage = (req, res) => {
  upload.single("profileImage")(req, res, async err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const uid = req.params.id;

      // Завантаження на Cloudinary напряму з буфера
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        {
          folder: "profileImages",
          public_id: uid,
        }
      );

      // Оновлення URL зображення в базі даних
      const query = `
        UPDATE users
        SET avatar = $1
        WHERE uid = $2
        RETURNING *`;
      const updatedUser = await pool.query(query, [result.secure_url, uid]);

      return res.status(200).json({
        message: "Image is successfully uploaded!",
        fileUrl: result.secure_url,
        user: updatedUser.rows[0],
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Error uploading image" });
    }
  });
};

export const deleteAvatar = async (req, res) => {
  try {
    const uid = req.params.id;

    // Оновлення аватара в БД одразу
    const updateQuery = `
      UPDATE users
      SET avatar = NULL
      WHERE uid = $1
      RETURNING avatar`;
    const result = await pool.query(updateQuery, [uid]);

    // якщо користувача немає
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await cloudinary.uploader.destroy(`profileImages/${uid}`);

    return res.status(200).json({ message: "Image successfully deleted!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error deleting image" });
  }
};
