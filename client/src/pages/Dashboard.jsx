import React from "react";
import { Container, Typography, Box } from "@mui/material";

export default function Dashboard() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome to the Dashboard
        </Typography>
        <Typography align="center">
          You are now logged in.
        </Typography>
      </Box>
    </Container>
  );
}
