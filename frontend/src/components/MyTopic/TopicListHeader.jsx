import React from "react";
import CreateTopicButton from "../TopicList/CreateTopicButton.jsx";
import "./MyTopic.css";

export default function TopicListHeader({ showMyTopics, chooseMyTopics }) {
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
