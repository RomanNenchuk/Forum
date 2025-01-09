import React, { useState } from "react";
import TopicArea from "./TopicArea.jsx";
import "./TopicList.css";

export default function TopicList({ topicInfoList }) {
  const [isEmoWindVisible, setEmoWind] = useState(0)

  function setWind(index){
    if(isEmoWindVisible == index) setEmoWind(0)
    else setEmoWind(index)
    console.log(index)
  }
  return (
    
    <>
      {topicInfoList.map((topic, index) => (
        <TopicArea topic={topic} indx = {index} key={index} isEmo = {isEmoWindVisible} setEmo = {setWind}
        list_like = {['👍','👎']} 
        list_emo = {['😄','😭','🤯','😍','🤦‍♂️']} />
      ))}
    </>
  );
}

TopicList;
