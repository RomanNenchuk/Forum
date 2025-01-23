import React, { useState } from "react";
import TopicArea from "./TopicArea.jsx";
import "./TopicList.css";

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
        />
      ))}
    </>
  );
}
