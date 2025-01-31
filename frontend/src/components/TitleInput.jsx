import React, { useState, useRef } from "react";
import { Form } from "react-bootstrap";

import "./CreateTopic/CreateTopic.css";

const TitleInput = ({ titleRef, limit, value }) => {
  const countRef = useRef();
  const [counter, setCounter] = useState(0);

  function countLength() {
    titleRef.current
      ? setCounter(titleRef.current.value.length)
      : setCounter(0);
  }

  function wrapInput(ref) {
    console.log();
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
    console.log(ref.current.scrollHeight);
  }

  return (
    <Form.Group id="title" className="mb-3">
      <Form.Control
        className="for_font input-left"
        as="textarea"
        rows={9999999999}
        cols={150}
        maxLength={limit}
        ref={titleRef}
        defaultValue={value}
        required
        onChange={() => {
          countLength();
          wrapInput(titleRef);
        }}
        placeholder="Введіть назву теми"
      />
      <span ref={countRef} className="right-counter">
        {counter}/{limit}
      </span>
    </Form.Group>
  );
};
export default TitleInput;
