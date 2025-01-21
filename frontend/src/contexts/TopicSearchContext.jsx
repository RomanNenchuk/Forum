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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    sortOrder: searchParams.get("sort") || "desc",
    tags: searchParams.get("tags") || "",
  });
  const { currentUser } = useAuth();

  function getTagList() {
    let tagList = searchQuery?.replace(/@/g, "")?.split(",");
    tagList = tagList?.map(tag => {
      const processedTag = tag.trim();
      if (processedTag) return processedTag;
    });
    return tagList && tagList.length > 0 ? tagList.join(",") : "";
  }

  async function fetchTopics() {
    try {
      // const tags = getTagList();
      console.log(queryParams);
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
    searchQuery,
    setSearchQuery,
    queryParams,
    setQueryParams,
    hasMore,
    loading,
    searchParams,
    setSearchParams,
    topicInfoList,
    setTopicInfoList,
    getTagList,
    fetchTopics,
  };

  return (
    <TopicSearchContext.Provider value={value}>
      {children}
    </TopicSearchContext.Provider>
  );
}
