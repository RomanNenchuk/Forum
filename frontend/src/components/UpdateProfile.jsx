import React, { useRef, useState } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useUserInfo } from "../contexts/UserInfoContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateProfile() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordForReauthRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, token, updateUserPassword, updateUserEmail } = useAuth();
  const { userName, setUserName, avatar, setAvatar } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isGoogleSignIn = currentUser.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  async function updateUserOnServer(token, userData) {
    try {
      const response = await axios.put(
        "http://localhost:5000/user/update",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Передаємо токен
          },
        }
      );

      console.log("User registered:", response.data);
      sessionStorage.setItem("userName", response.data.user.username);
      setUserName(response.data.user.username);
      return response.data; // Повертаємо відповідь, якщо потрібна
    } catch (error) {
      console.error("Error registering user on server:", error);
      throw error; // Кидаємо помилку далі для обробки
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      let updatedToken = token; // Поточний токен

      if (emailRef.current.value !== currentUser.email) {
        await updateUserEmail(
          emailRef.current.value,
          passwordForReauthRef.current.value
        );
        // Примусове оновлення токена після зміни email
        updatedToken = await currentUser.getIdToken(true);
      }

      if (passwordRef.current.value) {
        await updateUserPassword(
          passwordForReauthRef.current.value,
          passwordRef.current.value
        );
        // Примусове оновлення токена після зміни пароля
        updatedToken = await currentUser.getIdToken(true);
      }

      if (updatedToken && currentUser) {
        await updateUserOnServer(updatedToken, {
          userName:
            nameRef.current.value !== userName ? nameRef.current.value : null,
          email: emailRef.current.value,
        });
      }

      navigate("/");
    } catch (error) {
      setError("Failed to update account. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                ref={nameRef}
                required
                defaultValue={userName}
              />
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                required
                defaultValue={currentUser.email}
              />
            </Form.Group>
            {isGoogleSignIn ? (
              <Alert variant="info" className="mt-4">
                Since you logged in with Google, updating your profile
                information (email or password) is restricted.
              </Alert>
            ) : (
              <>
                <Form.Group id="reauth-password">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordForReauthRef}
                    required
                    placeholder="Enter current password to confirm changes"
                  />
                </Form.Group>
                <Form.Group id="password">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordRef}
                    placeholder="Leave blank to keep the same"
                  />
                </Form.Group>
                <Form.Group id="password-confirm">
                  <Form.Label>New Password Confirmation</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordConfirmRef}
                    placeholder="Leave blank to keep the same"
                  />
                </Form.Group>
                <Button disabled={loading} className="w-100 mt-2" type="submit">
                  Update
                </Button>
              </>
            )}
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
    </>
  );
}
