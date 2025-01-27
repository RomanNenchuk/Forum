import React, { useEffect, useRef, useState } from "react";
import { Form, Card, Alert } from "react-bootstrap";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import "../CreateTopic.css";
import { FaObjectUngroup } from "react-icons/fa";

function TagExtention({ onCloseModal }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const tagListRef = useRef(null);
  const searchRef = useRef();
  const LIMIT = 25;

  async function fetchTags(prompt = "", pageNum = 1) {
    setLoading(true);
    try {
      const params = prompt
        ? `?search=${prompt}&page=${pageNum}&limit=${LIMIT}`
        : `?page=${pageNum}&limit=${LIMIT}`;
      const response = await axios.get("http://localhost:5000/tags" + params);
      console.log(pageNum);

      if (pageNum === 1) {
        setTags(response.data); // Оновити список тегів для нового пошуку
      } else {
        setTags(prev => [...prev, ...response.data]); // Додати нові елементи до існуючих
      }

      // Якщо отримано менше, ніж ліміт, значить більше сторінок немає
      if (response.data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  }

  function selectTag(selected) {
    setSelectedTags(prevData => [...new Set(prevData).add(selected)]);
  }

  function deleteTag(deleted) {
    setSelectedTags(prev => {
      return prev.filter(tag => tag !== deleted);
    });
  }

  function handleChange() {
    fetchTags(searchRef.current.value, 1);
  }

  useEffect(() => {
    fetchTags("", 1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!tagListRef.current || loading || !hasMore) {
        return;
      }

      const container = tagListRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 25) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const tagListElement = tagListRef.current;
    tagListElement?.addEventListener("scroll", handleScroll);

    return () => tagListElement?.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchTags(searchRef.current?.value || "", page);
    }
  }, [page]);

  return (
    <Card>
      <ModalHeader title={"Усі теги"} onClose={onCloseModal} />
      <Card.Body>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <input
            className="for_font input-left"
            style={{ width: "100%" }}
            type="text"
            placeholder="Знайти тег"
            ref={searchRef}
            onChange={handleChange}
          ></input>
        </div>
        {selectedTags.map((el, index) => (
          <span
            key={index}
            className="selected-tags"
            style={{ marginTop: "0.3vh" }}
          >
            {el.tag_name}
            <RxCross2 color="black" onClick={() => deleteTag(el)} />
          </span>
        ))}
        <div className="tag-list-container" ref={tagListRef}>
          {tags.map((tag, index) => (
            <h5
              className="tag"
              key={index}
              onClick={() => {
                selectTag(tag);
              }}
            >
              @ {tag.tag_name}
            </h5>
          ))}
        </div>
        <div style={{ marginBottom: "1vh" }}>
          <ActionButton label="Пошук за тегами" />
        </div>
      </Card.Body>
    </Card>
  );
}
export default TagExtention;
