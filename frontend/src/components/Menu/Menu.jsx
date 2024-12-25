import React, { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";

import logo from "../../assets/logo.svg";
import UFORUM from "../../assets/UFORUM.svg";
import plus from "../../assets/plus_icon.svg";
import "./Menu.css";

export default function Menu() {
  const { currentUser } = useAuth();
  const { avatar, getUserInfo } = useUserInfo();

  useEffect(() => {
    if (currentUser) getUserInfo(currentUser.uid);
  });

  return (
    <div className="wrapper">
      <header className="header">
        <Link to="/" className="logo">
          <img src={logo} alt="" />
          <img src={UFORUM} alt="" />
        </Link>
        <input type="text" placeholder="Я шукаю..." className="search-bar" />
        <button className="search-button">Знайти</button>
        {currentUser ? (
          <div
            className="text-center profile-image-container"
            style={{
              width: "70px",
              height: "70px",
            }}
          >
            <Link to={`/profiles/${currentUser.uid}`}>
              <img
                src={avatar || "/default-avatar.png"}
                alt="User Avatar"
                className="profile-image"
                style={{
                  height: "70px",
                }}
              />
            </Link>
          </div>
        ) : (
          <Link to="/login">
            <button className="auth-button">Вхід | Реєстрація</button>
          </Link>
        )}
      </header>

      <div className="forum-container">
        <aside className="sidebar-left">
          <nav className="menu">
            <ul>
              <li>Головна сторінка</li>
              <Link
                to="/chats"
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
          <Link to={`/create-topic`}>
            <img src={plus} alt="" />
          </Link>
        </div>
      </div>
    </div>
  );
}
