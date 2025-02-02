import React, { useRef } from "react";
import { Form } from "react-bootstrap";

export default function BaseWrapInput({ description, setDescription }) {
  const descriptionRef = useRef(null);

  function handleChange(e) {
    setDescription(e.target.value);
    if (descriptionRef?.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }

  return (
    <Form.Group id="description" className="mb-3">
      <Form.Control
        className="for_font input-left"
        as="textarea"
        ref={descriptionRef}
        cols={150}
        wrap="soft"
        value={description}
        onChange={handleChange}
        placeholder="Введіть додаткову інформацію..."
      />
    </Form.Group>
  );
}
