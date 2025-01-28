import React, { useEffect, useRef, useState } from "react";
import { Card, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import {
  setInputInvalid,
  setAllInputsValid,
  usernameOrEmailTaken,
  checkPasswordsValidity,
} from "../../utils/checkValidity.jsx";
import AvatarUploader from "../AvatarUploader.jsx";
import UpdateProfileForm from "./UpdateProfileForm.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import axios from "axios";

export default function UpdateProfile({ onClose }) {
  const {
    currentUser,
    token,
    updateUserPassword,
    updateUserEmail,
    verifyPassword,
  } = useAuth();
  const {
    userName,
    fullName,
    setUserName,
    avatar,
    setAvatar,
    saveAvatar,
    deleteAvatar,
  } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const fullNameRef = useRef();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const newPasswordRef = useRef();
  const imageInputRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

  useEffect(() => {
    setPreview(avatar);
  }, [avatar]);

  const isGoogleSignIn = currentUser.providerData.some(
    provider => provider.providerId === "google.com"
  );

  async function updateUserOnServer(token, userId, userData) {
    const response = await axios.put(
      `http://localhost:5000/users/${userId}`,
      userData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    let newToken = token;
    const userData = {};

    try {
      setError("");
      setAllInputsValid(emailRef, userNameRef, fullNameRef);

      // перевіряємо пароль користувача, якщо він реєструвався як email + password
      if (!isGoogleSignIn) {
        if (!checkPasswordsValidity(setError, passwordRef, newPasswordRef))
          return;
        const verified = await verifyPassword(passwordRef.current.value);
        if (!verified) throw new Error("Неправильний пароль");
      }

      // emailChanged буде false, якщо користувач входив за google
      const emailChanged =
        !isGoogleSignIn && emailRef?.current?.value !== currentUser.email;
      const userNameChanged = userNameRef.current.value !== userName;
      const fullNameChanged = fullNameRef.current.value !== fullName;

      if (emailChanged || userNameChanged) {
        const { emailExists, usernameExists } = await usernameOrEmailTaken(
          emailRef?.current?.value || currentUser.email,
          userNameRef.current.value
        );

        if (emailChanged && emailExists)
          return setInputInvalid(
            emailRef,
            setError,
            "Ця ел. пошта вже використовується"
          );

        if (userNameChanged && usernameExists)
          return setInputInvalid(
            userNameRef,
            setError,
            "Це ім'я користувача вже зайняте"
          );

        if (emailChanged) {
          await updateUserEmail(
            emailRef.current.value,
            passwordRef.current.value
          );
          newToken = await currentUser.getIdToken(true);
          userData.email = emailRef.current.value;
        }
        if (userNameChanged) userData.userName = userNameRef.current.value;
      }
      if (fullNameChanged) userData.fullName = fullNameRef.current.value;

      if (newPasswordRef?.current?.value) {
        await updateUserPassword(
          passwordRef.current.value,
          newPasswordRef.current.value
        );
        newToken = await currentUser.getIdToken(true);
      }

      if (preview && image) await saveAvatar(image, currentUser.uid, newToken);
      if (!preview && avatar) await deleteAvatar(currentUser.uid, newToken);

      if (Object.keys(userData).length > 0) {
        const response = await updateUserOnServer(
          newToken,
          currentUser.uid,
          userData
        );
        setUserName(response.userName);
        setAvatar(response.avatar);
      }

      navigateToProfile();
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function navigateToProfile() {
    navigate(`/profiles/${currentUser.uid}`, {
      state: { backgroundLocation },
      replace: true,
    });
  }

  return (
    <Card>
      <ModalHeader
        title="Оновити профіль"
        onClose={onClose}
        onBack={navigateToProfile}
      />
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <AvatarUploader
          preview={preview}
          setPreview={setPreview}
          setImage={setImage}
          imageInputRef={imageInputRef}
          deleteAvatar={deleteAvatar}
          setError={setError}
        />
        <UpdateProfileForm
          isGoogleSignIn={isGoogleSignIn}
          currentUser={currentUser}
          fullName={fullName}
          userName={userName}
          fullNameRef={fullNameRef}
          userNameRef={userNameRef}
          emailRef={emailRef}
          passwordRef={passwordRef}
          newPasswordRef={newPasswordRef}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Card.Body>
    </Card>
  );
}
