import React from "react";
import { Link, Outlet } from "react-router-dom";
import homeIcon from "../../assets/home.svg";
import chatsIcon from "../../assets/chats.svg";
import eventsIcon from "../../assets/events.svg";
import helpIcon from "../../assets/help.svg";
import languageIcon from "../../assets/language.svg";
import themeIcon from "../../assets/theme.svg";
import aboutIcon from "../../assets/about.svg";
import teamIcon from "../../assets/team.svg";
import "./Menu.css";

export default function SideBar() {
  return (
    <div className="main-page-menu">
      <div className="mn-menu-row mn-menu-row1">
        <div className="mn-menu-el">
          <Link to="/" id="/mn-menu-home">
            <img src={homeIcon} alt="Home" />
            <h2>Головна сторінка</h2>
          </Link>
        </div>
        <div className="mn-menu-el">
          <Link to="/chats/" id="mn-menu-chats">
            <img src={chatsIcon} alt="Chats" />
            <h2>Чати</h2>
          </Link>
        </div>
        <div className="mn-menu-el">
          <Link id="mn-menu-events">
            <img src={eventsIcon} alt="Events" />
            <h2>Події</h2>
          </Link>
        </div>
      </div>

      <div className="mn-menu-row mn-menu-row2">
        <div className="mn-menu-el">
          <Link id="mn-menu-lang">
            <img src={languageIcon} alt="Language" />
            <h2>Зміна мови</h2>
          </Link>
        </div>
        <div className="mn-menu-el">
          <Link id="mn-menu-theme">
            <img src={themeIcon} alt="Theme" />
            <h2>Нічний режим</h2>
          </Link>
        </div>
      </div>
      <div className="mn-menu-row mn-menu-row3">
        <div className="mn-menu-el">
          <Link id="mn-menu-about">
            <img src={aboutIcon} alt="About" />
            <h2>Про застосунок</h2>
          </Link>
        </div>
        <div className="mn-menu-el">
          <Link id="mn-menu-team">
            <img src={teamIcon} alt="Team" />
            <h2>Команда</h2>
          </Link>
        </div>
        <div className="mn-menu-el">
          <Link id="mn-menu-help">
            <img src={helpIcon} alt="Help" />
            <h2>Допомога</h2>
          </Link>
        </div>
      </div>
    </div>
  );
}
