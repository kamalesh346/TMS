import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";
import CreateBookingModal from "../components/CreateBookingModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwt_decode.jwtDecode(token);
      setRole(decoded.role);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleBookingCreated = () => {
    setIsModalOpen(false);
    console.log("Booking created successfully");
  };

  const renderDashboardContent = () => {
    switch (role) {
      case "booker":
        return (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              You are logged in as a <strong>Booker</strong>.
            </Typography>
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 3 }}
              onClick={() => setIsModalOpen(true)}
            >
              Create Booking
            </Button>
          </>
        );
      case "driver":
        return (
          <Typography variant="h6" sx={{ mt: 2 }}>
            You are logged in as a <strong>Driver</strong>.
          </Typography>
        );
      case "admin":
        return (
          <Typography variant="h6" sx={{ mt: 2 }}>
            You are logged in as an <strong>Admin</strong>.
          </Typography>
        );
      default:
        return (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Unknown role. Please contact support.
          </Typography>
        );
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Dashboard
        </Typography>

        {renderDashboardContent()}

        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 4 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>

      <CreateBookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingCreated}
      />
    </Container>
  );
}
