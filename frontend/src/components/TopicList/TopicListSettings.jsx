import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./TopicList.css";

export default function TopicListSettings({ sortOrder, handleChange }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <div className="top-button">
      <Link
        to={currentUser ? "/create-topic" : "/login"}
        state={{
          backgroundLocation: location,
          redirectPath: "/create-topic",
        }}
      >
        <button className="add-topic-button">+ Додати тему</button>
      </Link>
      <button className="dropdown-button">
        <select className="arrow" value={sortOrder} onChange={handleChange}>
          <option value="desc">Найновіші</option>
          <option value="asc">Найстаріші</option>
          <option value="rating">Рейтинг</option>
        </select>
      </button>
    </div>
  );
}
