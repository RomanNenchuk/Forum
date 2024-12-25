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
  const { userName, avatar, createdAt, getUserInfo } = useUserInfo();
  const navigate = useNavigate();

  async function fetchUserInfo() {
    try {
      const userInfo = await getUserInfo(id);
      setAuthor(userInfo);
    } finally {
      setLoading(false);
    }
  }

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    setLoading(true);
    fetchUserInfo();
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
            <h2 className="text-center mb-4">Profile</h2>
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
                <strong>Name:</strong> {author ? author.userName : userName}
              </p>
              <p>
                <strong>Email:</strong> {author?.email || currentUser?.email}
              </p>
              <p>
                <strong>Account Created At:</strong>{" "}
                {author ? author.createdAt : createdAt}
              </p>
            </div>
            {!author && (
              <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
                Update Profile
              </Link>
            )}
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          {!author && (
            <Button variant="link" onClick={handleLogOut}>
              Log Out
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
