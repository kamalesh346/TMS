// import React, { useEffect, useState } from "react";
// import { Container, Typography, Box, Button } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import * as jwt_decode from 'jwt-decode';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     try {
//       const decoded = jwt_decode.jwtDecode(token);
//       setRole(decoded.role);
//     } catch (err) {
//       console.error("Invalid token", err);
//       localStorage.removeItem("token");
//       navigate("/login");
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   const renderDashboardContent = () => {
//     switch (role) {
//       case "booker":
//         return <Typography>You are logged in as a <strong>Booker</strong>.</Typography>;
//       case "driver":
//         return <Typography>You are logged in as a <strong>Driver</strong>.</Typography>;
//       case "admin":
//         return <Typography>You are logged in as an <strong>Admin</strong>.</Typography>;
//       default:
//         return <Typography>Unknown role. Please contact support.</Typography>;
//     }
//   };

//   return (
//     <Container maxWidth="md">
//       <Box sx={{ mt: 8, textAlign: "center" }}>
//         <Typography variant="h4" gutterBottom>
//           Welcome to the Dashboard
//         </Typography>
//         {renderDashboardContent()}
//         <Button
//           variant="outlined"
//           color="primary"
//           sx={{ mt: 4 }}
//           onClick={handleLogout}
//         >
//           Logout
//         </Button>
//       </Box>
//     </Container>
//   );
// }
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as jwt_decode from 'jwt-decode';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

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

  const renderDashboardContent = () => {
    switch (role) {
      case "booker":
        return <Typography>You are logged in as a <strong>Booker</strong>.</Typography>;
      case "driver":
        return <Typography>You are logged in as a <strong>Driver</strong>.</Typography>;
      case "admin":
        return <Typography>You are logged in as an <strong>Admin</strong>.</Typography>;
      default:
        return <Typography>Unknown role. Please contact support.</Typography>;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: "center" }}>
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
      </Box>
    </Container>
  );
}
