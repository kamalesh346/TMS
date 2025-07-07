// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwt_decode.jwtDecode(token);

    // ✅ Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("Token expired.");
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // ✅ Check if role is allowed
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
}
