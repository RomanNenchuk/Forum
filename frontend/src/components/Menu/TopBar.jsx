import React from "react";
import { Link } from "react-router-dom";
import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";

export default function TopBar({ currentUser, avatar, fullName }) {
  return (
    <header>
      <div className="header-inr">
        <Link to="/" className="linker">
          <div className="hd-col">
            <div className="hd-logo">
              <img src={logo} alt="UFORUM" />
              <h1>
                <span>U</span>FORUM
              </h1>
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
              profileName={fullName}
              size={70}
              gap="10px"
              order="text-first"
              style={{ textAlign: "right" }}
              textStyle={{ color: "#000" }}
            />
          ) : (
            <Link to="/login" className="linker">
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
