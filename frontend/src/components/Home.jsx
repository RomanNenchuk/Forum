import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";
import ProfileHeader from "./ProfileHeader.jsx";
import LoadingSpinner from "./Spinner.jsx";
const styles = {
  li: {
    listStyle: "none",
    padding: "16px",
    margin: "8px 0",
    border: "2px solid #FFD700",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#FFF",
    fontFamily: "Arial, sans-serif",
    maxWidth: "400px",
  },
  content: {
    marginBottom: "12px",
    fontSize: "29px",
    color: "#333",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
  },
  icon: {
    cursor: "pointer",
    marginRight: "8px",
  },
};

export default function Home() {
  const [topicInfoList, setTopicInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const location = useLocation();

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

      console.log(topics);
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
    <ul>
      {topicInfoList.map((topic, index) => (
        <li style={styles.li} key={index}>
          <Link
            to={`topics/${topic.id}`}
            style={{ textDecoration: "none" }}
            state={{ backgroundLocation: location }}
          >
            <ProfileHeader
              id={topic.author}
              avatar={topic.author_avatar}
              size={42}
              profileName={topic.author_full_name}
              className="mb-3"
            />

            <div style={styles.content}>
              <p>{topic.title}</p>
            </div>
          </Link>
          <div style={styles.footer}>
            <span style={styles.icon}>👍</span>
            <span style={styles.icon}>👎</span>
            <span style={styles.icon}>❤️</span>
            <span style={styles.icon}>😊</span>
            <span style={styles.icon}>⚙️</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
