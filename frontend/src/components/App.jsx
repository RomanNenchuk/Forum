import React from "react";
import SignUp from "./SignUp";
import Profile from "./Profile";
import Login from "./Login";
import { AuthProvider } from "../contexts/AuthContext";
import { UserInfoProvider } from "../contexts/UserInfoContext";
import { ChatProvider } from "../contexts/ChatContext";
import { SocketProvider } from "../contexts/SocketProviderContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import NotFound from "./NotFound";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile/UpdateProfile.jsx";
import Menu from "./Menu/Menu.jsx";
import Home from "./Home.jsx";
import Topic from "./Topic.jsx";
import CreateTopic from "./CreateTopic.jsx";
import ChatList from "./ChatList.jsx";
import Chat from "./Chat.jsx";

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
                  <Route path="/update-profile" element={<UpdateProfile />} />
                  <Route path="/create-topic" element={<CreateTopic />} />
                </Route>
              </Route>

              {/* Публічні маршрути */}
              <Route element={<Menu />}>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/topics/:id" element={<Topic />} />
                <Route path="/profiles/:id" element={<Profile />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Контексти для чатів */}
                <Route
                  path="/chats/*"
                  element={
                    <SocketProvider>
                      <ChatProvider>
                        <Routes>
                          <Route path="/" element={<ChatList />}>
                            {/* Дочірні маршрути */}
                            <Route
                              index
                              element={<h1>Виберіть чат для спілкування</h1>}
                            />
                            <Route path=":receiverId" element={<Chat />} />
                          </Route>
                        </Routes>
                      </ChatProvider>
                    </SocketProvider>
                  }
                />
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
