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
import CreateBookingModal from "../components/CreateBookingModal";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingId(null);
    }
  };

  const handleBookingCreated = () => {
    setIsModalOpen(false);
    fetchBookings();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          My Bookings
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => setIsModalOpen(true)}
        >
          Create Booking
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        bookings.map((booking) => (
          <Box
            key={booking.id}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #ccc",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography><strong>ID:</strong> {booking.id}</Typography>
            <Typography><strong>Purpose:</strong> {booking.purpose}</Typography>
            <Typography><strong>Pickup:</strong> {booking.pickup}</Typography>
            <Typography><strong>Delivery:</strong> {booking.delivery}</Typography>
            <Typography><strong>Weight:</strong> {booking.weight} kg</Typography>
            <Typography><strong>Status:</strong> {booking.status}</Typography>
            
            <Typography><strong>Vehicle Type:</strong> {booking.vehicleType}</Typography>
            <Typography><strong>Required Time:</strong> {new Date(booking.requiredTime).toLocaleString()}</Typography>
            <Typography><strong>Loading Time:</strong> {booking.estimatedLoadingTime} mins</Typography>
            <Typography><strong>Unloading Time:</strong> {booking.estimatedUnloadingTime} mins</Typography>
            <Typography><strong>Urgency:</strong> {booking.urgencyLevel}</Typography>


            {booking.status === "pending" && (
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 2 }}
                disabled={cancelingId === booking.id}
                onClick={() => cancelBooking(booking.id)}
              >
                {cancelingId === booking.id
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </Button>
            )}
          </Box>
        ))
      )}

      {/* Booking Modal */}
      <CreateBookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingCreated}
      />
    </Container>
  );
}
