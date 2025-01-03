import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../Avatar.jsx";

import logo from "../../assets/logo.svg";
import UFORUM from "../../assets/UFORUM.svg";
import plus from "../../assets/plus_icon.svg";
import "./Menu.css";

export default function Menu() {
  const { currentUser } = useAuth();
  const { avatar, getUserInfo } = useUserInfo();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) getUserInfo(currentUser.uid);
  }, [currentUser]);

  return (
    <div className="wrapper">
      <header className="header">
        <Link to="/" className="logo">
          <img src={logo} alt="" />
          <img src={UFORUM} alt="" />
        </Link>
        <input
          id="topic-search"
          type="text"
          placeholder="Я шукаю..."
          className="search-bar"
        />
        <button className="search-button">Знайти</button>
        {currentUser ? (
          <Link
            to={`/profiles/${currentUser.uid}`}
            state={{ backgroundLocation: location }}
          >
            <Avatar
              avatar={avatar}
              size={70}
              style={{ border: "2px solid #FF4A19" }}
            />
          </Link>
        ) : (
          <button className="auth-button">
            <Link
              className="auth-ref"
              to="/login"
              state={{
                backgroundLocation: location,
                redirectPath: location.pathname,
              }}
            >
              Вхід
            </Link>{" "}
            |{" "}
            <Link
              className="auth-ref"
              to="/signup"
              state={{
                backgroundLocation: location,
                redirectPath: location.pathname,
              }}
            >
              Реєстрація
            </Link>{" "}
          </button>
        )}
      </header>

      <div className="forum-container">
        <aside className="sidebar-left">
          <nav className="menu">
            <ul>
              <li>Головна сторінка</li>
              <Link
                to={currentUser ? "/chats" : "/login"}
                state={{
                  backgroundLocation: location,
                  redirectPath: "/chats",
                }}
                style={{ textDecoration: "none", color: "#333" }}
              >
                <li>Чати</li>
              </Link>
              <li>Події</li>
              <li>Допомога</li>
            </ul>
          </nav>
          <nav className="settings">
            <ul>
              <li>Зміна мови</li>
              <li>Зміна теми</li>
            </ul>
          </nav>
          <footer className="footer">
            <ul>
              <li>Про нас</li>
              <li>Команда</li>
            </ul>
          </footer>
        </aside>

        {/* Вставляємо Outlet для відображення дочірніх компонентів */}
        <main className="content">
          <Outlet />
        </main>

        <div className="sidebar-right">
          <aside className="tags">
            <h3>Популярні теги</h3>
            <ul>
              <li>@ Вища математика</li>
              <li>@ ООП</li>
              <li>@ Бази даних</li>
              <li>@ ОЕ</li>
              <li>@ Англійська мова</li>
              <li>@ АСД</li>
            </ul>
          </aside>
          <Link
            to={currentUser ? "/create-topic" : "/login"}
            state={{
              backgroundLocation: location,
              redirectPath: "/create-topic",
            }}
          >
            <img src={plus} alt="" />
          </Link>
        </div>
      </div>
    </div>
  );
}
