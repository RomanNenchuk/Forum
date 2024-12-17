import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth"; // Імпортуємо необхідні функції
import { auth, googleAuthProvider } from "../config/firebase-config.js"; // Імпортуємо вже ініціалізований екземпляр auth

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  // Оновлений метод signup, використовуємо createUserWithEmailAndPassword
  async function signup(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function reauthenticate(email, password) {
    const credential = EmailAuthProvider.credential(email, password);
    return reauthenticateWithCredential(auth.currentUser, credential);
  }

  async function updateUserEmail(newEmail, password) {
    try {
      if (auth.currentUser == null) return;

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      return updateEmail(currentUser, newEmail);
    } catch (error) {
      console.error(error);
    }
  }

  async function updateUserPassword(password, newPassword) {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    await reauthenticateWithCredential(currentUser, credential);
    return updatePassword(currentUser, newPassword);
  }

  async function loginWithGoogle() {
    return signInWithPopup(auth, googleAuthProvider);
  }

  async function verifyPassword(currentPassword) {
    if (!currentUser) {
      throw new Error("No user is logged in.");
    }

    try {
      // Створюємо облікові дані
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      // Реавтентифікуємо користувача
      await reauthenticateWithCredential(currentUser, credential);
      console.log("Password is correct.");
      return true; // Пароль правильний
    } catch (error) {
      console.error("Error reauthenticating user:", error);
      if (error.code === "auth/wrong-password") {
        console.error("Incorrect password.");
      }
      return false; // Пароль неправильний
    }
  }

  async function reauthenticateWithGoogle() {
    if (!currentUser) {
      throw new Error("No user is logged in.");
    }

    try {
      // Ініціалізуємо GoogleAuthProvider
      const provider = new GoogleAuthProvider();

      // Входимо з використанням спливаючого вікна
      const result = await signInWithPopup(auth, provider);

      // Отримуємо облікові дані для реавтентифікації
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        throw new Error("Failed to get credentials from result.");
      }

      // Реавтентифікуємо користувача
      await reauthenticateWithCredential(currentUser, credential);
      console.log("Reauthenticated successfully with Google.");
      return true;
    } catch (error) {
      console.error("Error during Google reauthentication:", error);
      return false;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        try {
          const newToken = await user.getIdToken();
          // console.log(newToken);
          setToken(newToken); // Збереження токена
          setCurrentUser(user); // Оновлення поточного користувача
        } catch (error) {
          console.error("Помилка отримання токена:", error);
        }
      } else {
        setCurrentUser(null);
        setToken(""); // Очищення токена, якщо користувача немає
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    token,
    login,
    signup,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    reauthenticate,
    loginWithGoogle,
    verifyPassword,
    reauthenticateWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
