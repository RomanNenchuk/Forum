import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import homeIcon from "../../assets/home.svg";
import chatsIcon from "../../assets/chats.svg";
import eventsIcon from "../../assets/events.svg";
import helpIcon from "../../assets/help.svg";
import languageIcon from "../../assets/language.svg";
import modIcon from "../../assets/theme.svg";
import aboutIcon from "../../assets/about.svg";
import teamIcon from "../../assets/team.svg";
import themeIcon from "../../assets/side-theme.svg";
import "./Menu.css";

export default function SideBar({ isExpanded, setExpand }) {
  const SQUEEZE_SIDE_BAR_PATHS = ["/chats", "/topics"];
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    const isSqueezeSideBarRoute = SQUEEZE_SIDE_BAR_PATHS.some(path => {
      return location.pathname.startsWith(path);
    });
    if (isSqueezeSideBarRoute) setExpand(false);
    else setExpand(true);
  }, [location]);

  const isActive = path => location.pathname.startsWith(path);

  return (
    <div
      className="main-page-menu"
      style={{ width: isExpanded ? "45vh" : "10vh" }}
    >
      <div className="mn-menu-row mn-menu-row1">
        <div
          className={`mn-menu-el ${location.pathname === "/" ? "active" : ""}`}
        >
          <Link to="/" id="/mn-menu-home">
            <img src={homeIcon} alt="Home" />
            {isExpanded && <span>Головна сторінка</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/chats") ? "active" : ""}`}>
          <Link
            to={currentUser ? `/chats` : "/login"}
            id="mn-menu-chats"
            state={{
              backgroundLocation: location,
              redirectPath: `/chats`,
            }}
          >
            <img src={chatsIcon} alt="Chats" />
            {isExpanded && <span>Чати</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/events") ? "active" : ""}`}>
          <Link id="mn-menu-events" to="/poptopics">
            <img src={eventsIcon} alt="Events" />
            {isExpanded && <span>Популярне</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/topics") ? "active" : ""}`}>
          <Link id="mn-menu-events" to={currentUser ? `/mytopics` : "/login"}>
            <img src={themeIcon} alt="Events" />
            {isExpanded && <span>Теми</span>}
          </Link>
        </div>
      </div>
      <div className="mn-menu-row mn-menu-row2">
        <div className="mn-menu-el">
          <Link id="mn-menu-lang">
            <img src={languageIcon} alt="Language" />
            {isExpanded && <span>Зміна мови</span>}
          </Link>
        </div>
        <div className="mn-menu-el">
          <Link id="mn-menu-theme">
            <img src={modIcon} alt="Theme" />
            {isExpanded && <span>Нічний режим</span>}
          </Link>
        </div>
      </div>
      <div className="mn-menu-row mn-menu-row3">
        <div className={`mn-menu-el ${isActive("/about") ? "active" : ""}`}>
          <Link id="mn-menu-about">
            <img src={aboutIcon} alt="About" />
            {isExpanded && <span>Про застосунок</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/team") ? "active" : ""}`}>
          <Link id="mn-menu-team">
            <img src={teamIcon} alt="Team" />
            {isExpanded && <span>Команда</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/help") ? "active" : ""}`}>
          <Link id="mn-menu-help">
            <img src={helpIcon} alt="Help" />
            {isExpanded && <span>Допомога</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}
