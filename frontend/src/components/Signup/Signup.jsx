import React, { useRef, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import FirstStepForm from "./FirstStepForm.jsx";
import SecondStepForm from "./SecondStepForm.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";

export default function Signup({ closeModal }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextForm, setNextForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const emailRef = useRef();
  const passwordRef = useRef();
  const usernameRef = useRef();
  const fullNameRef = useRef();
  const majorRef = useRef();
  const imageInputRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const backgroundPath = location.state?.backgroundLocation || "/";
  const redirectPath = location.state?.redirectPath || "/";

  const { signup, loginWithGoogle, checkUserRegistration } = useAuth();
  const { saveUserInDB, saveAvatar } = useUserInfo();

  const handleSignUpWithGoogle = async e => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const userCredential = await loginWithGoogle();
      const user = userCredential?.user;
      const token = await user?.getIdToken();

      if (user && token) {
        const isRegistered = await checkUserRegistration(user.uid);
        if (!isRegistered) {
          await saveUserInDB(token, {
            fullName: user.displayName || "Unknown",
            email: user.email,
            profilePicture: null,
          });
        }
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error("No user found");
      }
    } catch (error) {
      setError("Помилка при створенні акаунту");
    } finally {
      setLoading(false);
    }
  };

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const userCredential = await signup(
        emailRef.current.value,
        passwordRef.current.value
      );

      const user = userCredential.user; // Отримуємо користувача з відповіді
      const newToken = await user.getIdToken(); // Отримуємо токен користувача

      if (newToken && user) {
        await saveUserInDB(newToken, {
          email: emailRef.current.value,
          userName: usernameRef.current.value,
          fullName: fullNameRef.current.value,
          profilePicture: null,
        });
      }
      if (preview && image) await saveAvatar(image, user.uid, newToken);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.log(error);
      setError("Помилка при створенні акаунту");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <FirstStepForm
        style={nextForm ? { display: "none" } : {}}
        error={error}
        backgroundPath={backgroundPath}
        redirectPath={redirectPath}
        emailRef={emailRef}
        usernameRef={usernameRef}
        passwordRef={passwordRef}
        handleSignUpWithGoogle={handleSignUpWithGoogle}
        setNextForm={setNextForm}
        closeModal={closeModal}
        setError={setError}
        loading={loading}
      />
      <SecondStepForm
        style={nextForm ? {} : { display: "none" }}
        error={error}
        preview={preview}
        setPreview={setPreview}
        fullNameRef={fullNameRef}
        majorRef={majorRef}
        imageInputRef={imageInputRef}
        handleSubmit={handleRegister}
        closeModal={closeModal}
        setNextForm={setNextForm}
        setImage={setImage}
        loading={loading}
      />
    </Card>
  );
}
