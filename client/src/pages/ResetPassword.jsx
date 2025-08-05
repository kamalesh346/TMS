import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, TextField, Button, Typography, Box, CircularProgress } from "@mui/material";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    // Validation checks
    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/auth/reset-password", {
        token,
        newPassword,
      });

      setMessage(res.data.message);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Reset Password
        </Typography>
        <TextField
          type="password"
          label="New Password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Confirm Password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {message && (
          <Typography color="primary" variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
        </Button>
      </Box>
    </Container>
  );
}

// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Container, TextField, Button, Typography, Box } from "@mui/material";

// export default function ResetPassword() {
//   const { token } = useParams();
//   const navigate = useNavigate();

//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const handleResetPassword = async () => {
//     setError("");
//     setMessage("");

//     if (!newPassword || !confirmPassword) {
//       setError("Please fill all fields");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     try {
//       const res = await axios.post("http://localhost:4000/api/auth/reset-password", {
//         token,
//         newPassword,
//       });

//       setMessage(res.data.message);
//       setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//     } catch (err) {
//       setError(err.response?.data?.message || "Error resetting password");
//     }
//   };

//   return (
//     <Container maxWidth="xs">
//       <Box sx={{ mt: 8 }}>
//         <Typography variant="h5" align="center" gutterBottom>
//           Reset Password
//         </Typography>
//         <TextField
//           type="password"
//           label="New Password"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//         />
//         <TextField
//           type="password"
//           label="Confirm Password"
//           variant="outlined"
//           fullWidth
//           margin="normal"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//         />
//         {error && (
//           <Typography color="error" variant="body2" sx={{ mt: 1 }}>
//             {error}
//           </Typography>
//         )}
//         {message && (
//           <Typography color="primary" variant="body2" sx={{ mt: 1 }}>
//             {message}
//           </Typography>
//         )}
//         <Button
//           variant="contained"
//           fullWidth
//           sx={{ mt: 2 }}
//           onClick={handleResetPassword}
//         >
//           Reset Password
//         </Button>
//       </Box>
//     </Container>
//   );
// }
