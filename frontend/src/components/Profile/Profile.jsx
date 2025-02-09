import React, { useState, useEffect } from "react";
import { Card, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import Avatar from "../Avatar.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import ModalLoading from "../ModalLoading.jsx";
import InfoBlock from "./InfoBlock.jsx";
import "./Profile.css";
import axios from "axios";

export default function Profile({ onClose }) {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const { currentUser, logout } = useAuth();
  const { user, getUserInfo } = useUserInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id === currentUser?.uid) return setUserProfile(user);
        const userInfo = await getUserInfo(id);
        setUserProfile(userInfo);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  async function handleLogOut() {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      setError("Failed to log out");
    }
  }

  async function onSubscribe() {
    try {
      const result = await axios.post(`http://localhost:5000/subscriptions`, {
        user1_id: currentUser.uid,
        user2_id: id,
      });
      console.log(result);
      if (result.data.done) {
        setUserProfile(prev => ({
          ...prev,
          isSubscribedTo: true,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function onUnsubscribe() {
    try {
      const result = await axios.delete(`http://localhost:5000/subscriptions`, {
        data: {
          user1_id: currentUser.uid,
          user2_id: id,
        },
      });
      if (result.data.done) {
        setUserProfile(prev => ({
          ...prev,
          isSubscribedTo: false,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleChatClick() {
    navigate(currentUser ? `/chats/${id}` : `/login${location.search}`, {
      state: {
        otherUserName: userProfile.fullName,
        backgroundLocation,
        redirectPath: `/chats/${id}`,
      },
    });
  }

  return (
    <ModalLoading modalLoading={loading}>
      <ModalHeader
        title={userProfile?.fullName || "Невідомо"}
        onClose={onClose}
      />
      <Card.Body className="profile-modal-card-body">
        {error && <Alert variant="danger">{error}</Alert>}
        {userProfile ? (
          <>
            <div className="avatar-container text-center mb-4">
              <Avatar
                avatar={userProfile.avatar}
                style={{ border: "4px solid #ffd700" }}
              />
            </div>
            {id !== currentUser?.uid && (
              <div className="interaction-container">
                <h3 className="interaction-button" onClick={handleChatClick}>
                  Повідомлення
                </h3>
                {userProfile.isSubscribedTo ? (
                  <h3 className="interaction-button" onClick={onUnsubscribe}>
                    Не слідкувати
                  </h3>
                ) : (
                  <h3 className="interaction-button" onClick={onSubscribe}>
                    Слідкувати
                  </h3>
                )}
              </div>
            )}
            <div className="profile-info">
              <InfoBlock
                title={`@${userProfile.userName}`}
                caption={"Ім'я користувача"}
              />
              <InfoBlock title={`${userProfile.email}`} caption={"Ел. пошта"} />
            </div>
            {id === currentUser?.uid && (
              <>
                <ActionButton
                  label={"Оновити профіль"}
                  className="mt-5 mb-2"
                  onClick={() =>
                    navigate("/update-profile", {
                      state: {
                        backgroundLocation,
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
          </>
        ) : (
          <div>Інформації про користувача не знайдено</div>
        )}
      </Card.Body>
    </ModalLoading>
  );
}
