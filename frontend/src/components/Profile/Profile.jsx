import React, { useState, useEffect } from "react";
import { Card, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import Avatar from "../Avatar.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import messageIcon from "../../assets/message.svg";
import followIcon from "../../assets/follow.svg";
import unfollowIcon from "../../assets/unfollow.svg";
import "./Profile.css";
import ModalLoading from "../ModalLoading.jsx";
import axios from "axios";

export default function Profile({ onClose }) {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState(null);
  const { currentUser, logout } = useAuth();
  const { userName, fullName, avatar, createdAt, getUserInfo } = useUserInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    (async () => {
      try {
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
  async function onSubscribing() {
    try {
      const result = axios.post(`http://localhost:5000/subscriptions/${id}`, {user1_id : currentUser.uid});
    }
    catch (error) {
      console.error(error);
    }
  }
  async function onUnsubscribing(){
    try {
      const result = axios.delete(`http://localhost:5000/subscriptions/${id}`, {data : {user1_id : currentUser.uid},});
    }
    catch (error) {
      console.error(error);
    }
  }
  return (
    <ModalLoading modalLoading={loading}>
      <ModalHeader title={author?.fullName || fullName} onClose={onClose} />
      <Card.Body className="profile-modal-card-body">
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="avatar-container text-center mb-4">
          <Avatar
            avatar={author ? author.avatar : avatar}
            style={{ border: "4px solid #ffd700", marginBottom: "30px" }}
          />
        </div>
        {author && (
          <>
            <Link
              to={currentUser ? `/chats/${id}` : "/login"}
              state={{
                backgroundLocation,
                redirectPath: `/chats/${id}`,
              }}
              className="message-icon-link"
            >
              <img
                src={messageIcon}
                alt="Надіслати повідомлення"
                className="message-icon"
              />
            </Link>
            <img src={followIcon} alt="Слідкувати" onClick={onSubscribing} />
            <img src={unfollowIcon} alt="Не слідкувати" onClick={onUnsubscribing} />
          </>
        )}
        <div className="profile-info">
          <p>
            <strong>Ім'я користувача:</strong> {author?.userName || userName}
          </p>
          <p>
            <strong>Ел. пошта:</strong> {author?.email || currentUser?.email}
          </p>
          <p>
            <strong>Створено:</strong> {author?.createdAt || createdAt}
          </p>
        </div>
        {!author && (
          <>
            <ActionButton
              label={"Оновити профіль"}
              className="mt-5 mb-2"
              onClick={() =>
                navigate("/update-profile", {
                  state: {
                    backgroundLocation,
                    // redirectPath: `/update-profile`,
                  },
                  replace: true,
                })
              }
            />
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleLogOut}
                style={{ color: "#659287" }}
              >
                Вийти
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </ModalLoading>
  );
}
