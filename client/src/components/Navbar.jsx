import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import * as jwt_decode from "jwt-decode";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [anchorEl, setAnchorEl] = React.useState(null);

  let role = "";
  if (token) {
    try {
      const decoded = jwt_decode.jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    handleMenuClose();
  };

  const handleChangePassword = () => {
    navigate("/change-password");
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          Transport System
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

          {/* Profile Menu */}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
