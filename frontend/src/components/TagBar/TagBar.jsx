import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TagBar.css";
import axios from "axios";

export default function TagBar({ tagBarLoading, setTagBarLoading }) {
  const [isExtentTag, setExtentTag] = useState(false);
  const [data, setData] = useState([]);

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
                onClick={() => {
                  navigator.clipboard.writeText(`# ${tag.tag_name}`);
                }}
                style={{ cursor: "pointer" }}
              >
                # {tag.tag_name}
              </h5>
            ))}
            <Link to="/tags">
              <span
                style={{ cursor: "pointer" }}
                onClick={() => setExtentTag(!isExtentTag)}
              >
                Показати більше
              </span>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
