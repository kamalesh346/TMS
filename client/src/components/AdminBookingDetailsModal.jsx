import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Divider,
} from "@mui/material";

const style = {
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

export default function AdminBookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
}) {
  if (!booking) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Booking #{booking.id}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography><strong>Purpose:</strong> {booking.purpose}</Typography>
        <Typography><strong>Pickup:</strong> {booking.pickup}</Typography>
        <Typography><strong>Delivery:</strong> {booking.delivery}</Typography>
        <Typography><strong>Item:</strong> {booking.itemDesc}</Typography>
        <Typography><strong>Weight:</strong> {booking.weight} kg</Typography>
        <Typography><strong>Status:</strong> {booking.status}</Typography>
        <Typography sx={{ mt: 1 }}><strong>Created At:</strong> {new Date(booking.createdAt).toLocaleString()}</Typography>

        {booking.status === "pending" && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => onUpdateStatus(booking.id, "approved")}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => onUpdateStatus(booking.id, "rejected")}
            >
              Reject
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
}
