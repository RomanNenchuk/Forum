import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import reactionListSetter from "../../utils/reactionListSetter.jsx";
import InteractWindow from "./InteractWindow.jsx";
import { VscSettings } from "react-icons/vsc";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ProfileHeader from "../ProfileHeader.jsx";
import "./TopicList.css";
import axios from "axios";

export default function TopicArea({
  topic,
  reactionList,
  initialReactions,
  userReaction,
  setTopics,
}) {
  const [activeReactions, setActiveReactions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();

  useEffect(() => {
    setActiveReactions(reactionListSetter(initialReactions, userReaction));
  }, [initialReactions, userReaction]);

  async function handleClick(emoji) {
    if (!currentUser)
      return navigate("/login", {
        state: {
          backgroundLocation: location,
          redirectPath: location,
        },
      });

    try {
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
      setActiveReactions(() =>
        reactionListSetter(response.data.reactions, response.data.active)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteTopic() {
    if(confirm("Ви впевнені, що хочете видлити тему?")) {
      console.log('On delete topic ' + topic.id);
      const res = await axios.delete(`http://localhost:5000/topics/${topic.id}`);
      if (res.data.done) {
        setTopics(prev => prev.filter(item => item.id != topic.id));
      }
    }
  }

  return (
    <li className="topic-card">
      <div>
        <Link
          to={`/topics/${topic.id}`}
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
        <div className="icons-menu">
          <div className="active-reactions">
            {activeReactions.map((reaction, index) => (
              <button
                key={index}
                className={`reaction-button ${
                  reaction.active ? "my-reaction" : ""
                }`}
                onClick={() => handleClick(reaction)}
              >
                <span>{reaction.icon}</span>{" "}
                <span className="reaction-button-count">
                  {reaction.count ? reaction.count : ""}
                </span>
              </button>
            ))}
          </div>
          <div className="chat-settings">
            <IoChatboxEllipsesOutline size="3.5vh" />
            <div className="emo-container">
              😀
              <InteractWindow
                reactionList={reactionList}
                onClick={handleClick}
              />
            </div>
            <VscSettings size="3.5vh" />
          </div>
        </div>
        {topic.author === currentUser.uid &&
         <button onClick={deleteTopic}>Видалити</button>}
      </div>
    </li>
  );
}
