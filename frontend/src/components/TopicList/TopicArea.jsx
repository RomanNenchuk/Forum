import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import reactionListSetter from "../../utils/reactionListSetter.jsx";
import InteractWindow from "./InteractWindow.jsx";
import { VscSettings } from "react-icons/vsc";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ProfileHeader from "../ProfileHeader.jsx";
import "./TopicList.css";
import axios from "axios";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";

export default function TopicArea({
  topic,
  reactionList,
  initialReactions,
  userReaction,
  setTopics,
  handleOnActionMenu,
}) {
  const [activeReactions, setActiveReactions] = useState(
    reactionListSetter(initialReactions, userReaction)
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const { queryParams } = useTopicSearch();

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
      console.log(response.data);
      setActiveReactions(() =>
        reactionListSetter(response.data.reactions, response.data.active)
      );
    } catch (error) {
      console.error(error);
    }
  }

  const handleTopicClick = topicId => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    navigate(`/topics/${topicId}`);
  };

  return (
    <li className="topic-card">
      <div>
        <div
          className="topic-content"
          onClick={() => handleTopicClick(topic.id)}
        >
          <ProfileHeader
            id={topic.author}
            avatar={topic.author_avatar}
            size="6vh"
            sizeFont="3vh"
            avThickness="0.4vh"
            profileName={topic.author_full_name}
          />
          <div className="topic-title-container">
            <span className="topic-title">{topic.title}</span>
          </div>
          {topic.cover ? <AttachedFiles urls={[topic.cover]} /> : null}
        </div>
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
            <Link to={`/topics/${topic.id}`} style={{ textDecoration: "none" }}>
              <IoChatboxEllipsesOutline size="3.5vh" />
            </Link>
            <div className="emo-container">
              😀
              <InteractWindow
                reactionList={reactionList}
                onClick={handleClick}
              />
            </div>
            <VscSettings
              size="3.5vh"
              style={{ cursor: "pointer" }}
              onClick={e => handleOnActionMenu(e, topic)}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
