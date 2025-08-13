import { useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }

    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset link sent successfully");
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message || "Error sending reset email");
      } else {
        setMessage("Server not reachable. Please try again later.");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Forgot Password
        </Typography>
        <TextField
          type="email"
          label="Enter your email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Send Reset Link
        </Button>
        {message && (
          <Typography
            color="primary"
            variant="body2"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
