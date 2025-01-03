import React, { useRef, useState } from "react";
import { Form, Card, Alert } from "react-bootstrap";
import Divider from "../Divider.jsx";
import GoogleAuthButton from "../GoogleAuthButton.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import NavLink from "../NavLink.jsx";
import Avatar from "../Avatar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import "./Signup.css";

export default function Signup({ closeModal, setModalLoading }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextForm, setNextForm] = useState(false); //стан форми
  const [preview, setPreview] = useState(null); //змінна, що зберігає URL фото
  const [image, setImage] = useState(null);
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const majorRef = useRef();
  const nameRef = useRef();
  const surnameRef = useRef(); // треба додати референс прізвища у handleSubmit?
  const usernameRef = useRef();
  const imageInputRef = useRef();
  const { signup, loginWithGoogle, checkUserRegistration, checkUsername } =
    useAuth();
  const { saveUserInDB, saveAvatar } = useUserInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundPath = location.state?.backgroundLocation || "/";
  const redirectPath = location.state?.redirectPath || "/";

  async function handleSignUpWithGoogle(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const userCredential = await loginWithGoogle();
      if (!userCredential?.user) {
        throw new Error("No user found");
      }

      const user = userCredential.user; // Отримуємо користувача
      const token = await user.getIdToken(); // Отримуємо токен користувача

      const isRegistered = await checkUserRegistration(userCredential.user.uid);

      // зберігаємо в БД, тільки якщо такого користувача немає
      if (!isRegistered && token && user) {
        await saveUserInDB(token, {
          fullName: user.displayName || "Unknown", // Якщо немає імені, встановлюємо "Unknown"
          email: user.email,
          profilePicture: null,
        });
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Failed to sign up with Google:", error);
      setError("Failed to create an account");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAvatar(uid, token) {
    if (!image) return;

    try {
      await saveAvatar(image, uid, token);
    } catch (error) {
      setError("Помилка завантаження файлу");
      console.error("Помилка:", error.response?.data || error.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const usernameIsInUse = !!(await checkUsername(
        usernameRef.current.value
      ));

      if (usernameIsInUse) return setError("This username is already in use");

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
          fullName: nameRef.current.value,
          profilePicture: "",
        });
      }

      console.log(user.uid);

      if (preview) await handleSaveAvatar(user.uid, newToken);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError("Failed to create an account");
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  function handleImageClick() {
    imageInputRef.current.click();
  }

  function handleNextForm(e) {
    e.preventDefault();
    // if (passwordRef.current.value !== passwordConfirmRef.current.value)
    //   return setError("Passwords do not match");
    const form = e.target;
    if (form.checkValidity()) {
      setNextForm(!nextForm);
    } else {
      form.reportValidity();
    }
  }

  function ArrowBackHandleClick() {
    setNextForm(!nextForm);
  }

  return (
    <Card>
      <div style={nextForm ? { display: "none" } : {}}>
        <ModalHeader title={"Реєстрація"} onClose={closeModal} />
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <GoogleAuthButton onClick={handleSignUpWithGoogle} className="my-3" />

          <Divider text={"або"} />

          <Form onSubmit={handleNextForm}>
            <FormInput
              id={"email"}
              type={"email"}
              placeholder={"Ел. пошта"}
              ref={emailRef}
              required
            />

            <FormInput
              id={"username"}
              type={"text"}
              placeholder={"Ім'я користувача"}
              ref={usernameRef}
              required
            />

            <FormInput
              id={"password"}
              type={"password"}
              placeholder={"Пароль"}
              ref={passwordRef}
              required
            />

            <NavLink
              label={"Маєте акаунт?"}
              linkText={"Вхід у систему"}
              linkTo={"/login"}
              backgroundPath={backgroundPath}
              redirectPath={redirectPath}
              className="mt-4"
            />

            <ActionButton
              label={"Продовжити"}
              loading={loading}
              className="my-5"
            />
          </Form>
        </Card.Body>
      </div>

      <div style={!nextForm ? { display: "none", width: "100%" } : {}}>
        <ModalHeader
          title={"Реєстрація"}
          onBack={ArrowBackHandleClick}
          onClose={closeModal}
          renderArrowBack={true}
        />
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group id="avatar">
              <div className="text-center">
                <Avatar
                  preview={preview}
                  handleImageClick={handleImageClick}
                  style={{ border: "4px solid #ffd700", marginBottom: "30px" }}
                />

                <Form.Control
                  type="file"
                  onChange={handleImageChange}
                  ref={imageInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                />
              </div>
            </Form.Group>

            <FormInput
              id={"name"}
              type={"text"}
              placeholder={"Ім'я"}
              ref={nameRef}
              required
            />

            <FormInput
              id={"surname"}
              type={"text"}
              placeholder={"Прізвище"}
              ref={surnameRef}
              required
            />

            <Form.Group id="major">
              <select
                id="major"
                style={{ width: "100%" }}
                className="input_enter for-text mt-2 mt-xl-3  mb-3 mb-sm-2 "
                ref={majorRef}
                required
              >
                <option value="">Оберіть спеціальність</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="hamster">Hamster</option>
                <option value="parrot">Parrot</option>
                <option value="spider">Spider</option>
                <option value="goldfish">Goldfish</option>
                <option value="Chervanchuk">Chervanchuk</option>
              </select>
            </Form.Group>

            <ActionButton
              label={"Зареєструватися"}
              loading={loading}
              className="my-5"
            />
          </Form>
        </Card.Body>
      </div>
    </Card>
  );
}
