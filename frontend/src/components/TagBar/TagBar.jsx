import React, { useState, useEffect } from "react";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import { Link } from "react-router-dom";
import ToastPortal from "../Toast/Toast.jsx";
import "./TagBar.css";

export default function TagBar() {
  const [toast, setToast] = useState(null);
  const { popularTagList } = useTopicSearch();

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

  return (
    <>
      <div className="tag-list">
        <h5 className="tag-list-title">Популярні теги</h5>
        {
          <>
            {popularTagList.map((tag, index) => (
              <h5
                className="tag"
                key={index}
                onClick={() => handleTagClick(tag.tag_name)}
                style={{ cursor: "pointer" }}
              >
                # {tag.tag_name}
              </h5>
            ))}
            <Link to="/tags">Показати більше</Link>
            {/* <Link
              to="/login"
              state={{
                backgroundLocation: {
                  pathname: location.pathname,
                  search: location.search,
                },
                redirectPath: location,
              }}
            > */}
          </>
        }
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
