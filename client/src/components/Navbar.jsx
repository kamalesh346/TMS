// src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import * as jwt_decode from 'jwt-decode';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let role = "";
  if (token) {
    try {
      const decoded = jwt_decode.jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Transport System</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Button>
          {role === "booker" && (
            <Button component={RouterLink} to="/bookings" color="inherit">
              My Bookings
            </Button>
          )}
          {role === "admin" && (
            <Button component={RouterLink} to="/admin" color="inherit">
              Admin Panel
            </Button>
          )}
          {role === "driver" && (
            <Button component={RouterLink} to="/driver" color="inherit">
              My Trips
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
