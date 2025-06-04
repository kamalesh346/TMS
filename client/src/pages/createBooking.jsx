import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const vehicleTypes = [
  "Truck",
  "Van",
  "Mini Truck",
  "Pickup",
  // Add your available vehicle types here
];

export default function CreateBooking() {
  const [formData, setFormData] = useState({
    bookingDate: "",
    pickupLocation: "",
    deliveryLocation: "",
    purpose: "",
    itemDescription: "",
    itemWeight: "",
    preferredVehicleType: "",
    estimatedLoadingTime: "",
    estimatedUnloadingTime: "",
    urgencyLevel: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/bookings/create",
        {
          bookingDate: formData.bookingDate,
          pickupLocation: formData.pickupLocation,
          deliveryLocation: formData.deliveryLocation,
          purpose: formData.purpose,
          itemDescription: formData.itemDescription,
          itemWeight: Number(formData.itemWeight),
          preferredVehicleType: formData.preferredVehicleType,
          estimatedLoadingTime: formData.estimatedLoadingTime,
          estimatedUnloadingTime: formData.estimatedUnloadingTime,
          urgencyLevel: formData.urgencyLevel,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg("Booking created successfully!");
      setFormData({
        bookingDate: "",
        pickupLocation: "",
        deliveryLocation: "",
        purpose: "",
        itemDescription: "",
        itemWeight: "",
        preferredVehicleType: "",
        estimatedLoadingTime: "",
        estimatedUnloadingTime: "",
        urgencyLevel: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Booking
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Booking Date"
          name="bookingDate"
          type="date"
          value={formData.bookingDate}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Pickup Location"
          name="pickupLocation"
          value={formData.pickupLocation}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Delivery Location"
          name="deliveryLocation"
          value={formData.deliveryLocation}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Item Description"
          name="itemDescription"
          value={formData.itemDescription}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Item Weight (kg)"
          name="itemWeight"
          type="number"
          value={formData.itemWeight}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          inputProps={{ min: 0 }}
        />

        <TextField
          select
          label="Preferred Vehicle Type"
          name="preferredVehicleType"
          value={formData.preferredVehicleType}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          {vehicleTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Estimated Loading Time (minutes)"
          name="estimatedLoadingTime"
          type="number"
          value={formData.estimatedLoadingTime}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Estimated Unloading Time (minutes)"
          name="estimatedUnloadingTime"
          type="number"
          value={formData.estimatedUnloadingTime}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Urgency Level"
          name="urgencyLevel"
          value={formData.urgencyLevel}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="Low / Medium / High"
          required
        />

        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Create Booking"}
        </Button>
      </Box>
    </Container>
  );
}
