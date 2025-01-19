import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "./Spinner.jsx";
import TopicListSettings from "./TopicList/TopicListSettings.jsx";
import TopicList from "./TopicList/TopicList.jsx";
import TagBar from "./TagBar/TagBar.jsx";
import axios from "axios";
import "./Home.css";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryParams, setQueryParams] = useState({
    page: 1,
    sortOrder: searchParams.get("sort") || "desc",
  });
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const { currentUser } = useAuth();

  const handleChange = e => {
    const newSortOrder = e.target.value;
    searchParams.set("sort", newSortOrder);
    setSearchParams(searchParams);
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
    async function fetchTopics() {
      try {
        const response = await axios.get(
          `http://localhost:5000/topics?page=${queryParams.page}&sort=${
            queryParams.sortOrder
          }${currentUser ? "&user_id=" + currentUser.uid : ""}`
        );
        const topics = response.data || [];
        setTopicInfoList(prev =>
          queryParams.page === 1 ? topics : [...prev, ...topics]
        );
        setHasMore(topics.length > 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, [queryParams]);

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
      <ul className="submain_in">
        <TopicListSettings
          sortOrder={queryParams.sortOrder}
          handleChange={handleChange}
        />
        <TopicList topicInfoList={topicInfoList} />
      </ul>
      <TagBar />
      {loading && <LoadingSpinner />}
    </>
  );
}
