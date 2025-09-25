import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function DashboardRedirect() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role;

    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (role === "booker") {
      return <Navigate to="/bookings" replace />;
    } else if (role === "driver") {
      return <Navigate to="/driver" replace />;
    }
  } catch (err) {
    console.error("Token decode error:", err);
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/login" replace />;
}
