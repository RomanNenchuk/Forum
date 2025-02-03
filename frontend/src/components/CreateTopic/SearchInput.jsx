import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Form } from "react-bootstrap";
import debounce from "../../utils/debounce.jsx";
import { RxCross2 } from "react-icons/rx";
import "./CreateTopic.css";
import axios from "axios";

const SearchInput = ({ selectedTagList, setSelectedTagList }) => {
  const tagsRef = useRef();
  const [isDropdownListOpen, setIsDropdownListOpen] = useState(false);
  const [tagList, setTagList] = useState([]);

  const handleSearch = useCallback(
    async prompt => {
      try {
        const res = await axios.get(
          `http://localhost:5000/tags?page=1&limit=12${
            prompt ? "&search=" + prompt : ""
          }`
        );
        setTagList(res.data);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    },
    [setTagList]
  );

  const debouncedHandleSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  useEffect(() => {
    debouncedHandleSearch();
  }, []);

  useEffect(() => {
    return () => {
      debouncedHandleSearch.cancel();
    };
  }, [debouncedHandleSearch]);

  const handleInputChange = e => {
    debouncedHandleSearch(e.target.value);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      selectTag(tagsRef.current.value);
      tagsRef.current.value = "";
    }
  };

  function selectTag(selected) {
    if (selected && selectedTagList.length < 5)
      setSelectedTagList(prevData => [...new Set(prevData).add(selected)]);
  }

  function deleteTag(deleted) {
    const buf = new Set(selectedTagList);
    buf.delete(deleted);
    setSelectedTagList([...buf]);
  }

  function handleTagClick(tag) {
    selectTag(tag.tag_name);
    tagsRef.current.value = "";
  }

  return (
    <Form.Group id="tags" className="mb-3">
      <div className="selected-tags-container">
        {selectedTagList.map((tag, index) => (
          <span key={index} className="selected-tags">
            {tag}
            <RxCross2 color="black" onClick={() => deleteTag(tag)} />
          </span>
        ))}
      </div>
      <div>
        <div className="tag-search-container">
          <input
            type="text"
            ref={tagsRef}
            onFocus={() => {
              if (selectedTagList.length < 5) setIsDropdownListOpen(true);
            }}
            placeholder={
              selectedTagList.length < 5 ? "Оберіть теги" : "Заповнено"
            }
            className="tag-input"
            readOnly={selectedTagList.length > 4}
            onChange={handleInputChange}
            onBlur={() => setTimeout(() => setIsDropdownListOpen(false), 300)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            style={{ position: "relative", zIndex: 2 }}
          />
          <div
            className="tag-select-button"
            onClick={() => {
              selectTag(tagsRef.current.value);
            }}
          >
            Додати
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            width: "20%",
            ...(tagList.length === 0 && { display: "none" }),
          }}
        >
          {isDropdownListOpen && (
            <ul className="find-list">
              {tagList
                .filter(
                  tag =>
                    !selectedTagList.some(
                      selectedTag => selectedTag === tag.tag_name
                    )
                )
                .slice(0, 7)
                .map(tag => (
                  <li
                    key={tag.id || tag.tag_name}
                    className="find-list-item"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag.tag_name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </Form.Group>
  );
};

export default SearchInput;
