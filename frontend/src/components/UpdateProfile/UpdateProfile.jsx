import React, { useRef, useState, useEffect } from "react";
import { Form, Card, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "../Avatar.jsx";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import GoogleAuthButton from "../GoogleAuthButton.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import axios from "axios";

export default function UpdateProfile({ closeModal }) {
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
  const { userName, fullName, setUserName, avatar, setAvatar, saveAvatar } =
    useUserInfo();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

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
        // if (passwordRef.current.value !== passwordConfirmRef.current.value) {
        //   return setError("Passwords do not match");
        // }

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
      if (preview) await handleSaveAvatar();

      // додаю ім'я до списку оновлень на сервері, якщо воно було змінене
      if (fullNameRef.current.value !== fullName)
        userData.fullName = fullNameRef.current.value;

      // додаю ім'я користувача до списку оновлень на сервері, якщо воно було змінене
      if (userNameRef.current.value !== userName)
        userData.userName = userNameRef.current.value;

      // оновлюю дані на сервері, якщо я щось додавав до userData
      if (updatedToken && currentUser && Object.keys(userData).length !== 0)
        await updateUserOnServer(updatedToken, userData);

      navigateToProfile();
    } catch (error) {
      setError("Failed to update account. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function handleSaveAvatar() {
    if (!image) return;

    try {
      await saveAvatar(image);
    } catch (error) {
      setError("Помилка завантаження файлу");
      console.error("Помилка:", error.response?.data || error.message);
    }
  }

  function handleImageClick() {
    imageInputRef.current.click();
  }

  function navigateToProfile() {
    navigate(`/profiles/${currentUser.uid}`, {
      state: {
        backgroundLocation,
      },
      replace: true,
    });
  }

  useEffect(() => {
    // getUserInfo(currentUser.uid);
  }, []);

  return (
    <Card>
      <ModalHeader
        title={"Оновити профіль"}
        onClose={closeModal}
        onBack={navigateToProfile}
      />
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="info">{message}</Alert>}
        <Form
          onSubmit={e => {
            handleSubmit(e);
          }}
        >
          <div className="text-center">
            <Avatar
              preview={preview}
              avatar={avatar}
              handleImageClick={handleImageClick}
              style={{ border: "4px solid #ffd700", marginBottom: "20px" }}
            />

            <Form.Control
              type="file"
              onChange={handleImageChange}
              ref={imageInputRef}
              style={{ display: "none" }}
              accept="image/*"
            />
          </div>

          <FormInput
            id={"fullName"}
            type={"text"}
            placeholder={"Повне ім'я"}
            ref={fullNameRef}
            defaultValue={fullName}
            required
          />

          <FormInput
            id={"userName"}
            type={"text"}
            placeholder={"Ім'я користувача"}
            ref={userNameRef}
            defaultValue={userName}
            required
          />

          {isGoogleSignIn ? (
            <GoogleAuthButton onClick={handleSubmit} className="my-5" />
          ) : (
            <>
              <FormInput
                id={"email"}
                type={"email"}
                placeholder={"Ел. пошта"}
                ref={emailRef}
                defaultValue={currentUser.email}
                required
              />

              <FormInput
                id={"reauth-password"}
                type={"password"}
                placeholder={"Пароль"}
                ref={passwordForReauthRef}
                required
              />

              <FormInput
                id={"password"}
                type={"password"}
                placeholder={"Новий пароль"}
                ref={passwordRef}
              />

              {/* <FormInput
                    id={"password-confirm"}
                    type={"password"}
                    placeholder={"Підтвердження нового паролю"}
                    ref={passwordConfirmRef}
                  /> */}

              <ActionButton
                label={"Оновити"}
                loading={loading}
                className="my-4"
              />
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
