// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const path = location.pathname;

  const token = localStorage.getItem("auth_token");
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
  const role = localStorage.getItem("user_role");

  const getLoginRedirectPath = () => {
    if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
      return "/admin"; // admin login
    }
    return "/auth"; // user / owner login
  };

  // NOT LOGGED IN
  if (!token || !isLoggedIn || !role) {
    return (
      <Navigate
        to={getLoginRedirectPath()}
        state={{ from: location }}
        replace
      />
    );
  }

  // WRONG ROLE
  if (!allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/dashboard" replace />;
    if (role === "owner")
      return <Navigate to="/owner/channelpartnerdashboard" replace />;
    return <Navigate to="/user/turfs" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
