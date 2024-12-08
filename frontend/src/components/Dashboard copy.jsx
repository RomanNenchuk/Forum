import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useUserInfo } from "../contexts/UserInfoContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function DashBoard() {
  const [error, setError] = useState("");
  const { currentUser, token, logout } = useAuth();
  const { userName, avatar, setAvatar, createdAt, getUserInfo } = useUserInfo();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/user/profile-image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Вказуємо, що ми очікуємо Blob-дані
        }
      );
      const imageBlob = new Blob([response.data]);
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageSrc(imageObjectURL); // Задаємо отриманий URL як джерело для зображення
    } catch (error) {
      console.error("Помилка завантаження зображення:", error);
    }
  };

  // Завантажуємо зображення при першому рендері
  useEffect(() => {
    fetchImage();
    console.log("fetched");
  }, []);

  // Обробник вибору файлу
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile)); // Створюємо preview URL
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Будь ласка, виберіть файл!");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file); // Додаємо файл у FormData

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
      fetchImage();
      // setImageSrc(response.data.filePath);

      console.log("Відповідь сервера:", response.data);
    } catch (error) {
      setMessage("Помилка завантаження файлу.");
      console.error("Помилка:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  async function handleLogOut() {
    setError("");
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      setError("Failed to log out");
    }
  }
  console.log(avatar);

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="text-center mb-4">
            <img
              src={imageSrc || "/default-avatar.png"}
              alt="User Avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "1px solid #000",
              }}
            />
          </div>
          <div>
            <p>
              <strong>Name:</strong> {userName}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Account Created At:</strong> {createdAt}
            </p>
          </div>
          <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
            Update Profile
          </Link>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogOut}>
          Log Out
        </Button>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Завантажити</button>
        </form>
        {message && <p>{message}</p>}

        <div>
          {imageSrc ? (
            <img src={imageSrc} alt="Profile" />
          ) : (
            <p>Завантаження зображення...</p>
          )}
          <br /> <br />
          <img
            src={preview || imageSrc || avatar || "/default-avatar.png"}
            alt="User Avatar"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
      </div>
    </>
  );
}
