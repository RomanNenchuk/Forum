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

export default function TopicArea({ topicItem, reactionList, initialReactions, userReaction, setTopics, handleOnActionMenu }) {
  const [topic, setTopic] = useState(topicItem);
  const { width }= useWidth()
  const [activeReactions, setActiveReactions] = useState(
    reactionListSetter(initialReactions, userReaction)
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();

  useEffect(() => {
    setTopic(topicItem);
  }, [topicItem]);

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
      const res = await axios.post("http://localhost:5000/subscriptions", {
        user1_id: currentUser.uid,
        user2_id: topic.author,
      });

      if (res.data.done) {
        setTopics(prevState =>
          prevState.map(el =>
            el.author === topic.author ? { ...el, subscribed: true } : el
          )
        );
        setTopic(prev => ({ ...prev, subscribed: true }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function delSubscribe() {
    try {
      const res = await axios.delete("http://localhost:5000/subscriptions", {
        data: { user1_id: currentUser.uid, user2_id: topic.author },
      });

      if (res.data.done) {
        setTopics(prevState =>
          prevState.map(el =>
            el.author === topic.author ? { ...el, subscribed: false } : el
          )
        );
        setTopic(prev => ({ ...prev, subscribed: false }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleTopicClick = topicId => {
    sessionStorage.setItem("scrollPosition", window.scrollY);
    navigate(`/topics/${topicId}${location.search}`, {
      state: { returnPath: location },
    });
  };

  const handleSubscribeClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      return navigate(`/login${location.search}`, {
        state: {
          backgroundLocation: location,
          redirectPath: location,
        },
      });
    } else
      setTimeout(() => {
        topic.subscribed ? delSubscribe() : addSubscribe();
      }, 200);
  };

  return (
    <li className="topic-card">
      <div>
        <div className="topic-content" onClick={() => navigate(`/topics/${topic.id}${location.search}`, { state: { returnPath: location } })}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
            <ProfileHeader id={topic.author} avatar={topic.author_avatar} size={width > 768 ? "6vh" : "4vh"} sizeFont={width > 768 ? "3vh" : "1.1rem"} avThickness="0.4vmin" profileName={topic.author_full_name} />
            {topic.subscribed !== "none" && (
              <button className={`subs ${topic.subscribed ? "subscribe" : "subscribed"}`}
                onClick={handleSubscribeClick}
              >{topic.subscribed ? "Стежити" : "Відстежується"}</button>
            )}
          </div> 
          <div style = {{display: "flex", flexDirection: "row"}}>
            <span className="topic-title" style={{
              marginBottom: "1vh",
              overflowWrap: "break-word",
              width: width <= 768 && topic.cover ? "70%" : "100%"}}
            >
            {topic.title}</span>
            {width <= 768 && topic.cover && <AttachedFiles urls={[topic.cover]} imgstyle={"alt-media-image"}/>}
          </div>
          {width > 768 && (
            <div style={{ textAlign: "right", fontSize: "2.5vh", color: "gray" }}>
              {topic.tag_list.join(" #")}
            </div>
          )}
          {width >  768 && topic.cover && <AttachedFiles urls={[topic.cover]} />}
        </div>

        <div className="icons-menu">
          <div className="active-reactions">
            {activeReactions.map((reaction, index) => (
              <button key={index} className={`reaction-button ${reaction.active ? "my-reaction" : ""}`} onClick={() => handleClick(reaction)}>
                <span>{reaction.icon}</span>
                <span className="reaction-button-count">{reaction.count || ""}</span>
              </button>
            ))}
          </div>

          <div className="chat-settings">
            <Link to={`/topics/${topic.id}`}><IoChatboxEllipsesOutline size={width > 768 ? "3.5vh" : "1.2rem"} /></Link>
            <div className="emo-container">😀<InteractWindow reactionList={reactionList} onClick={handleClick} /></div>
            <VscSettings size={width > 768 ? "3.5vh" : "1.2rem"} onClick={e => handleOnActionMenu(e, topic)} />
          </div>
        </div>
      </div>
    </li>
  );
}
