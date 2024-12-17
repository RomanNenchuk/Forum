import React from "react";
import SignUp from "./SignUp";
import Profile from "./Profile";
import Login from "./Login";
import { AuthProvider } from "../contexts/AuthContext";
import { UserInfoProvider } from "../contexts/UserInfoContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import NotFound from "./NotFound";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import Menu from "./Menu/Menu.jsx";
import Home from "./Home.jsx";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <UserInfoProvider>
            <Routes>
              {/* Захищені маршрути */}
              <Route element={<PrivateRoute />}>
                <Route element={<Menu />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/update-profile" element={<UpdateProfile />} />
                </Route>
              </Route>

              {/* Публічні маршрути */}
              <Route element={<Menu />}>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserInfoProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
