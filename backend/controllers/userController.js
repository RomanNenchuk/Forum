import User from "../models/Users.js"; // Імпорт моделі User

export const saveUser = async (req, res) => {
  try {
    // Дані з req.user (JWT токен) та req.body (додаткові дані з клієнта)
    const { uid, email } = req.user; // Дані з Firebase токена
    const { fullName, profilePicture, joinedAt } = req.body; // Дані з клієнтської частини

    // Перевірка, чи користувач вже існує
    let existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Створення нового користувача
    const newUser = new User({
      uid,
      username: fullName, // Використовуємо fullName як username
      email,
      avatar: profilePicture,
      personalInfo: {
        fullName,
      },
      createdAt: joinedAt ? new Date(joinedAt) : undefined, // Якщо немає joinedAt, буде поточна дата
    });

    // Збереження користувача в базі
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Дані з req.user (JWT токен)
    const { uid } = req.user;
    const { userName, email } = req.body; // Дані з клієнтської частини

    // const { fullName, profilePicture, bio } = req.body; // Дані з клієнтської частини

    // Перевірка, чи користувач існує
    let existingUser = await User.findOne({ uid });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Створюємо об'єкт для оновлення
    const updateData = {};

    if (userName) updateData.username = userName; // Оновлення username, якщо воно передано

    if (email) updateData.email = email; // Оновлення email, якщо воно передано

    // Оновлення користувача
    const updatedUser = await User.findOneAndUpdate(
      { uid }, // Фільтр за uid
      updateData, // Передаємо лише ті поля, які потрібно оновити
      { new: true, runValidators: true } // Повернути оновленого користувача та запустити валідацію
    );

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const { uid } = req.user;

    // Знайти користувача за UID, вибираючи лише необхідні поля
    const user = await User.findOne({ uid }, "username avatar createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Відправляємо лише потрібну інформацію
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
