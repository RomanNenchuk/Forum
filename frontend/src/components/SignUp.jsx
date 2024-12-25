import React, { useRef, useState } from "react";
import { Container, Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUserInfo } from "../contexts/UserInfoContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const majorRef = useRef();
  const nameRef = useRef();
  const usernameRef = useRef();
  const {
    signup,
    loginWithGoogle,

    checkUserRegistration,
    checkUsername,
  } = useAuth();
  const { setUserName, setAvatar, setCreatedAt, saveUserInDB } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignUpWithGoogle(e) {
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

      const isRegistered = await checkUserRegistration(userCredential.user.uid);

      // зберігаємо в БД, тільки якщо такого користувача немає
      if (!isRegistered && token && user) {
        await saveUserInDB(token, {
          fullName: user.displayName || "Unknown", // Якщо немає імені, встановлюємо "Unknown"
          email: user.email,
          profilePicture: null,
        });
      }

      setUserName(n => user.displayName || "Unknown");
      setAvatar(a => "");
      setCreatedAt(c => new Date().toISOString().split("T")[0]);

      navigate(`/profiles/${user.uid}`);
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

      const usernameIsInUse = !!(await checkUsername(
        usernameRef.current.value
      ));

      if (usernameIsInUse) return setError("This username is already in use");

      const userCredential = await signup(
        emailRef.current.value,
        passwordRef.current.value
      );

      const user = userCredential.user; // Отримуємо користувача з відповіді
      const newToken = await user.getIdToken(); // Отримуємо токен користувача

      // додаю значення до контексту
      setUserName(n => nameRef.current.value);
      setAvatar(a => "");
      setCreatedAt(c => new Date().toISOString().split("T")[0]);

      if (newToken && user) {
        await saveUserInDB(newToken, {
          email: emailRef.current.value,
          userName: usernameRef.current.value,
          fullName: nameRef.current.value,
          profilePicture: "",
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
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Реєстрація</h2>
            {error && <Alert variant="danger">{error}</Alert>}

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
                <span>Продовжити з Google</span>
              </Button>
            </div>

            <div className="d-flex align-items-center my-4">
              <div
                style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
              ></div>
              <span className="mx-3 text-muted">АБО</span>
              <div
                style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
              ></div>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-4">
                <Form.Control
                  type="email"
                  placeholder="Ел. пошта"
                  ref={emailRef}
                  required
                />
              </Form.Group>
              <Form.Group id="username" className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Ім'я користувача"
                  ref={usernameRef}
                  required
                />
              </Form.Group>
              <Form.Group id="fullname" className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Ім'я та прізвище"
                  ref={nameRef}
                  required
                />
              </Form.Group>
              <Form.Group id="password" className="mb-4">
                <Form.Control
                  type="password"
                  placeholder="Пароль"
                  ref={passwordRef}
                  required
                />
              </Form.Group>
              <Form.Group id="password-confirm" className="mb-4">
                <Form.Control
                  type="password"
                  placeholder="Підтвердіть пароль"
                  ref={passwordConfirmRef}
                  required
                />
              </Form.Group>
              <Form.Group id="">
                <select id="major" ref={majorRef} required>
                  <option value="">Оберіть спеціальність</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="hamster">Hamster</option>
                  <option value="parrot">Parrot</option>
                  <option value="spider">Spider</option>
                  <option value="goldfish">Goldfish</option>
                </select>
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
      </div>
    </Container>
  );
}
