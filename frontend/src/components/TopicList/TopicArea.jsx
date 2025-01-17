import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import InteractW from "./InteractW.jsx";
import { VscSettings } from "react-icons/vsc";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ProfileHeader from "../ProfileHeader.jsx";
import "./TopicList.css";
import axios from "axios";

export default function TopicArea({
  topic,
  index,
  indx,
  isEmo,
  setEmo,
  list_like,
  list_emo,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();

  async function handleClick(emoji) {
    console.log(emoji);
    if (!currentUser)
      return navigate("/login", {
        state: {
          backgroundLocation: location,
          redirectPath: location,
        },
      });

    const response = await axios.put(
      `http://localhost:5000/topics/${topic.id}/reactions`,
      {
        reaction: emoji.name,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  return (
    <li className="topic-card" key={index}>
      <div>
        <Link
          to={`topics/${topic.id}`}
          style={{ textDecoration: "none" }}
          state={{ backgroundLocation: location }}
        >
          <div className="topic-content">
            <ProfileHeader
              id={topic.author}
              avatar={topic.author_avatar}
              size="6vh"
              sizeFont="3vh"
              avThickness="0.4vh"
              profileName={topic.author_full_name}
            />

            <div className="topic-title">
              <span style={{ marginBottom: "1vh" }}>{topic.title}</span>
            </div>
          </div>
        </Link>
        <div className="icons_menu">
          <div className="disanlike">
            {list_like.map((el, index) => (
              <button key={index} onClick={() => handleClick(el)}>
                {el.emoji}
              </button>
            ))}
          </div>
          <div className="chat_settings">
            <IoChatboxEllipsesOutline size="3.5vh" />
            <span onClick={() => setEmo(indx + 1)}>😀</span>
            <VscSettings size="3.5vh" />
          </div>
        </div>
        {isEmo == indx + 1 ? (
          <InteractW emolist={list_emo} onClick={handleClick} />
        ) : (
          ""
        )}
      </div>
    </li>
  );
}
