import React, { useRef } from "react";
import { Form } from "react-bootstrap";

export default function DescriptionInput({ description, setDescription }) {
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
      <textarea
        className="description-input"
        ref={descriptionRef}
        cols={150}
        value={description}
        onChange={handleChange}
        placeholder="Введіть додаткову інформацію..."
      />
    </Form.Group>
  );
}
