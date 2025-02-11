import React from "react";
import CreateTopicButton from "../TopicList/CreateTopicButton.jsx";
import { useTopicList } from "../../contexts/TopicListContext.jsx";
import "./MyTopic.css";

export default function TopicListHeader({ chooseMyTopics }) {
  const { showMyTopics } = useTopicList();

  return (
    <div className="topics-header">
      <div className="topics-navigation-container">
        <div className="topic-tabs">
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
            <CreateTopicButton style={{ width: "100%" }} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
