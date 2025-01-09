import React from "react";
import Signup from "./Signup/Signup.jsx";
import Login from "./Login/Login.jsx";
import Profile from "./Profile";
import { AuthProvider } from "../contexts/AuthContext";
import { UserInfoProvider } from "../contexts/UserInfoContext";
import { ChatProvider } from "../contexts/ChatContext";
import { SocketProvider } from "../contexts/SocketProviderContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import NotFound from "./NotFound";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import UpdateProfile from "./UpdateProfile/UpdateProfile.jsx";
import Menu from "./Menu/Menu.jsx";
import Home from "./Home.jsx";
import Topic from "./Topic.jsx";
import CreateTopic from "./CreateTopic.jsx";
import ChatList from "./Chat/ChatList.jsx";
import Chat from "./Chat/Chat.jsx";
import Modal from "./Modal.jsx";
import { useBackgroundLocation } from "../hooks/useBackgroundLocation.jsx";
import DefaultChatScreen from "./DefaultChatScreen.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserInfoProvider>
          <AppRoutes />
        </UserInfoProvider>
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { backgroundLocation, showBackground } = useBackgroundLocation();

  return (
    <>
      <Routes location={backgroundLocation}>
        <Route element={<Menu />}>
          <Route path="/" element={<Home />} />
          <Route path="/topics/:id" element={<Topic />} />
          {/* <Route path="/profiles/:id" element={<Profile />} /> */}

          <Route element={<PrivateRoute />}>
            {/* <Route path="/update-profile" element={<UpdateProfile />} /> */}
            <Route path="/create-topic" element={<CreateTopic />} />
            <Route
              path="/chats/*"
              element={
                <SocketProvider>
                  <ChatProvider>
                    <Routes>
                      <Route path="/" element={<ChatList />}>
                        <Route index element={<DefaultChatScreen />} />
                        <Route path=":receiverId" element={<Chat />} />
                      </Route>
                    </Routes>
                  </ChatProvider>
                </SocketProvider>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Модальні маршрути */}
      {showBackground && (
        <Routes>
          <Route
            path="/login"
            element={
              <Modal>
                <Login />
              </Modal>
            }
          />
          <Route
            path="/signup"
            element={
              <Modal>
                <Signup />
              </Modal>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Modal>
                <ForgotPassword />
              </Modal>
            }
          />
          <Route
            path="/profiles/:id"
            element={
              <Modal>
                <Profile />
              </Modal>
            }
          />
          <Route element={<PrivateRoute />}>
            <Route
              path="/update-profile"
              element={
                <Modal>
                  <UpdateProfile />
                </Modal>
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
