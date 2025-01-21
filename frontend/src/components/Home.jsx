import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTopicSearch } from "../contexts/TopicSearchContext.jsx";
import LoadingSpinner from "./Spinner.jsx";
import TopicListSettings from "./TopicList/TopicListSettings.jsx";
import TopicList from "./TopicList/TopicList.jsx";
import TagBar from "./TagBar/TagBar.jsx";
import "./Home.css";

export default function Home() {
  const { currentUser } = useAuth();
  const {
    queryParams,
    setQueryParams,
    hasMore,
    loading,
    setLoading,
    urlSearchParams,
    setUrlSearchParams,
    topicInfoList,
    setTopicInfoList,
    fetchTopics,
    debounce,
  } = useTopicSearch();

  const handleChange = e => {
    const newSortOrder = e.target.value;
    urlSearchParams.set("sort", newSortOrder);
    setUrlSearchParams(urlSearchParams);
    // скидання сторінки при зміні сортування
    setQueryParams(prev => ({
      ...prev,
      sortOrder: newSortOrder,
      page: 1,
    }));
  };

  function loadMore() {
    setQueryParams(prev => ({
      ...prev,
      page: prev.page + 1,
    }));
  }

  useEffect(() => {
    const fetchData = debounce(async () => {
      await fetchTopics();
    }, 300);
    setLoading(true);
    fetchData();
  }, [queryParams]);

  useEffect(() => {
    setQueryParams({
      page: 1,
      sortOrder: urlSearchParams.get("sort") || "desc",
      tags: urlSearchParams.get("tags") || "",
    });
  }, [urlSearchParams]);

  useEffect(() => {
    setTopicInfoList([]);
    setQueryParams(prev => ({
      ...prev,
      page: 1,
    }));
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = document.querySelector(".forum-container");
      const elementHeight = targetElement ? targetElement.offsetHeight : 0;
      const totalHeight =
        window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = Math.max(
        document.documentElement.offsetHeight,
        elementHeight
      );

      if (totalHeight >= documentHeight - 200 && hasMore && !loading) {
        loadMore();
      }
    };

    function debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    }

    const debouncedHandleScroll = debounce(handleScroll, 200);
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [hasMore, loading]);

  if (loading && topicInfoList.length === 0) return <LoadingSpinner />;

  return (
    <>
      <ul className="submain-in">
        <TopicListSettings
          sortOrder={queryParams.sortOrder}
          handleChange={handleChange}
        />
        <TopicList topicInfoList={topicInfoList} />
      </ul>
      <TagBar />
    </>
  );
}
