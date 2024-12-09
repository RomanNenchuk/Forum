import multer from "multer";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Налаштування сховища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, "../profileImages"); // Повертає абсолютний шлях
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true }); // Створюємо папку, якщо її немає
    }
    cb(null, folderPath); // Вказуємо абсолютний шлях до папки
  },
  filename: (req, file, cb) => {
    try {
      const userID = req.user?.uid; // Отримуємо uid з req.user
      if (!userID) throw new Error("User ID не знайдено в токені.");

      // Додаємо розширення файлу
      const fileExtension = path.extname(file.originalname);
      const newFilename = `${userID}${fileExtension}`; // Назва файлу = userID + розширення
      cb(null, newFilename); // Установлюємо ім'я файлу
    } catch (err) {
      cb(err); // Передаємо помилку, якщо щось не так
    }
  },
});

// Фільтрація файлів (додатково, якщо потрібно)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Приймаємо файл
  } else {
    cb(new Error("Непідтримуваний формат файлу"), false); // Відхиляємо файл
  }
};

// Ініціалізація multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Максимальний розмір файлу: 5 МБ
  fileFilter,
});

export const saveImage = (req, res) => {
  // Вказано "profileImage", що є ім'ям input type="file"
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    res.status(200).json({
      message: "Файл успішно завантажено!",
      filePath: `/profileImages/${req.file.filename}`, // Шлях до файлу
    });
  });
};

export const getImage = (req, res) => {
  const { uid } = req.user;
  const filePath = path.join(__dirname, "../profileImages", `${uid}.png`);
  if (fs.existsSync(filePath)) {
    console.log("Exists");
    res.status(200).sendFile(filePath);
  } else {
    res.status(200).json({ hasAvatar: false });
  }
};
