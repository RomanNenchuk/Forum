import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import TopBar from "./TopBar.jsx";
import SideBar from "./SideBar.jsx";
import "./Menu.css";

export default function Menu() {
  const { currentUser } = useAuth();
  const { avatar, getUserInfo, fullName } = useUserInfo();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) getUserInfo(currentUser.uid);
  }, [currentUser]);

  return (
    <div className="wrapper">
      <TopBar currentUser={currentUser} avatar={avatar} fullName={fullName} />
      <div className="forum-container">
        <SideBar />
        <Outlet />
      </div>
    </div>
  );
}
