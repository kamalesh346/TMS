import React, { useEffect, useState } from "react";
import {
  Container, Typography, List, ListItem, ListItemText, Button, Box, Divider, Modal,
  Pagination,
} from "@mui/material";
import axios from "axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
};

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/bookings/all", {
        headers: { Authorization: `Bearer ${token}` },
        params: filterStatus ? { status: filterStatus } : {},
      });
      setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    }
  };

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  const paginatedBookings = bookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography color="text.secondary">Pending: {pendingCount}</Typography>
        <Typography color="text.secondary">Cancelled: {cancelledCount}</Typography>
      </Box>

      <List>
        {paginatedBookings.map((booking) => (
          <ListItem
            key={booking.id}
            divider
            component="div"
            onClick={() => openModal(booking)}
            sx={{ cursor: "pointer" }}
            secondaryAction={
              booking.status === "pending" && (
                <>
                  <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(booking.id, "approved");
                  }}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="error" onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(booking.id, "rejected");
                  }}>
                    Reject
                  </Button>
                </>
              )
            }
          >
            <ListItemText
              primary={`Booking #${booking.id} — Purpose: ${booking.purpose}`}
              secondary={`Status: ${booking.status} | Pickup: ${booking.pickup} → ${booking.delivery}`}
            />
          </ListItem>
        ))}
      </List>

      <Pagination
        count={Math.ceil(bookings.length / itemsPerPage)}
        page={page}
        onChange={(e, val) => setPage(val)}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />

      <Modal open={modalOpen} onClose={closeModal}>
        <Box sx={modalStyle}>
          {selectedBooking ? (
            <>
              <Typography variant="h6" gutterBottom>
                Booking #{selectedBooking.id}
              </Typography>
              <Typography><strong>Purpose:</strong> {selectedBooking.purpose}</Typography>
              <Typography><strong>Pickup:</strong> {selectedBooking.pickup}</Typography>
              <Typography><strong>Delivery:</strong> {selectedBooking.delivery}</Typography>
              <Typography><strong>Item Description:</strong> {selectedBooking.itemDesc}</Typography>
              <Typography><strong>Weight:</strong> {selectedBooking.weight} kg</Typography>
              <Typography><strong>Status:</strong> {selectedBooking.status}</Typography>
              <Typography><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</Typography>

              {selectedBooking.user && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">User Info</Typography>
                  <Typography><strong>Name:</strong> {selectedBooking.user.name}</Typography>
                  <Typography><strong>Email:</strong> {selectedBooking.user.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedBooking.user.phone}</Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                {selectedBooking.status === "pending" && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button onClick={closeModal}>Close</Button>
              </Box>
            </>
          ) : (
            <Typography>Loading booking details...</Typography>
          )}
        </Box>
      </Modal>
    </Container>
  );
}
