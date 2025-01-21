import React, { useContext, useState, createContext } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";

const TopicSearchContext = createContext();

export function useTopicSearch() {
  return useContext(TopicSearchContext);
}

export function TopicSearchProvider({ children }) {
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    urlSearchParams.get("tags") || ""
  );
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    sortOrder: urlSearchParams.get("sort") || "desc",
    tags: urlSearchParams.get("tags") || "",
  });
  const { currentUser } = useAuth();

  function getTagList() {
    let tagList = searchInput?.replace(/@/g, "")?.split(",");
    tagList = tagList?.map(tag => {
      const processedTag = tag.trim();
      if (processedTag) return processedTag;
    });
    return tagList && tagList.length > 0 ? tagList.join(",") : "";
  }

  function debounce(func, delay) {
    let timeout;

    return function (...args) {
      const context = this;

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }

  async function fetchTopics() {
    try {
      const response = await axios.get(
        `http://localhost:5000/topics?page=${queryParams.page}&sort=${
          queryParams.sortOrder
        }${currentUser ? "&user_id=" + currentUser.uid : ""}${
          queryParams.tags !== "" ? "&tags=" + queryParams.tags : ""
        }`
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

  const value = {
    searchInput,
    setSearchInput,
    queryParams,
    setQueryParams,
    hasMore,
    loading,
    setLoading,
    urlSearchParams,
    setUrlSearchParams,
    topicInfoList,
    setTopicInfoList,
    getTagList,
    fetchTopics,
    debounce,
  };

  return (
    <TopicSearchContext.Provider value={value}>
      {children}
    </TopicSearchContext.Provider>
  );
}
