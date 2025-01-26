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
    authors: urlSearchParams.get("authors") || "",
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

  function getSearchInputData() {
    let searchData = searchInput
      ?.split(/[,;|]/)
      ?.map(piece => piece.trim())
      ?.filter(piece => piece);
    if (!searchData || searchData?.length === 0) return;
    let tagList = [];
    let authorList = [];
    searchData.forEach(piece => {
      if (piece[0] === "~") authorList.push(piece.slice(1).trim());
      else if (piece[0] === "@") tagList.push(piece.slice(1).trim());
      else tagList.push(piece);
    });

    const result = {
      tagList,
      authorList,
    };

    if (tagList?.length)
      result.tagList = tagList && tagList.length > 0 ? tagList.join(",") : "";
    if (authorList?.length)
      result.authorList =
        authorList && authorList.length > 0 ? authorList.join(",") : "";

    return result;
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
      console.log("fetched");
      const response = await axios.get(
        `http://localhost:5000/topics?page=${queryParams.page}&sort=${
          queryParams.sortOrder
        }${currentUser ? "&user_id=" + currentUser.uid : ""}${
          queryParams.tags !== "" ? "&tags=" + queryParams.tags : ""
        }${queryParams.authors !== "" ? "&authors=" + queryParams.authors : ""}`
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
    getSearchInputData,
    fetchTopics,
    debounce,
  };

  return (
    <TopicSearchContext.Provider value={value}>
      {children}
    </TopicSearchContext.Provider>
  );
}
