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
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort") || "desc"
  );
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();

  const handleChange = e => {
    searchParams.set("sort", e.target.value);
    setSearchParams(searchParams);
    setSortOrder(e.target.value);
  };

  async function fetchTopics(sortOrder) {
    try {
      const response = await axios.get(
        `http://localhost:5000/topics?page=${page}&sort=${sortOrder}${
          currentUser ? "&user_id=" + currentUser.uid : ""
        }`
      );
      const topics = response.data || [];
      setTopicInfoList(prev => [...prev, ...topics]);
      setHasMore(topics.length > 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopics(searchParams.get("sort") || "desc");
  }, [page, searchParams]);

  useEffect(() => {
    setTopicInfoList([]);
    setPage(1);
  }, [sortOrder]);

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
      <ul className="submain_in">
        <TopicListSettings sortOrder={sortOrder} handleChange={handleChange} />
        <TopicList topicInfoList={topicInfoList} />
      </ul>
      <TagBar />
      {loading && <LoadingSpinner />}
    </>
  );
}
