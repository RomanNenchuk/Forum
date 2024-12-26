import React, { useRef, useState, useEffect } from "react";
import { Container, Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import styles from "./UpdateProfile.module.css";
import axios from "axios";

export default function UpdateProfile() {
  const fullNameRef = useRef();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordForReauthRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const imageInputRef = useRef();
  const {
    currentUser,
    token,
    updateUserPassword,
    updateUserEmail,
    verifyPassword,
    reauthenticateWithGoogle,
  } = useAuth();
  const { userName, fullName, setUserName, avatar, setAvatar, getUserInfo } =
    useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const isGoogleSignIn = currentUser.providerData.some(
    provider => provider.providerId === "google.com"
  );

  async function updateUserOnServer(token, userData) {
    try {
      const response = await axios.put(
        `http://localhost:5000/users/${currentUser.uid}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Передаємо токен
          },
        }
      );

      setUserName(response.data.user.username);
      return response.data; // Повертаємо відповідь, якщо потрібна
    } catch (error) {
      console.error("Error registering user on server:", error);
      throw error; // Кидаємо помилку далі для обробки
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      let verified = false;
      let userData = {};
      let updatedToken = token;

      if (isGoogleSignIn) {
        verified = reauthenticateWithGoogle();
        if (!verified) return setError("Wrong credentials");

        updatedToken = await currentUser.getIdToken(true);
      } else {
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
          return setError("Passwords do not match");
        }

        verified = await verifyPassword(passwordForReauthRef.current.value);
        if (!verified) return setError("Wrong password");

        const updateEmail = emailRef.current.value !== currentUser.email;
        if (updateEmail) {
          await updateUserEmail(
            emailRef.current.value,
            passwordForReauthRef.current.value
          );
          // Примусове оновлення токена після зміни email
          updatedToken = await currentUser.getIdToken(true);

          // Додаю імейл для оновлення на сервері
          userData.email = emailRef.current.value;
        }
        // перетворюю на булеве значення
        const updatePassword = !!passwordRef.current.value;
        if (updatePassword) {
          await updateUserPassword(
            passwordForReauthRef.current.value,
            passwordRef.current.value
          );
          // Примусове оновлення токена після зміни пароля
          updatedToken = await currentUser.getIdToken(true);
        }
      }

      // оновлюю аватар, якщо пароль правильний і користувач щось завантажував
      if (preview) await handleSaveAvatar(e);

      // додаю ім'я до списку оновлень на сервері, якщо воно було змінене
      if (fullNameRef.current.value !== fullName)
        userData.fullName = fullNameRef.current.value;

      // додаю ім'я користувача до списку оновлень на сервері, якщо воно було змінене
      if (userNameRef.current.value !== userName)
        userData.userName = userNameRef.current.value;

      // оновлюю дані на сервері, якщо я щось додавав до userData
      if (updatedToken && currentUser && Object.keys(userData).length !== 0)
        await updateUserOnServer(updatedToken, userData);

      navigate(`/profiles/${currentUser.uid}`);
    } catch (error) {
      setError("Failed to update account. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Обробник вибору файлу
  async function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile)); // Створюємо preview URL
  }

  async function handleSaveAvatar(e) {
    e.preventDefault();
    if (!image) {
      setMessage("Будь ласка, виберіть файл!");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", image); // Додаємо файл у FormData

    try {
      const response = await axios.post(
        `http://localhost:5000/users/${currentUser.uid}/profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvatar(response.data.fileUrl);
    } catch (error) {
      setMessage("Помилка завантаження файлу.");
      console.error("Помилка:", error.response?.data || error.message);
    }
  }

  async function handleImageClick() {
    imageInputRef.current.click();
  }

  useEffect(() => {
    // getUserInfo(currentUser.uid);
  }, []);

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Оновити профіль</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="info">{message}</Alert>}
            <Form
              onSubmit={e => {
                handleSubmit(e);
              }}
            >
              <div
                className={`mb-4 profile-image-container ${styles["profile-image-container"]}`}
              >
                <img
                  src={preview || avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  onClick={handleImageClick}
                  className={`profile-image ${styles["profile-image"]}`}
                />
                <img
                  src="/edit-image.png"
                  alt="Overlay"
                  onClick={handleImageClick}
                  className={`profile-image ${styles["profile-image-overlay"]} ${styles["profile-image"]}
                }`}
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <Form.Group id="fullname">
                <Form.Label>Ім'я та прізвище</Form.Label>
                <Form.Control
                  type="text"
                  ref={fullNameRef}
                  required
                  defaultValue={fullName}
                />
              </Form.Group>

              <Form.Group id="username" className="mb-4">
                <Form.Label>Ім'я користувача</Form.Label>
                <Form.Control
                  type="text"
                  ref={userNameRef}
                  required
                  defaultValue={userName}
                />
              </Form.Group>

              {isGoogleSignIn ? (
                <>
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      onClick={handleSubmit}
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
                </>
              ) : (
                <>
                  <Form.Group id="email">
                    <Form.Label>Ел. пошта</Form.Label>
                    <Form.Control
                      type="email"
                      ref={emailRef}
                      required
                      defaultValue={currentUser.email}
                    />
                  </Form.Group>
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
                  <Button
                    disabled={loading}
                    className="w-100 mt-2"
                    type="submit"
                  >
                    Оновити
                  </Button>
                </>
              )}
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          <Link to={`/profiles/${currentUser.uid}`}>Скасувати</Link>
        </div>
      </div>
    </Container>
  );
}
