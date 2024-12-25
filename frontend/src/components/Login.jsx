import React, { useRef, useState } from "react";
import { Container, Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUserInfo } from "../contexts/UserInfoContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const emailOrUsernameRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle, checkUserRegistration, checkUsername } =
    useAuth();
  const { setUserName, setAvatar, setCreatedAt, saveUserInDB } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      setUserName(n => user.displayName || "Unknown");
      setAvatar(a => "");
      setCreatedAt(c => new Date().toISOString().split("T")[0]);

      navigate(`/profiles/${user.uid}`);
    } catch (error) {
      setError("Failed to create an account");
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

      console.log(email);

      const userCredential = await login(email, passwordRef.current.value);

      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Failed to log in");
    }
    setLoading(false);
  }

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Log In</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="d-flex justify-content-center align-items-center">
              <Button
                onClick={handleLogInWithGoogle}
                variant="light"
                className="d-flex align-items-center gap-2 px-4 py-2 rounded shadow-sm"
                style={{
                  border: "1px solid #dadce0",
                  fontWeight: "500",
                  fontSize: "16px",
                  color: "#5f6368",
                  width: "fit-content",
                }}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  style={{ width: "20px", height: "20px" }}
                />
                <span>Продовжити з Google</span>
              </Button>
            </div>
            <div className="d-flex align-items-center my-4">
              <div
                style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
              ></div>
              <span className="mx-3 text-muted">OR</span>
              <div
                style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
              ></div>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group id="emailOrUsername" className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Ел. пошта чи ім'я користувача"
                  ref={emailOrUsernameRef}
                  required
                />
              </Form.Group>
              <Form.Group id="password" className="mb-4">
                <Form.Control
                  placeholder="Пароль"
                  type="password"
                  ref={passwordRef}
                  required
                />
              </Form.Group>
              <Button disabled={loading} className="w-100 mt-2" type="submit">
                Log In
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Need an accout? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </Container>
  );
}
