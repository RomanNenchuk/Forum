import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import TopBar from "./TopBar.jsx";
import SideBar from "./SideBar.jsx";
import "./Menu.css";

export default function Menu() {
  const { currentUser } = useAuth();

  const { avatar, getUserInfo, fullName } = useUserInfo();
  const [isExpanded, setExpand] = useState(true);

  useEffect(() => {
    if (currentUser) getUserInfo(currentUser.uid);
  }, [currentUser]);

  return (
    <div className="wrapper">
      <TopBar currentUser={currentUser} avatar={avatar} fullName={fullName} />
      <div className="forum-container">
        <SideBar isExpanded={isExpanded} setExpand={setExpand} />
        <Outlet />
      </div>
    </div>
  );
}
