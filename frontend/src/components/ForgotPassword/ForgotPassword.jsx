import React, { useRef, useState } from "react";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import NavLink from "../NavLink.jsx";
import { useLocation } from "react-router-dom";
import { Form, Card, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function ForgotPassword({ onCloseModal }) {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const backgroundPath = location.state?.backgroundLocation || "/";
  const redirectPath = location.state?.redirectPath || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage(
        "Перевірте свою поштову скриньку, щоб отримати подальші інструкції"
      );
    } catch (error) {
      setError("Failed to reset password");
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <ModalHeader title={"Скидання паролю"} onClose={onCloseModal} />
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormInput
              id={"email"}
              type={"email"}
              placeholder={"Ел. пошта"}
              ref={emailRef}
              required
            />

            <NavLink
              label={"Маєте акаунт?"}
              linkText={"Увійти"}
              linkTo={"/login"}
              backgroundPath={backgroundPath}
              redirectPath={redirectPath}
              className="mt-5"
            />

            <NavLink
              label={"Вперше на UFORUM?"}
              linkText={"Реєстрація"}
              backgroundPath={backgroundPath}
              redirectPath={redirectPath}
              linkTo={"/signup"}
            />

            <ActionButton
              label={"Скинути"}
              loading={loading}
              className="my-5"
            />
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
