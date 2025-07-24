import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Corrected import

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token); // ✅ Corrected usage
      const role = decoded.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "booker") {
        navigate("/bookings");
      } else if (role === "driver") {
        navigate("/driver");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Token decode error:", err);
      navigate("/login");
    }
  }, [navigate]);

  return null; // or <CircularProgress /> if you want a loader
}
