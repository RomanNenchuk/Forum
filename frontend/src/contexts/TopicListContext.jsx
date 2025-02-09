import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useTopicSearch } from "./TopicSearchContext";

const TopicListContext = createContext();

export function useTopicList() {
  return useContext(TopicListContext);
}

export function TopicListProvider({ children }) {
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [myTopicList, setMyTopicList] = useState([]);
  const [savedTopicList, setSavedTopicList] = useState([]);
  const [popularTopicList, setPopularTopicList] = useState();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { queryParams, setQueryParams } = useTopicSearch();

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
  // логіка для отримання тем на головній сторінці
  const fetchTopics = useCallback(async () => {
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
  }, [queryParams, currentUser]);

  const debouncedFetchTopics = useMemo(
    () => debounce(fetchTopics, 200),
    [fetchTopics]
  );

  useEffect(() => {
    setLoading(true);
    debouncedFetchTopics();
  }, [queryParams, debouncedFetchTopics]);

  // логіка для отримання збережених тем
  const fetchSavedTopics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/topics/saved?user_id=${currentUser.uid}`
      );
      setSavedTopicList(response.data);
    } catch (error) {
      console.error("Error fetching user topics:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const debouncedFetchSavedTopics = useMemo(
    () => debounce(fetchSavedTopics, 200),
    [fetchSavedTopics]
  );

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    debouncedFetchSavedTopics();
  }, []);

  // логіка для отримання моїх тем
  const fetchMyTopics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/topics/mytopics?user_id=${currentUser.uid}`
      );
      setMyTopicList(
        response.data.map(topic => ({
          ...topic,
          subscribed: "none",
        }))
      );
    } catch (error) {
      console.error("Error fetching user topics:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const debouncedFetchMyTopics = useMemo(
    () => debounce(fetchMyTopics, 200),
    [fetchMyTopics]
  );

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    debouncedFetchMyTopics();
  }, [currentUser]);

  const value = {
    topicInfoList,
    setTopicInfoList,
    myTopicList,
    setMyTopicList,
    savedTopicList,
    setSavedTopicList,
    hasMore,
    loading,
    debounce,
  };

  return (
    <TopicListContext.Provider value={value}>
      {children}
    </TopicListContext.Provider>
  );
}
