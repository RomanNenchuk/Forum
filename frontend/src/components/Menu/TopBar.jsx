import React from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";

export default function TopBar({ currentUser, avatar, fullName }) {
  const location = useLocation();
  return (
    <header>
      <div className="header-inr">
        <Link to="/" className="linker">
          <div className="hd-col">
            <div className="hd-logo">
              <img src={logo} alt="UFORUM" />
                <span><span>U</span>FORUM</span>
            </div>
          </div>
        </Link>
        <div className="hd-col">
          <div className="hd-search">
            <img src={seachIcon} alt="Search" />
            <input
              className="hd-search-input"
              type="text"
              placeholder="Я шукаю..."
            />
            <div className="hd-search-btn">
              <span>Знайти</span>
            </div>
          </div>
        </div>
        <div className="hd-col">
          {currentUser ? (
            <ProfileHeader
              id={currentUser.uid}
              avatar={avatar}
              profileName={`Вітаємо, ${fullName}!`}
              size="9vh"
              sizeFont="3vh"
              avThickness = '0.4vh'
              gap="1.5vh"
              order="text-first"
              style={{ textAlign: "right" }}
              textStyle={{ color: "#000" }}
            />
          ) : (
            <Link to="/login" state={{ backgroundLocation: location }}>
              <button className="hd-btn">
                Вхід
                <div className="hd-btn-sep">
                  <span> | </span>
                </div>
                Реєстрація
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
