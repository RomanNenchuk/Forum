import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useUserInfo } from "../contexts/UserInfoContext";
import { Link, useNavigate } from "react-router-dom";

export default function DashBoard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const { userName, avatar, fetchAvatar, createdAt, getUserInfo } =
    useUserInfo();
  const navigate = useNavigate();

  // вантажу інформацію з БД та аватарку
  useEffect(() => {
    getUserInfo();
    fetchAvatar();
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

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="text-center mb-4">
            <img
              src={avatar || "/default-avatar.png"}
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
    </>
  );
}
