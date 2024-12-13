import React, { useContext, useState, createContext } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const UserInfoContext = createContext();

export function useUserInfo() {
  return useContext(UserInfoContext);
}

export function UserInfoProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [createdAt, setCreatedAt] = useState("");
  const { token } = useAuth();

  async function fetchAvatar() {
    try {
      const response = await axios.get(
        `http://localhost:5000/user/profile-image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Очікуємо Blob-дані
        }
      );

      // Цей код написано, щоб при відсутності аватарки на стороні сервера нам не кидало помилку
      const isJson =
        response.headers["content-type"]?.includes("application/json");
      if (isJson) {
        const text = await response.data.text(); // Конвертуємо Blob у текст
        const json = JSON.parse(text); // Парсимо JSON

        if (json.hasAvatar === false) return console.log("Avatar is not found");
      }

      // Інакше отримуємо цей бінарний файл і зберігаємо його у внутрішній пам'яті браузера
      const imageBlob = new Blob([response.data]);
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setAvatar(imageObjectURL); // Задаємо отриманий URL як джерело для зображення
    } catch (error) {
      console.error();
      ("Avatar is not found");
    }
  }

  async function getUserInfo() {
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:5000/user/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { username, avatar, formatted_date } = response.data;

      setUserName((n) => username);
      setCreatedAt((c) => formatted_date);
    } catch (error) {
      console.log("Даних про користувача не знайдено" + error);
    }
  }

  const value = {
    userName,
    setUserName,
    avatar,
    setAvatar,
    createdAt,
    setCreatedAt,
    fetchAvatar,
    getUserInfo,
  };

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}
