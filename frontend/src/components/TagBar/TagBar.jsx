import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ToastPortal from "../Toast/Toast.jsx";
import "./TagBar.css";
import axios from "axios";

export default function TagBar({ tagBarLoading, setTagBarLoading }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type, item = "") => {
    if (toast) clearTimeout(toast.timeoutId);

    const newToast = {
      id: Date.now(),
      message,
      type,
      item,
      timeoutId: setTimeout(() => setToast(null), 3000),
    };

    setToast(newToast);
  };

  const handleTagClick = tagName => {
    navigator.clipboard.writeText(`# ${tagName}`);
    showToast("скопійовано", "success", `# ${tagName}`);
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/tags?page=1&limit=15"
        );
        setData(res.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setTagBarLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <>
      <div className="tag-list">
        <h5 className="tag-list-title">Популярні теги</h5>
        {tagBarLoading ? null : (
          <>
            {data.map((tag, index) => (
              <h5
                className="tag"
                key={index}
                onClick={() => handleTagClick(tag.tag_name)}
                style={{ cursor: "pointer" }}
              >
                # {tag.tag_name}
              </h5>
            ))}
            <Link to="/tags">
              <span
                style={{ cursor: "pointer" }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                Показати більше
              </span>
            </Link>
          </>
        )}
      </div>
      {toast && (
        <ToastPortal
          key={toast.id}
          message={toast.message}
          type={toast.type}
          item={toast.item}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
