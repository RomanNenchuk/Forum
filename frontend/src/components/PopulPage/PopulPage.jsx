import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import AltSpinner from "../AltSpinner/AltSpinner";
import { useAuth } from "../../contexts/AuthContext.jsx";
import TopicList from "../TopicList/TopicList.jsx";
import "../MyTopic/MyTopic.css";
import { fetchPopularTopics } from "../../api/topics.js";

export default function PopulTopic() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const observerRef = useRef(null);

  // React Query для кешування попередніх завантажених сторінок
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["popularTopics", currentUser?.uid],
      queryFn: ({ pageParam = 1 }) =>
        fetchPopularTopics({ pageParam, userId: currentUser?.uid }),
      getNextPageParam: lastPage => lastPage.nextPage,
      staleTime: 1000 * 60 * 5, // зберігати кеш 5 хвилин
      cacheTime: 1000 * 60 * 10, // не видаляти кеш 10 хвилин
    });

  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // відновлення прокрутки
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("popularTopicsScrollPosition");
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition, 10),
        left: 0,
        behavior: "instant",
      });
      sessionStorage.removeItem("popularTopicsScrollPosition");
    }
  }, []);

  // для збереження позиції скролу
  const handleTopicClick = () => {
    sessionStorage.setItem(
      "popularTopicsScrollPosition",
      window.scrollY.toString()
    );
  };

  const topics = data?.pages.flatMap(page => page.topics) || [];

  return (
    <div className="topics-container">
      <div className="topics-content">
        <div className="topics-container">
          {isFetching && !isFetchingNextPage ? (
            <AltSpinner />
          ) : topics.length === 0 ? (
            <div className="topics-not-found">{t("topic.topicsNotFound")}</div>
          ) : (
            <>
              <TopicList
                topicInfoList={topics}
                className="topics-grid"
                onTopicClick={handleTopicClick}
              />
              {isFetchingNextPage && <AltSpinner />}
            </>
          )}
          <div ref={observerRef} className="observer-element" />
        </div>
      </div>
    </div>
  );
}
