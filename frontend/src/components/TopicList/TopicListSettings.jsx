import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./TopicList.css";

export default function TopicListSettings() {
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
        Найновіші <span className="arrow">▼</span>
      </button>
    </div>
  );
}
