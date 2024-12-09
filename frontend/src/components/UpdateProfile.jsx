import React, { useRef, useState, useEffect } from "react";
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
  const imageInputRef = useRef();
  const { currentUser, token, updateUserPassword, updateUserEmail } = useAuth();
  const { userName, setUserName, avatar, fetchAvatar } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
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

  // Обробник вибору файлу
  async function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile)); // Створюємо preview URL
  }

  async function handleChangeAvatar(e) {
    e.preventDefault();
    if (!image) {
      setMessage("Будь ласка, виберіть файл!");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", image); // Додаємо файл у FormData

    try {
      const response = await axios.post(
        "http://localhost:5000/user/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Файл успішно завантажено!");
      fetchAvatar();

      console.log("Відповідь сервера:", response.data);
    } catch (error) {
      setMessage("Помилка завантаження файлу.");
      console.error("Помилка:", error.response?.data || error.message);
    }
  }

  async function handleImageClick() {
    imageInputRef.current.click();
  }

  useEffect(() => {
    fetchAvatar();
  }, []);

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {/* {message && <p>{message}</p>} */}
          <form className="text-center mb-4" onSubmit={handleChangeAvatar}>
            <img
              src={avatar || preview || "/default-avatar.png"}
              alt="User Avatar"
              onClick={handleImageClick}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "1px solid #000",
              }}
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <button type="submit">Change</button>
          </form>
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
