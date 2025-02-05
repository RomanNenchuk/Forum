import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useTopicSearch } from "./TopicSearchContext";

const TopicListContext = createContext();

export function useTopicList() {
  return useContext(TopicListContext);
}

export function TopicListProvider({ children }) {
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { queryParams, setQueryParams } = useTopicSearch();

  useEffect(() => {
    const fetchData = debounce(async () => {
      await fetchTopics();
    }, 200);
    setLoading(true);
    fetchData();
  }, [queryParams]);

  useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      page: 1,
    }));
  }, [currentUser]);

  function debounce(func, delay) {
    let timeout;
    function debounced(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    }
    debounced.cancel = () => {
      clearTimeout(timeout);
    };
    return debounced;
  }

  async function fetchTopics() {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/topics?page=${queryParams.page}&sort=${queryParams.sortOrder}` +
          `${currentUser ? "&user_id=" + currentUser.uid : ""}` +
          `${queryParams.tags ? "&tags=" + queryParams.tags : ""}` +
          `${queryParams.authors ? "&authors=" + queryParams.authors : ""}`
      );
      const topics = response.data || [];
      setTopicInfoList(prev =>
        queryParams.page === 1 ? topics : [...prev, ...topics]
      );
      setHasMore(topics.length > 0);
    } catch (error) {
      console.error("Failed to fetch topics", error);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    topicInfoList,
    setTopicInfoList,
    hasMore,
    loading,
    fetchTopics,
    debounce,
  };

  return (
    <TopicListContext.Provider value={value}>
      {children}
    </TopicListContext.Provider>
  );
}
