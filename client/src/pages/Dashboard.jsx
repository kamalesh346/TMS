import React from "react";
import { Container, Typography, Box, Grid, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const pages = [
    { title: "Drivers", path: "/admin/dashboard/drivers" },
    { title: "Fuel Logs", path: "/admin/dashboard/fuel" },
    { title: "Vehicles", path: "/admin/dashboard/vehicles" },
  ];

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        Admin Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {pages.map((page) => (
          <Grid item xs={12} sm={6} md={4} key={page.title}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {page.title}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(page.path)}
              >
                Go
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Container>
  );
}
