// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Typography,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
//   Box,
//   Divider,
// } from "@mui/material";
// import axios from "axios";

// export default function AdminPanel() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function fetchBookings() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get("/api/admin/bookings/pending", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("Admin bookings response:", res.data);
//         // Assume backend returns { bookings: [...] } or directly array
//         const data = Array.isArray(res.data.bookings)
//           ? res.data.bookings
//           : Array.isArray(res.data)
//           ? res.data
//           : [];
//         setBookings(data);
//       } catch (err) {
//         setError("Failed to fetch bookings");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchBookings();
//   }, []);

//   const handleUpdateStatus = async (id, status) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `/api/admin/bookings/${id}/status`,
//         { status },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       // Remove the updated booking from list
//       setBookings((prev) => prev.filter((booking) => booking.id !== id));
//     } catch (err) {
//       alert("Failed to update status");
//       console.error(err);
//     }
//   };

//   if (loading) return <Typography>Loading pending bookings...</Typography>;
//   if (error) return <Typography color="error">{error}</Typography>;

//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Admin Panel
//       </Typography>

//       <Box sx={{ mb: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           Pending Booking Approvals
//         </Typography>
//         {bookings.length === 0 ? (
//           <Typography>No bookings pending approval.</Typography>
//         ) : (
//           <List>
//             {bookings.map(({ id, bookingDate, pickupLocation, status }) => (
//               <ListItem key={id} divider>
//                 <ListItemText
//                   primary={`Booking #${id} — Status: ${status}`}
//                   secondary={`Pickup: ${pickupLocation}, Date: ${new Date(
//                     bookingDate
//                   ).toLocaleDateString()}`}
//                 />
//                 <Button
//                   variant="contained"
//                   color="success"
//                   onClick={() => handleUpdateStatus(id, "approved")}
//                   sx={{ mr: 1 }}
//                 >
//                   Approve
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   onClick={() => handleUpdateStatus(id, "rejected")}
//                 >
//                   Reject
//                 </Button>
//               </ListItem>
//             ))}
//           </List>
//         )}
//       </Box>

//       <Divider sx={{ my: 4 }} />

//       <Box>
//         <Typography variant="h6" gutterBottom>
//           Manage Vehicles (Coming Soon)
//         </Typography>
//         {/* Add vehicle management UI here */}
//       </Box>

//       <Box sx={{ mt: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           Manage Drivers (Coming Soon)
//         </Typography>
//         {/* Add driver management UI here */}
//       </Box>

//       <Box sx={{ mt: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           Analytics (Coming Soon)
//         </Typography>
//         {/* Add analytics or reports here */}
//       </Box>
//     </Container>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Divider,
} from "@mui/material";
import axios from "axios";

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("token");
        // Change this to your correct backend route:
        // Example assumes route is /api/bookings/all for admin bookings
        const res = await axios.get("/api/bookings/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Admin bookings response:", res.data);

        // Adapt based on your backend response shape
        const data = Array.isArray(res.data.bookings)
          ? res.data.bookings
          : Array.isArray(res.data)
          ? res.data
          : [];

        setBookings(data);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/bookings/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    }
  };

  if (loading) return <Typography>Loading pending bookings...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Pending Booking Approvals
        </Typography>
        {bookings.length === 0 ? (
          <Typography>No bookings pending approval.</Typography>
        ) : (
          <List>
            {bookings.map(({ id, purpose, pickup, delivery, status }) => (
              <ListItem key={id} divider>
                <ListItemText
                  primary={`Booking #${id} — Purpose: ${purpose} — Status: ${status}`}
                  secondary={`Pickup: ${pickup}, Delivery: ${delivery}`}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleUpdateStatus(id, "approved")}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleUpdateStatus(id, "rejected")}
                >
                  Reject
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          Manage Vehicles (Coming Soon)
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Manage Drivers (Coming Soon)
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Analytics (Coming Soon)
        </Typography>
      </Box>
    </Container>
  );
}
