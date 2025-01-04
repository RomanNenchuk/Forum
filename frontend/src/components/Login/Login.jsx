import React, { useEffect, useRef, useState } from "react";
import { Form, Card, Alert } from "react-bootstrap";
import Divider from "../Divider.jsx";
import GoogleAuthButton from "../GoogleAuthButton.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import NavLink from "../NavLink.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ closeModal }) {
  const emailOrUsernameRef = useRef();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef();
  const { login, loginWithGoogle, checkUserRegistration, checkUsername } =
    useAuth();
  const { saveUserInDB } = useUserInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundPath = location.state?.backgroundLocation || "/";
  const redirectPath = location.state?.redirectPath || "/";

  async function handleLogInWithGoogle(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const userCredential = await loginWithGoogle();

      if (!userCredential?.user) {
        throw new Error("No user found");
      }

      const user = userCredential.user; // Отримуємо користувача
      const token = await user.getIdToken(); // Отримуємо токен користувача

      const isRegistered = await checkUserRegistration(user.uid);

      // якщо користувач не був збережений в БД, то зберігаємо
      if (!isRegistered && token && user) {
        await saveUserInDB(token, {
          fullName: user.displayName || "Unknown",
          email: user.email,
          profilePicture: null,
        });
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.log(error);
      setError("Не вдалося увійти в систему");
    }
    setLoading(false);
  }

  function isEmail(input) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      let email;

      // якщо користувач ввів не імейл, а username
      if (!isEmail(emailOrUsernameRef.current.value)) {
        email = await checkUsername(emailOrUsernameRef.current.value);
        if (!email) throw new Error("No such user exists");
      } else email = emailOrUsernameRef.current.value;

      const userCredential = await login(email, passwordRef.current.value);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error(error);
      setError("Не вдалося увійти в систему");
    }
    setLoading(false);
  }

  return (
    <Card>
      <ModalHeader title={"Вхід у систему"} onClose={closeModal} />
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <GoogleAuthButton onClick={handleLogInWithGoogle} className="my-3" />

        <Divider text={"або"} />

        <Form onSubmit={handleSubmit}>
          <FormInput
            id={"emailOrUsername"}
            type={"text"}
            placeholder={"Ел. пошта чи ім'я користувача"}
            ref={emailOrUsernameRef}
            required
          />

          <FormInput
            id={"password"}
            type={"password"}
            placeholder={"Пароль"}
            ref={passwordRef}
            required
          />

          <NavLink
            linkText={"Забули пароль?"}
            linkTo={"/forgot-password"}
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

          <ActionButton label={"Увійти"} loading={loading} className="my-5" />
        </Form>
      </Card.Body>
    </Card>
  );
}
