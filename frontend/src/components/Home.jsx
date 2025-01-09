import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "./Spinner.jsx";
import TopicListSettings from "./TopicList/TopicListSettings.jsx";
import TopicList from "./TopicList/TopicList.jsx";
import TagBar from "./TagBar/TagBar.jsx";
import "./Home.css"

export default function Home() {
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  async function fetchTopics() {
    try {
      const response = await axios.get("http://localhost:5000/topics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const topics = Array.isArray(response.data)
        ? response.data
        : response.data.topics || [];

      setTopicInfoList(topics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchTopics();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ul className="submain_in">
        <TopicListSettings />
        <TopicList topicInfoList={topicInfoList} />
      </ul>
      <TagBar />
    </>
  );
}
