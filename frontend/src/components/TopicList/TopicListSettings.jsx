import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CreateTopicButton from "./CreateTopicButton";
import "./TopicList.css";

export default function TopicListSettings({ sortOrder, handleChange }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <div className="top-button">
      <CreateTopicButton />
      <select
        className="dropdown-button"
        value={sortOrder}
        onChange={handleChange}
      >
        <option value="desc">Новіші</option>
        <option value="asc">Давніші</option>
        <option value="rating">Популярні</option>
      </select>
    </div>
  );
}
