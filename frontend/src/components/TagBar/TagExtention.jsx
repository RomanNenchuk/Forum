import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { Card } from "react-bootstrap";
import debounce from "../../utils/debounce.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import { RxCross2 } from "react-icons/rx";
import { IoCloseCircleOutline } from "react-icons/io5";
import searchIcon from "../../assets/search.svg";
import LoadingSpinner from "../AltSpinner/AltSpinner.jsx";
import axios from "axios";
import "../CreateTopic.css";

export default function TagExtention({ onCloseModal }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const tagListRef = useRef(null);
  const searchRef = useRef();
  const LIMIT = 25;

  const fetchTags = useCallback(async (prompt = "", pageNum = 1) => {
    console.log("fetch");
    try {
      const params = prompt
        ? `?search=${prompt}&page=${pageNum}&limit=${LIMIT}`
        : `?page=${pageNum}&limit=${LIMIT}`;
      const response = await axios.get("http://localhost:5000/tags" + params);
      console.log(pageNum);

      if (pageNum === 1) {
        setTags(response.data);
      } else {
        setTags(prev => [...prev, ...response.data]);
      }

      if (response.data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  function selectTag(selected) {
    if (selectedTags.length >= 5) return;
    setSelectedTags(prevData => [...new Set(prevData).add(selected)]);
  }

  function deleteTag(deleted) {
    setSelectedTags(prev => {
      return prev.filter(tag => tag !== deleted);
    });
  }
  const debouncedFetchTags = useMemo(
    () => debounce(fetchTags, 500),
    [fetchTags]
  );

  function handleChange() {
    setLoading(true);
    debouncedFetchTags(searchRef.current.value, 1);
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
    <Card style={{ scrollbarWidth: "none", overflow: "hidden" }}>
      <div className="corner-line" style={{ top: "81%", left: "2%" }}></div>
      <div
        className="corner-line"
        style={{ top: "2%", left: "97%", transform: "rotate(180deg)" }}
      ></div>
      <div
        style={{
          position: "fixed",
          // width: "100%",
          left: "93%",
          top: "1%",
          borderRadius: "50%",
          backgroundColor: "#d9d9d9",
          width: "30px",
          height: "auto",
        }}
      >
        <IoCloseCircleOutline
          size={30}
          onClick={() => {
            onCloseModal();
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          fontSize: "30px",
          fontWeight: 700,
        }}
      >
        Усі теги
      </div>

      <Card.Body style={{ scrollbarWidth: "none" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "1vh",
            backgroundColor: "#d9d9d9",
            marginBottom: "2vh",
          }}
        >
          <img
            src={searchIcon}
            style={{ height: "3.5vh", width: "auto", margin: "1vh" }}
          />
          <input
            className="for_font input-left"
            style={{ width: "100%" }}
            type="text"
            placeholder="Знайти тег"
            ref={searchRef}
            onChange={handleChange}
          ></input>
        </div>
        {selectedTags.map((tag, index) => (
          <span
            key={index}
            className="selected-tags"
            style={{ marginTop: "0.3vh" }}
          >
            {tag.tag_name}
            <RxCross2 color="black" onClick={() => deleteTag(tag)} />
          </span>
        ))}
        <div className="tag-list-container" ref={tagListRef}>
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {tags.map((tag, index) => (
                  <h5
                    className="tag"
                    key={index}
                    onClick={() => {
                      selectTag(tag);
                    }}
                  >
                    # {tag.tag_name}
                  </h5>
                ))}
              </>
            )}
          </>
        </div>
        <div style={{ transform: "scale(0.8)", marginBottom: "1vh" }}>
          <ActionButton label="Пошук за тегами" />
        </div>
      </Card.Body>
    </Card>
  );
}
