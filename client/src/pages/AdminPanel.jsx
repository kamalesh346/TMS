import React, { useEffect, useState } from "react";
import {
  Container, Typography, List, ListItem, ListItemText, Button, Box,
  Modal, Pagination, MenuItem, TextField
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";

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

const statusOptions = ["all", "pending", "approved", "rejected", "cancelled"];

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [filterStatus, setFilterStatus] = useState("all");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filterVehicleType, setFilterVehicleType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicleTypes();
    fetchBookings();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const res = await axios.get("/api/dropdowns/vehicle-types");
      setVehicleTypes(res.data);
    } catch (err) {
      console.error("Vehicle types fetch error:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {};

      if (filterStatus !== "all") params.status = filterStatus;
      if (filterVehicleType) params.vehicleType = filterVehicleType;
      if (filterStartDate) params.startDate = dayjs(filterStartDate).format("YYYY-MM-DD");

      const res = await axios.get("/api/bookings/all", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBookings();
    setPage(1);
  };

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


  const paginatedBookings = bookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          select
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Vehicle Type"
          value={filterVehicleType}
          onChange={(e) => setFilterVehicleType(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {vehicleTypes.map((v) => (
            <MenuItem key={v.id} value={v.type}>{v.type}</MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
        />


        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>

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
              primary={`Booking #${booking.id} — ${booking.purpose}`}
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

      {/* Modal */}
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
              <Typography><strong>Vehicle Type:</strong> {selectedBooking.vehicleType?.type}</Typography>
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
