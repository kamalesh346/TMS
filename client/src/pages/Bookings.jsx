//newly added
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Box, CircularProgress, Alert } from "@mui/material";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched bookings:", response.data.bookings);
      setBookings(response.data.bookings || []); // <-- safeguard here
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelingId(id);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh bookings after cancellation
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Bookings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        bookings.map((booking) => (
          <Box
            key={booking.id}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #ccc",
              borderRadius: 1,
            }}
          >
            <Typography><strong>ID:</strong> {booking.id}</Typography>
            <Typography><strong>Purpose:</strong> {booking.purpose}</Typography>
            <Typography><strong>Pickup:</strong> {booking.pickup}</Typography>
            <Typography><strong>Delivery:</strong> {booking.delivery}</Typography>
            <Typography><strong>Weight:</strong> {booking.weight} kg</Typography>
            <Typography><strong>Status:</strong> {booking.status}</Typography>

            {booking.status === "pending" && (
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 1 }}
                disabled={cancelingId === booking.id}
                onClick={() => cancelBooking(booking.id)}
              >
                {cancelingId === booking.id ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}
          </Box>
        ))
      )}
    </Container>
  );
}
