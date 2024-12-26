import React, { useContext, useState, createContext } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const UserInfoContext = createContext();

export function useUserInfo() {
  return useContext(UserInfoContext);
}

export function UserInfoProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [createdAt, setCreatedAt] = useState("");
  const { currentUser, token } = useAuth();

  async function getUserInfo(id) {
    try {
      const response = await axios.get(`http://localhost:5000/users/${id}`);

      const { fullname, username, avatar, formatted_date, email } =
        response.data;

      if (id !== currentUser?.uid) {
        return {
          userName: username,
          fullName: fullname,
          avatar,
          createdAt: formatted_date,
          email,
        };
      }

      setUserName(n => username);
      setFullName(n => fullname);
      setAvatar(a => avatar);
      setCreatedAt(c => formatted_date);
    } catch (error) {
      console.log("Даних про користувача не знайдено " + error);
    }
  }

  async function saveUserInDB(token, userData) {
    try {
      const response = await axios.post(
        "http://localhost:5000/users",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Передаємо токен
          },
        }
      );

      return response.data; // Повертаємо відповідь, якщо потрібна
    } catch (error) {
      console.error("Error registering user on server:", error);
      throw error; // Кидаємо помилку далі для обробки
    }
  }

  const value = {
    userName,
    setUserName,
    fullName,
    setFullName,
    avatar,
    setAvatar,
    createdAt,
    setCreatedAt,
    getUserInfo,
    saveUserInDB,
  };

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}
