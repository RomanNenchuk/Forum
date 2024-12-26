import React, { useState, useEffect } from "react";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useUserInfo } from "../contexts/UserInfoContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "./Spinner.jsx";
import messageIcon from "../assets/message-icon.svg";

export default function Profile() {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const { userName, fullName, avatar, createdAt, getUserInfo } = useUserInfo();
  const navigate = useNavigate();

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    (async () => {
      try {
        if (id === currentUser?.uid) return;
        setLoading(true);
        const userInfo = await getUserInfo(id);
        setAuthor(userInfo);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleLogOut() {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      setError("Failed to log out");
    }
  }

  // Відображаю спінер, поки дані з БД не підвантажаться
  if (loading) return <LoadingSpinner />;

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Профіль</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="text-center mb-4 profile-image-container">
              <img
                src={author ? author.avatar : avatar || "/default-avatar.png"}
                alt="User Avatar"
                className="profile-image"
              />
            </div>
            {author && (
              <Link to={`/chats/${id}`}>
                <img src={messageIcon} alt="" />
              </Link>
            )}
            <div>
              <p>
                <strong>Повне ім'я:</strong> {author?.fullName || fullName}
              </p>
              <p>
                <strong>Ім'я користувача:</strong>{" "}
                {author?.userName || userName}
              </p>
              <p>
                <strong>Ел. пошта:</strong>{" "}
                {author?.email || currentUser?.email}
              </p>
              <p>
                <strong>Створено:</strong> {author?.createdAt || createdAt}
              </p>
            </div>
            {!author && (
              <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
                Оновити профіль
              </Link>
            )}
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          {!author && (
            <Button variant="link" onClick={handleLogOut}>
              Вийти
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
