import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TagBar.css";
import TagExtent from "./TagExtent";
import axios from "axios";

export default function TagBar({ tagBarLoading, setTagBarLoading }) {
  const [isExtentTag, setExtentTag] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get("http://localhost:5000/tags");
        setData(res.data);
        console.log(res.data);
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
              <h5 className="tag" key={index}>
                @ {tag.tag_name}
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
