import React, { useState, useRef } from "react";
import { Form } from "react-bootstrap";
import { RxCross2 } from "react-icons/rx";
import "./CreateTopic.css";
import axios from "axios";

const SearchInput = ({ resData, setResData }) => {
  const tagsRef = useRef();

  const [search, setSearch] = useState(false);
  const [resSearch, setResSearch] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null); // Для дебаунсу

  async function handleSearch(prompt) {
    try {
      let addiction = "";
      if (prompt) addiction = `?search=${prompt}`;
      const res = await axios.get("http://localhost:5000/tags" + addiction);
      setResSearch(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Запобігає відправці форми при натисканні Enter
      SelectTags(tagsRef.current.value);
    }
  };

  function SelectTags(selected) {
    setResData((prevData) => [...new Set(prevData).add(selected)]);
  }

  function DeleteTags(deleted) {
    const buf = new Set(resData);
    buf.delete(deleted);
    setResData([...buf]);
  }

  const handleInputChange = () => {
    const value = tagsRef.current.value;

    // Дебаунс запиту
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => {
      handleSearch(value);
    }, 100); // 300 мс затримки

    setTimeoutId(newTimeoutId);
  };

  return (
    <Form.Group id="tags" className="mb-3">
      <div>
        <div style = {{display: "flex", flexDirection: "row",width: "100%"}}>
        <Form.Control
          type="text"
          ref={tagsRef}
          onFocus={() => setSearch(true)}
          placeholder="Оберіть теги"
          className="for_font input-left"
          onChange={handleInputChange}
          onBlur={() => setTimeout(() => setSearch(false), 150)}
          onKeyDown={handleKeyDown}
          maxLength = {100}
          style={{ position: "relative", zIndex: 2 }}
        /><div style = {{display: 'flex', justifyContent: "center", alignItems: "center", cursor: "pointer",
          paddingLeft: "0.5vh", paddingRight: "0.5vh",
          backgroundColor: "#659287", color: "white", 
        }} 
        onClick = {()=>{SelectTags(tagsRef.current.value)}}>Додати</div></div>
        <div
          style={{
            position: "absolute",
            width: "20%",
            ...(resSearch.length === 0 && { display: "none" }),
          }}
        >
          {search && (
            <ul className="find-list">
              {resSearch.slice(0, 10).map((el, index) => (
                <li key={index} onClick={() => SelectTags(el.tag_name)}>
                  {el.tag_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {resData.map((el, index) => (
          <span key={index} className="selected-tags">
            {el}
            <RxCross2 color="black" onClick={() => DeleteTags(el)} />
          </span>
        ))}
      </div>
    </Form.Group>
  );
};

export default SearchInput;
