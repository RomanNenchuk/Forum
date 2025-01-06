import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ProfileHeader from "../ProfileHeader.jsx";
import "./TopicList.css";

export default function TopicArea({ topic, index }) {
  const location = useLocation();
  return (
    <li className="topic-card" key={index}>
      <Link
        to={`topics/${topic.id}`}
        style={{ textDecoration: "none" }}
        state={{ backgroundLocation: location }}
      >
        <div className="topic-content">
          <ProfileHeader
            id={topic.author}
            avatar={topic.author_avatar}
            size={42}
            profileName={topic.author_full_name}
          />

          <div className="topic-title">
            <p>{topic.title}</p>
          </div>
        </div>
      </Link>
      <div className="topic-card-footer">
        <span className="emoji-icons">👍</span>
        <span className="emoji-icons">👎</span>
        <span className="emoji-icons">❤️</span>
        <span className="emoji-icons">😊</span>
        <span className="emoji-icons">⚙️</span>
      </div>
    </li>
  );
}
