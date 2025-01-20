import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";

const BaseWrapInput = forwardRef((props, ref) => {
  function wrapInput() {
    if (ref?.current) {
      ref.current.style.height = "auto"; // Скидаємо висоту, щоб уникнути "залипання"
      ref.current.style.height = `${ref.current.scrollHeight}px`; // Встановлюємо нову висоту
    }
  }

  return (
    <Form.Group id="description" className="mb-3">
      <Form.Control
        className="for_font input-left"
        as="textarea"
        ref={ref}
        rows={9999999999}
        cols={150}
        wrap="soft"
        onChange={wrapInput} // Викликаємо функцію під час змін
        placeholder="Введіть додаткову інформацію..."
      />
    </Form.Group>
  );
});

export default BaseWrapInput;


