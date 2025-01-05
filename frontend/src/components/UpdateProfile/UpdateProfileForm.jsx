import React from "react";
import { Form } from "react-bootstrap";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";

export default function UpdateProfileForm({
  isGoogleSignIn,
  currentUser,
  fullName,
  userName,
  fullNameRef,
  userNameRef,
  emailRef,
  passwordRef,
  newPasswordRef,
  onSubmit,
  loading,
}) {
  return (
    <Form onSubmit={onSubmit}>
      <FormInput
        id="fullName"
        type="text"
        placeholder="Повне ім'я"
        ref={fullNameRef}
        defaultValue={fullName}
        required
      />
      <FormInput
        id="userName"
        type="text"
        placeholder="Ім'я користувача"
        ref={userNameRef}
        defaultValue={userName}
        required
      />
      {!isGoogleSignIn && (
        <>
          <FormInput
            id="email"
            type="email"
            placeholder="Ел. пошта"
            ref={emailRef}
            defaultValue={currentUser.email}
            required
          />
          <FormInput
            id="reauth-password"
            type="password"
            placeholder="Пароль"
            ref={passwordRef}
            required
          />
          <FormInput
            id="password"
            type="password"
            placeholder="Новий пароль"
            ref={newPasswordRef}
          />
        </>
      )}
      <ActionButton label="Оновити" loading={loading} className="my-4" />
    </Form>
  );
}
