import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
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
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#DDD",
    marginRight: "8px",
  },
  username: {
    color: "#555",
    fontWeight: "bold",
  },
  content: {
    marginBottom: "12px",
    fontSize: "14px",
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
  const [topicList, setTopicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

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
      setTopicList(topics);
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
      {topicList.map((topic, index) => (
        <li style={styles.li} key={index}>
          {/* Карта посилання для теми */}
          <Link to={`topics/${topic.id}`} style={{ textDecoration: "none" }}>
            {/* Хедер для переходу на профіль */}
            <div
              style={styles.header}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation(); // зупиняю спливання події
                navigate(`/profiles/${topic.author}`);
              }}
            >
              <img
                src={topic.avatar || "/default-avatar.png"}
                alt="User Avatar"
                className="profile-image"
                style={{
                  height: "40px",
                  border: "0",
                  marginRight: "10px",
                }}
              />
              <span style={styles.username}>{topic.username}</span>
            </div>
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
