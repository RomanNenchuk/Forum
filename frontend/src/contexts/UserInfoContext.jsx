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
      setAvatar((a) => avatar);
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
    getUserInfo,
  };

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}
