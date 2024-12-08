import React from "react";
import SignUp from "./SignUp";
import DashBoard from "./Dashboard";
import Login from "./Login";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { UserInfoProvider } from "../contexts/UserInfoContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import NotFound from "./NotFound";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";

function App() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Router>
          <AuthProvider>
            <UserInfoProvider>
              <Routes>
                {/* Захищені маршрути */}
                <Route path="/" element={<PrivateRoute />}>
                  <Route index element={<DashBoard />} />
                </Route>
                <Route path="/update-profile" element={<PrivateRoute />}>
                  <Route index element={<UpdateProfile />} />
                </Route>
                {/* Публічні маршрути */}
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </UserInfoProvider>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
