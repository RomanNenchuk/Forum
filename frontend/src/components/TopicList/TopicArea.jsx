import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";

import { useWidth } from "../../contexts/ScreenWidthContext.jsx";

import reactionListSetter from "../../utils/reactionListSetter.jsx";
import InteractWindow from "./InteractWindow.jsx";
import { VscSettings } from "react-icons/vsc";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ProfileHeader from "../ProfileHeader.jsx";
import "./TopicList.css";
import subscribe from "./../../assets/subscribe.svg";
import subscribed from "./../../assets/subscribed.svg";
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

  const { width } = useWidth();

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

  async function addSubscribe() {
    try {
      const res = await axios.post(
        `http://localhost:5000/subscriptions/${topic.author}`,
        { user1_id: currentUser.uid }
      );

      if (res.data.done) {
        setTopics(prevState =>
          prevState.map(el =>
            el.author === topic.author
              ? { ...el, subscribed: !el.subscribed }
              : el
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function delSubscribe() {
    try {
      const res = await axios.delete(
        `http://localhost:5000/subscriptions/${topic.author}`,
        {
          data: { user1_id: currentUser.uid }, // Передаємо тіло правильно
        }
      );

      if (res.data.done) {
        setTopics(prevState =>
          prevState.map(el =>
            el.author === topic.author
              ? { ...el, subscribed: !el.subscribed }
              : el
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleTopicClick = topicId => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    navigate(`/topics/${topicId}`);
  };

  return (
    <li className="topic-card">
  <div>
    <div className="topic-content" onClick={() => handleTopicClick(topic.id)}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "50%", justifyContent: "flex-start" }}>
          <ProfileHeader
            id={topic.author}
            avatar={topic.author_avatar}
            size={width > 768 ? "6vh" : "4vh"}
            sizeFont={width > 768 ? "3vh" : "1.1rem"}
            avThickness="0.4vmin"
            profileName={topic.author_full_name}
          />
          
          {topic.subscribed !== "none" && (
            <img 
              style={{
                ...(width > 768 ? { height: "5vh" } : { height: "1.8rem" }),
                width: "auto",
                marginLeft: "2%"
              }} 
              src={topic.subscribed ? subscribe : subscribed}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentUser) {
                  navigate("/login");
                  exit();
                } else {
                  setTimeout(() => {
                    topic.subscribed ? delSubscribe() : addSubscribe();
                  }, 200);
                }
              }} 
            />
          )}
        </div>
        {width < 768 && (
          <div style={{ textAlign: "right", fontSize: "0.8rem", color: "gray" }}>
            {topic.tag_list.map((el, index) => (index !== topic.tag_list.length - 1 ? `#${el} ` : `#${el}`))}
          </div>
        )}
      </div>

      <div className="topic-title">
        <span style={{ marginBottom: "1vh", overflowWrap: "break-word" }}>
          {topic.title}
        </span>
      </div>

      {width > 768 && (
        <div style={{ textAlign: "right", fontSize: "2.5vh", color: "gray" }}>
          {topic.tag_list.map((el, index) => (index !== topic.tag_list.length - 1 ? `#${el} ` : `#${el}`))}
        </div>
      )}

      {topic.cover && <AttachedFiles urls={[topic.cover]} />}
    </div>

    <div className="icons-menu">
      <div className="active-reactions">
        {activeReactions.map((reaction, index) => (
          <button
            key={index}
            className={`reaction-button ${reaction.active ? "my-reaction" : ""}`}
            onClick={() => handleClick(reaction)}
          >
            <span>{reaction.icon}</span>
            <span className="reaction-button-count">{reaction.count ? reaction.count : ""}</span>
          </button>
        ))}
      </div>

      <div className="chat-settings">
        <Link to={`/topics/${topic.id}`} style={{ textDecoration: "none" }}>
          <IoChatboxEllipsesOutline size={width > 768 ? "3.5vh" : "1.2rem"} />
        </Link>
        <div className="emo-container">
          😀
          <InteractWindow reactionList={reactionList} onClick={handleClick} />
        </div>
        <VscSettings size={width > 768 ? "3.5vh" : "1.2rem"} style={{ cursor: "pointer" }} onClick={(e) => handleOnActionMenu(e, topic)} />
      </div>
    </div>
  </div>
</li>

  );
}
