import React, { useState, useEffect } from "react";
import { useTopicList } from "../../contexts/TopicListContext.jsx";
import AltSpinner from "../AltSpinner/AltSpinner";
import TopicList from "../TopicList/TopicList.jsx";
import TopicListHeader from "./TopicListHeader.jsx";
import "./MyTopic.css";

export default function MyTopic() {
  const {
    myTopicList,
    savedTopicList,
    loading,
    hasMoreMyTopics,
    hasMoreSavedTopics,
    myTopicPage,
    setMyTopicPage,
    savedTopicPage,
    setSavedTopicPage,
    showMyTopics,
    setShowMyTopics,
    debounce,
  } = useTopicList();

  const [topicInfoList, setTopicInfoList] = useState([]);

  useEffect(() => {
    if (showMyTopics && myTopicList) {
      setTopicInfoList(myTopicList);
    } else if (!showMyTopics && savedTopicList) {
      setTopicInfoList(savedTopicList);
    }
  }, [myTopicList, savedTopicList]);

  function loadMoreTopics() {
    if (showMyTopics && hasMoreMyTopics) {
      console.log(myTopicPage);
      setMyTopicPage(prev => prev + 1);
    } else if (!showMyTopics && hasMoreSavedTopics) {
      setSavedTopicPage(prev => prev + 1);
    }
  }

  const chooseMyTopics = choice => {
    setShowMyTopics(choice);
    if (choice) {
      setShowMyTopics(true);
      setTopicInfoList(myTopicList);
    } else {
      setShowMyTopics(false);
      setTopicInfoList(savedTopicList);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = document.querySelector(".topics-content");
      const elementHeight = targetElement ? targetElement.offsetHeight : 0; //  висота контейнера з темами
      const totalHeight =
        window.innerHeight + document.documentElement.scrollTop; // поточна висота видимої частини + скільки прокручено
      const documentHeight = Math.max(
        document.documentElement.offsetHeight,
        elementHeight
      ); // загальна висота сторінки

      console.log(elementHeight, totalHeight, documentHeight);

      if (totalHeight >= documentHeight - 200 && !loading) {
        loadMoreTopics();
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200);
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [hasMoreMyTopics, hasMoreSavedTopics, loading]);

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
