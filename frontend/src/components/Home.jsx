import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "./Spinner.jsx";
import TopicListSettings from "./TopicList/TopicListSettings.jsx";
import TopicList from "./TopicList/TopicList.jsx";
import TagBar from "./TagBar/TagBar.jsx";

export default function Home() {
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { token } = useAuth();

  async function fetchTopics(page) {
    try {
      const response = await axios.get(
        `http://localhost:5000/topics?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const topics = Array.isArray(response.data)
        ? response.data
        : response.data.topics || [];

      setTopicInfoList(prev => [...prev, ...topics]);
      setHasMore(topics.length > 0); // якщо повернулось 0 тем, більше даних немає
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopics(page);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  if (loading && topicInfoList.length === 0) return <LoadingSpinner />;

  return (
    <>
      <ul>
        <TopicListSettings />
        <TopicList topicInfoList={topicInfoList} />
      </ul>
      <TagBar />
      {loading && <LoadingSpinner />}
    </>
  );
}
