import React, { useRef, useState } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUserInfo } from "../contexts/UserInfoContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUp() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const nameRef = useRef();
  const { currentUser, signup, loginWithGoogle } = useAuth();
  const { setUserName, setAvatar, setCreatedAt } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function registerUserOnServer(token, userData) {
    try {
      const response = await axios.post(
        "http://localhost:5000/user/signup",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Передаємо токен
          },
        }
      );

      console.log("User registered:", response.data);
      return response.data; // Повертаємо відповідь, якщо потрібна
    } catch (error) {
      console.error("Error registering user on server:", error);
      throw error; // Кидаємо помилку далі для обробки
    }
  }

  async function handleSignUpWithGoogle(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const result = await loginWithGoogle();
      if (!result || !result.user) {
        throw new Error("No user found");
      }

      const user = result.user; // Отримуємо користувача
      const token = await user.getIdToken(); // Отримуємо токен користувача

      console.log("currentUser (Google):", user);
      console.log("token (Google):", token);

      if (token && user) {
        await registerUserOnServer(token, {
          fullName: user.displayName || "Unknown", // Якщо немає імені, встановлюємо "Unknown"
          email: user.email,
          profilePicture: user.photoURL || "/default-avatar.png", // Якщо немає фото, використовуємо заглушку
        });
      }

      setUserName((n) => user.displayName || "Unknown");
      setAvatar((a) => user.photoURL || "/default-avatar.png");
      setCreatedAt((c) => new Date().toISOString().split("T")[0]);

      navigate("/");
    } catch (error) {
      console.error("Failed to sign up with Google:", error);
      setError("Failed to create an account");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);

      const userCredential = await signup(
        emailRef.current.value,
        passwordRef.current.value
      );

      const user = userCredential.user; // Отримуємо користувача з відповіді
      const newToken = await user.getIdToken(); // Отримуємо токен користувача

      console.log("currentUser:", user); // Лог поточного користувача
      console.log("token:", newToken); // Лог токена

      // додаю значення до контексту
      setUserName((n) => nameRef.current.value);
      setAvatar((a) => "/default-avatar.png");
      setCreatedAt((c) => new Date().toISOString().split("T")[0]);

      if (newToken && user) {
        await registerUserOnServer(newToken, {
          fullName: nameRef.current.value,
          email: emailRef.current.value,
          profilePicture: "/default-avatar.png",
        });
      }

      navigate("/");
    } catch (error) {
      setError("Failed to create an account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" ref={nameRef} required />
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button disabled={loading} className="w-100 mt-3" type="submit">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="w-100 text-center mt-3">
        Already have an account? <Link to="/login">Log In</Link>
      </div>

      <div className="d-flex align-items-center my-4">
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
        <span className="mx-3 text-muted">OR</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
      </div>

      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={handleSignUpWithGoogle}
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
          <span>Sign up with Google</span>
        </Button>
      </div>
    </>
  );
}
