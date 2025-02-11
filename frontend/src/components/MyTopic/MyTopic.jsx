import React, { useState, useEffect } from "react";
import { useTopicList } from "../../contexts/TopicListContext.jsx";
import AltSpinner from "../AltSpinner/AltSpinner";
import TopicList from "../TopicList/TopicList.jsx";
import TopicListHeader from "./TopicListHeader.jsx";
import "./MyTopic.css";

export default function MyTopic() {
  const { myTopicList, savedTopicList, loading } = useTopicList();
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [showMyTopics, setShowMyTopics] = useState(true);

  useEffect(() => {
    if (showMyTopics && myTopicList) {
      setTopicInfoList(myTopicList);
    } else if (!showMyTopics && savedTopicList) {
      setTopicInfoList(savedTopicList);
    }
  }, [myTopicList, savedTopicList]);

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

  return (
    <div className="topics-container">
      <div className="topics-content">
        <TopicListHeader
          showMyTopics={showMyTopics}
          chooseMyTopics={chooseMyTopics}
        />
        <div className="topics-container">
          {!loading ? (
            topicInfoList.length === 0 ? (
              <div className="topics-not-found">Тем не знайдено {":("}</div>
            ) : (
              <TopicList
                topicInfoList={topicInfoList}
                className="topics-grid"
              />
            )
          ) : (
            <AltSpinner />
          )}
        </div>
      </div>
    </div>
  );
}
