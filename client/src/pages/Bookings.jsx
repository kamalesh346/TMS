import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import CreateBookingModal from "../components/CreateBookingModal"; // 👈 Import modal

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 👈 Modal open state

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched bookings:", response.data.bookings);
      setBookings(response.data.bookings || []);
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
      fetchBookings(); // Refresh after cancel
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingId(null);
    }
  };

  const handleBookingCreated = () => {
    setIsModalOpen(false);
    fetchBookings(); // Refresh after new booking
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">My Bookings</Typography>
        <Button variant="contained" color="success" onClick={() => setIsModalOpen(true)}>
          Create Booking
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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

      {/* Booking Modal */}
      <CreateBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />
    </Container>
  );
}
