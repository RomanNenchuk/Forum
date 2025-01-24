import React, { useState, useEffect, useRef } from "react";
import TopicArea from "./TopicArea.jsx";
import TopicActionMenu from "./TopicActionMenu.jsx";
import "./TopicList.css";
import axios from "axios";

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

export default function TopicList({ topicInfoList, setTopicInfoList }) {
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

  function handleOnActionMenu(e, topic) {
    e.preventDefault();
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
    return () => document.removeEventListener("mousedown", handler);
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

  async function deleteTopic(id) {
    if (confirm("Ви впевнені, що хочете видалити тему?")) {
      console.log("On delete topic " + id);
      try {
        const res = await axios.delete(`http://localhost:5000/topics/${id}`);
        if (res.data.done)
          setTopicInfoList(prev => prev.filter(item => item.id != id));
      } catch (error) {
        console.error(error);
      }
    }
  }
  return (
    <>
      {topicInfoList.map((topic, index) => (
        <TopicArea
          key={index}
          topic={topic}
          reactionList={reactionList}
          initialReactions={topic.reactions}
          userReaction={topic.user_reaction?.name}
          setTopics={setTopicInfoList}
          handleOnActionMenu={handleOnActionMenu}
        />
      ))}
      <TopicActionMenu
        positionX={actionMenu.position.x}
        positionY={actionMenu.position.y}
        isToggled={actionMenu.toggled}
        actionMenuRef={actionMenuRef}
        resetActionMenu={resetActionMenu}
        actionMenu={actionMenu}
        deleteTopic={deleteTopic}
      />
    </>
  );
}
