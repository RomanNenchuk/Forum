import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import InteractWindow from "./InteractWindow.jsx";
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
  reactionList,
  initialReactions,
  userReaction,
}) {
  const [activeReactions, setActiveReactions] = useState(() =>
    reactionSetter(initialReactions, userReaction)
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();

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
        reactionSetter(response.data.reactions, response.data.active)
      );
    } catch (error) {
      console.error(error);
    }
  }

  function reactionSetter(initialReactions, userReaction) {
    // Додати "thumbs_up" і "thumbs_down", якщо їх немає
    let resultReactions = [...initialReactions];
    const hasThumbsUp = resultReactions.some(
      reaction => reaction.name === "thumbs_up"
    );
    const hasThumbsDown = resultReactions.some(
      reaction => reaction.name === "thumbs_down"
    );

    if (!hasThumbsUp)
      resultReactions.push({ icon: "👍", name: "thumbs_up", count: 0 });
    if (!hasThumbsDown)
      resultReactions.push({ icon: "👎", name: "thumbs_down", count: 0 });

    resultReactions = resultReactions.sort((a, b) => {
      const order = ["thumbs_up", "thumbs_down"];
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      else if (indexA !== -1) return -1;
      else if (indexB !== -1) return 1;
      return b.count - a.count;
    });

    // Додати прапорець active для реакції користувача
    resultReactions = resultReactions.map(reaction => {
      if (reaction.name === userReaction) {
        return { ...reaction, active: true };
      }
      return reaction;
    });
    return resultReactions;
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
            <div className="emo-container" onClick={() => setEmo(indx + 1)}>
              😀
              {isEmo == indx + 1 ? (
                <InteractWindow
                  reactionList={reactionList}
                  onClick={handleClick}
                />
              ) : (
                ""
              )}
            </div>
            <VscSettings size="3.5vh" />
          </div>
        </div>
      </div>
    </li>
  );
}
