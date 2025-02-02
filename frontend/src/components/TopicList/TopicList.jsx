import React, { useState, useEffect, useRef } from "react";
import TopicArea from "./TopicArea.jsx";
import TopicActionMenu from "./TopicActionMenu.jsx";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal.jsx";
import Share from "../Share.jsx";
import { useScrollLock } from "../../hooks/useScrollLock.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import "./TopicList.css";
import axios from "axios";
import { useTopicList } from "../../contexts/TopicListContext.jsx";

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

export default function TopicList({ topicInfoList }) {
  const { setTopicInfoList, loading } = useTopicList();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [topicToDeleteId, setTopicToDeleteId] = useState(null);
  const [actionMenu, setActionMenu] = useState({
    selectedTopic: -1,
    selectedTopicItem: null,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });
  const [switchText, setSwitchText] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const actionMenuRef = useRef(null);

  function handleOnActionMenu(e, topic) {
    e.preventDefault();
    isTopicSaved(currentUser?.uid, topic.id);
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

  const deleteTopic = async id => {
    try {
      const res = await axios.delete(`http://localhost:5000/topics/${id}`);
      if (res.data.done)
        setTopicInfoList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirmModalOpen(false);
      setTopicToDeleteId(null);
    }
  };

  const handleDeleteClick = id => {
    setTopicToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (topicToDeleteId) {
      deleteTopic(topicToDeleteId);
      navigate("/");
    }
  };

  async function switchTopicToUser(user_id, topic_id) {
    try {
      const res = await axios.patch(`http://localhost:5000/topics/switch`, {
        user_id,
        topic_id,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function isTopicSaved(user_id, topic_id) {
    try {
      const res = await axios.get(
        `http://localhost:5000/topics/save?user_id=${user_id}&topic_id=${topic_id}`
      );
      // console.log(res.data);
      setSwitchText(res.data.saved ? "Не зберігати" : "Зберегти тему");
    } catch (error) {
      console.error("Ne worka(");
    }
  }

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareId, setShareId] = useState(-1);

  function handleShareClick() {
    setShareId(actionMenu.selectedTopic);
    setShareModalOpen(true);
  }

  return (
    <ul className="topic-list">
      {topicInfoList.length === 0 && !loading ? (
        <div className="topics-not-found">
          За Вашим запитом нічого не знайдено {":("}
        </div>
      ) : (
        topicInfoList.map((topic, index) => (
          <TopicArea
            key={index}
            topic={topic}
            reactionList={reactionList}
            initialReactions={topic.reactions}
            userReaction={topic.user_reaction?.name}
            setTopics={setTopicInfoList}
            handleOnActionMenu={handleOnActionMenu}
          />
        ))
      )}
      <TopicActionMenu
        positionX={actionMenu.position.x}
        positionY={actionMenu.position.y}
        isToggled={actionMenu.toggled}
        actionMenuRef={actionMenuRef}
        resetActionMenu={resetActionMenu}
        actionMenu={actionMenu}
        onDeleteClick={handleDeleteClick}
        handleTopicToUser={switchTopicToUser}
        switchText={switchText}
        handleShareClick={handleShareClick}
      />
      {isConfirmModalOpen ? (
        <ConfirmationModal
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          message="Видалити цю тему?"
        />
      ) : null}
      {isShareModalOpen ? (
        <Share
          onCloseModal={() => setShareModalOpen(false)}
          url={`${location.origin}/topics/${shareId}`}
        />
      ) : null}
    </ul>
  );
}
