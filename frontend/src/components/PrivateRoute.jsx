import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const previousPath = location.state?.from?.pathname || "/";

  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{
        backgroundLocation: previousPath,
        redirectPath: location.pathname,
      }}
      replace
    />
  );
}
