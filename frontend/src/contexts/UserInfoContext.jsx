import React, { useContext, useState, useEffect, createContext } from "react";
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
          responseType: "blob", // Вказуємо, що ми очікуємо Blob-дані
        }
      );
      const imageBlob = new Blob([response.data]);
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setAvatar(imageObjectURL); // Задаємо отриманий URL як джерело для зображення
    } catch (error) {
      console.error("Помилка завантаження зображення:", error);
    }
  }

  async function getUserInfo() {
    if (!token) return;

    const response = await axios.get("http://localhost:5000/user/info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { username, avatar, createdAt } = response.data;

    setUserName((n) => username);
    setCreatedAt((c) => createdAt);
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
