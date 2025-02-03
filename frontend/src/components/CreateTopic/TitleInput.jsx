import React, { useState, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";

import "./CreateTopic.css";

const TitleInput = ({ title, setTitle, limit, value }) => {
  const countRef = useRef();
  const titleRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [rows, setRows] = useState(1); // Початкова кількість рядків

  function wrapInput(ref) {
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }

  function handleChange(e) {
    const textarea = e.target;
    const currentRows = textarea.value.split("\n").length;

    if (currentRows <= 3) {
      setRows(currentRows);
      wrapInput(titleRef);
    } else {
      textarea.value = textarea.value.split("\n").slice(0, 3).join("\n");
    }
    setTitle(textarea.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  useEffect(() => {
    title ? setCounter(title.length) : setCounter(0);
  }, [title]);

  return (
    <Form.Group id="title" className="mb-3">
      <input
        className="title-input"
        type="text"
        maxLength={limit}
        ref={titleRef}
        defaultValue={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Введіть назву теми"
        required
      />
      <span ref={countRef} className="right-counter">
        {counter}/{limit}
      </span>
    </Form.Group>
  );
};

export default TitleInput;
