import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import { useAuth } from "../../contexts/AuthContext";
import TopBar from "./TopBar.jsx";
import SideBar from "./SideBar.jsx";
import "./Menu.css";
import AltSide from "./AltSide.jsx";

export default function Menu() {
  const { currentUser } = useAuth();
  const {width} = useWidth()
  const { avatar, getUserInfo, fullName } = useUserInfo();
  const [isExpanded, setExpand] = useState(true);

  useEffect(() => {
    if (currentUser) getUserInfo(currentUser.uid);
  }, [currentUser]);
  console.log(width)
  return (
    <div className="wrapper">
      <TopBar currentUser={currentUser} avatar={avatar} fullName={fullName} setExpand = {setExpand}  />
      <div className="forum-container">
        {width > 768 ? (<SideBar isExpanded={isExpanded} setExpand={setExpand} />) : 
        isExpanded ? <AltSide avatar={avatar} fullname={fullName} currentUser={currentUser} setExpand={setExpand}/> : ""}
        <Outlet />
      </div>
    </div>
  );
}
