import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar.jsx";
import SideBar from "./SideBar.jsx";
import "./Menu.css";

export default function Menu() {
  return (
    <div className="wrapper">
      <TopBar />
      <div className="forum-container">
        <SideBar />
        <Outlet />
      </div>
    </div>
  );
}
