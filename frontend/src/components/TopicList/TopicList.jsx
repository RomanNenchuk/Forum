import React from "react";
import TopicArea from "./TopicArea.jsx";
import "./TopicList.css";

export default function TopicList({ topicInfoList }) {
  return (
    <>
      {topicInfoList.map((topic, index) => (
        <TopicArea topic={topic} key={index} />
      ))}
    </>
  );
}

TopicList;
