// // src/components/ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }
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
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/login" replace />;
  }

  return children;
}
