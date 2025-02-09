import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTopicList } from "../../contexts/TopicListContext.jsx";
import AltSpinner from "../AltSpinner/AltSpinner";
import { useScrollLock } from "../../hooks/useScrollLock.jsx";
import TopicArea from "../TopicList/TopicArea";
import TopicActionMenu from "../TopicList/TopicActionMenu";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal.jsx";
import "./MyTopic.css";
import axios from "axios";

const MyTopic = () => {
  const { currentUser } = useAuth();
  const { myTopicList, savedTopicList, loading } = useTopicList();
  const [topicInfoList, setTopicInfoList] = useState([]);
  const topicListRef = useRef();
  const [showMyTopics, setShowMyTopics] = useState(true);
  const [isTopicSaved, setIsTopicSaved] = useState(false);

  const reactionList = [
    { icon: "😁", name: "beaming_face_with_smiling_eyes" },
    { icon: "😅", name: "grinning_face_with_sweat" },
    { icon: "😎", name: "smiling_face_with_sunglasses" },
    { icon: "🤔", name: "thinking_face" },
    { icon: "😐", name: "neutral_face" },
    { icon: "😯", name: "hushed_face" },
    { icon: "😔", name: "pensive_face" },
    { icon: "😬", name: "grimacing_face" },
    { icon: "💪", name: "flexed_biceps" },
    { icon: "👌", name: "OK_hand" },
    { icon: "❤️", name: "red_heart" },
    { icon: "💔", name: "broken_heart" },
    { icon: "🙅‍♂️", name: "man_gesturing_NO" },
    { icon: "🙅‍♀️", name: "woman_gesturing_NO" },
    { icon: "🤦‍♂️", name: "man_facepalming" },
    { icon: "🤦‍♀️", name: "woman_facepalming" },
    { icon: "🤷‍♂️", name: "man_shrugging" },
    { icon: "🤷‍♀️", name: "woman_shrugging" },
    { icon: "😡", name: "enraged_face" },
    { icon: "🤡", name: "clown_face" },
    { icon: "💀", name: "skull" },
    { icon: "💩", name: "pile_of_poo" },
  ];

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState({
    selectedTopic: -1,
    selectedTopicItem: null,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  const actionMenuRef = useRef(null);
  useScrollLock(isActionMenuOpen, topicListRef);

  function handleOnActionMenu(e, topic) {
    e.preventDefault();
    checkIfTopicIsSaved(currentUser?.uid, topic.id);
    const actionMenuAttr = actionMenuRef.current.getBoundingClientRect();
    const isRight = e.clientX > window?.innerWidth / 2;
    const isBottom = e.clientY > window?.innerHeight / 2;

    let x = e.clientX;
    let y = e.clientY;

    if (isRight) x -= actionMenuAttr.width;
    if (isBottom) y -= 57;
    setIsActionMenuOpen(true);

    setActionMenu({
      selectedTopic: topic.id,
      selectedTopicItem: topic,
      position: {
        x,
        y,
      },
      toggled: true,
    });
  }

  useEffect(() => {
    function handler(e) {
      if (actionMenuRef.current) {
        if (!actionMenuRef.current.contains(e.target)) {
          resetActionMenu();
        }
      }
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("scroll", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("scroll", handler);
    };
  }, []);

  useEffect(() => {
    if (showMyTopics && myTopicList) {
      setTopicInfoList(myTopicList);
    } else if (!showMyTopics && savedTopicList) {
      setTopicInfoList(savedTopicList);
    }
  }, [myTopicList, savedTopicList]);

  function resetActionMenu() {
    setIsActionMenuOpen(false);
    setActionMenu({
      selectedTopic: -1,
      selectedTopicItem: null,
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  async function deleteTopic(id) {
    try {
      const res = await axios.delete(`http://localhost:5000/topics/${id}`);
      if (res.data.done)
        setTopicInfoList(prev => prev.filter(item => item.id != id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirmModalOpen(false);
      setTopicToDeleteId(null);
    }
  }

  const chooseMyTopics = choice => {
    if (choice) {
      setShowMyTopics(true);
      setTopicInfoList(myTopicList);
    } else {
      setShowMyTopics(false);
      setTopicInfoList(savedTopicList);
    }
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition, 10),
          left: 0,
          behavior: "instant",
        });
        sessionStorage.removeItem("scrollPosition");
      }, 200);
    }
  }, []);

  // переніс функції для видалення\поширення з topics
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [topicToDeleteId, setTopicToDeleteId] = useState(null);

  const handleDeleteClick = id => {
    setTopicToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  async function switchTopicToUser(user_id, topic_id) {
    try {
      const res = await axios.patch(`http://localhost:5000/topics/switch`, {
        user_id,
        topic_id,
      });
      setTopicInfoList(prev => prev.filter(item => item.id !== topic_id));
    } catch (error) {
      console.error(error);
    }
  }

  async function checkIfTopicIsSaved(user_id, topic_id) {
    try {
      const res = await axios.get(
        `http://localhost:5000/topics/save?user_id=${user_id}&topic_id=${topic_id}`
      );
      setIsTopicSaved(res.data.saved);
    } catch (error) {
      console.error("Ne worka(");
    }
  }

  const handleConfirmDelete = () => {
    if (topicToDeleteId) deleteTopic(topicToDeleteId);
  };

  return (
    <div className="topics-container">
      <div className="topics-content">
        <div className="topics-header">
          <div className="topics-tabs">
            <div
              className={`tab ${showMyTopics ? "active-tab" : ""}`}
              onClick={() => chooseMyTopics(true)}
            >
              Мої теми
            </div>
            <div
              className={`tab ${!showMyTopics ? "active-tab" : ""}`}
              onClick={() => chooseMyTopics(false)}
            >
              Збережені теми
            </div>
          </div>
          <div className="add-topic-container">
            {showMyTopics ? (
              <Link
                to={currentUser ? "/create-topic" : "/login"}
                state={{ redirectPath: "/create-topic" }}
                className="add-topic-link"
              >
                <button className="add-topic-button">+ Додати тему</button>
              </Link>
            ) : null}
          </div>
        </div>
        <div className="topics-grid-container">
          {!loading ? (
            topicInfoList.length === 0 ? (
              <div className="topics-not-found">Тем не знайдено {":("}</div>
            ) : (
              <div className="topics-grid">
                {topicInfoList.map((topic, index) => (
                  <div
                    key={topic.id}
                    className={`topic-item column-${(index % 2) + 1}`}
                  >
                    <TopicArea
                      topicItem={topic}
                      reactionList={reactionList}
                      initialReactions={topic.reactions}
                      userReaction={topic.user_reaction?.name}
                      setTopics={setTopicInfoList}
                      handleOnActionMenu={handleOnActionMenu}
                    />
                  </div>
                ))}
                <TopicActionMenu
                  positionX={actionMenu.position.x}
                  positionY={actionMenu.position.y}
                  isToggled={actionMenu.toggled}
                  actionMenuRef={actionMenuRef}
                  resetActionMenu={resetActionMenu}
                  actionMenu={actionMenu}
                  onDeleteClick={handleDeleteClick}
                  handleTopicToUser={switchTopicToUser}
                  isTopicSaved={isTopicSaved}
                />
                {isConfirmModalOpen && (
                  <ConfirmationModal
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    message="Видалити цю тему?"
                  />
                )}
              </div>
            )
          ) : (
            <AltSpinner />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTopic;
