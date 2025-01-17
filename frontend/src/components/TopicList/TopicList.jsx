import React, { useState } from "react";
import TopicArea from "./TopicArea.jsx";
import "./TopicList.css";

const reactions = [
  { emoji: "😁", name: "beaming_face_with_smiling_eyes" },
  { emoji: "😅", name: "grinning_face_with_sweat" },
  { emoji: "😎", name: "smiling_face_with_sunglasses" },
  { emoji: "🤔", name: "thinking_face" },
  { emoji: "😐", name: "neutral_face" },
  { emoji: "😯", name: "hushed_face" },
  { emoji: "😔", name: "pensive_face" },
  { emoji: "😬", name: "grimacing_face" },
  { emoji: "💪", name: "flexed_biceps" },
  { emoji: "👌", name: "OK_hand" },
  { emoji: "❤️", name: "red_heart" },
  { emoji: "💔", name: "broken_heart" },
  { emoji: "🙅‍♂️", name: "man_gesturing_NO" },
  { emoji: "🙅‍♀️", name: "woman_gesturing_NO" },
  { emoji: "🤦‍♂️", name: "man_facepalming" },
  { emoji: "🤦‍♀️", name: "woman_facepalming" },
  { emoji: "🤷‍♂️", name: "man_shrugging" },
  { emoji: "🤷‍♀️", name: "woman_shrugging" },
  { emoji: "😡", name: "enraged_face" },
  { emoji: "🤡", name: "clown_face" },
  { emoji: "💀", name: "skull" },
  { emoji: "💩", name: "pile_of_poo" },
];

export default function TopicList({ topicInfoList }) {
  const [isEmoWindVisible, setEmoWind] = useState(0);

  function setWind(index) {
    if (isEmoWindVisible == index) setEmoWind(0);
    else setEmoWind(index);
    console.log(index);
  }
  return (
    <>
      {topicInfoList.map((topic, index) => (
        <TopicArea
          topic={topic}
          indx={index}
          key={index}
          isEmo={isEmoWindVisible}
          setEmo={setWind}
          list_like={[
            { emoji: "👍", name: "thumbs_up" },
            { emoji: "👎", name: "thumbs_down" },
          ]}
          list_emo={reactions}
        />
      ))}
    </>
  );
}

TopicList;
const list_emo = [
  "👍 thumbs_up 1",
  "👎 thumbs_down -1",
  "😁 beaming_face_with_smiling_eyes 1",
  "😅 grinning_face_with_sweat 1",
  "😎 smiling_face_with_sunglasses 1",
  "🤔 thinking_face 0",
  "😐 neutral_face 0",
  "😯 hushed_face 0",
  "😔 pensive_face 0",
  "😬 grimacing_face 0",
  "💪 flexed_biceps 1",
  "👌 OK_hand 1",
  "❤️ red_heart 1",
  "💔 broken heart 1",
  "🙅‍♂️ man_gesturing_NO 0",
  "🙅‍♀️ woman_gesturing_NO 0",
  "🤦‍♂️ man_facepalming -1",
  "🤦‍♀️ woman_facepalming -1",
  "🤷‍♂️ man_shrugging 0",
  "🤷‍♀️ woman_shrugging 0",
  "😡 enraged_face -1",
  "🤡 clown_face -1",
  "💀 skull 0",
  "💩 pile_of_poo -1",
];
