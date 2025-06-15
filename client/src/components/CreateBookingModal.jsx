import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function CreateBookingModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    purpose: "",
    pickup: "",
    delivery: "",
    itemDesc: "",
    weight: "",
    vehicleType: "",
    vehicleLength: "",
    vehicleBreadth: "",
    vehicleHeight: "",
    startTime: "",
    endTime: "",
  });

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [vehiclesRes, locationsRes] = await Promise.all([
          axios.get("/api/dropdowns/vehicle-types"),
          axios.get("/api/dropdowns/locations"),
        ]);
        setVehicleTypes(vehiclesRes.data);
        setLocations(locationsRes.data);
      } catch (err) {
        console.error("Error loading dropdowns:", err);
      }
    };

    if (open) fetchDropdowns();
  }, [open]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    for (const [key, value] of Object.entries(form)) {
      if (!value) {
        setError(`Please fill the "${key}" field.`);
        setLoading(false);
        return;
      }
    }

    const payload = {
      purpose: form.purpose,
      pickup: form.pickup,
      delivery: form.delivery,
      itemDesc: form.itemDesc,
      weight: Number(form.weight),
      vehicleType: form.vehicleType,
      vehicleLength: Number(form.vehicleLength),
      vehicleBreadth: Number(form.vehicleBreadth),
      vehicleHeight: Number(form.vehicleHeight),
      startTime: form.startTime,
      endTime: form.endTime,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/bookings/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (onSubmit) onSubmit();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      purpose: "",
      pickup: "",
      delivery: "",
      itemDesc: "",
      weight: "",
      vehicleType: "",
      vehicleLength: "",
      vehicleBreadth: "",
      vehicleHeight: "",
      startTime: "",
      endTime: "",
    });
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2} fontWeight="bold">
          Create Booking
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              select
              fullWidth
              label="Pickup Location"
              name="pickup"
              value={form.pickup}
              onChange={handleChange}
              sx={{ minWidth: 200 }}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.name} value={loc.name}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid xs={6}>
            <TextField
              select
              fullWidth
              label="Delivery Location"
              name="delivery"
              value={form.delivery}
              onChange={handleChange}
              sx={{ minWidth: 200 }}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.name} value={loc.name}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid xs={12}>
            <TextField
              fullWidth
              label="Item Description"
              name="itemDesc"
              value={form.itemDesc}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              fullWidth
              label="Weight (kg)"
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              select
              fullWidth
              label="Vehicle Type"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              sx={{ minWidth: 200 }}
            >
              {vehicleTypes.map((v) => (
                <MenuItem key={v.name} value={v.name}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid xs={4}>
            <TextField
              fullWidth
              label="Length (m)"
              name="vehicleLength"
              type="number"
              value={form.vehicleLength}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={4}>
            <TextField
              fullWidth
              label="Breadth (m)"
              name="vehicleBreadth"
              type="number"
              value={form.vehicleBreadth}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={4}>
            <TextField
              fullWidth
              label="Height (m)"
              name="vehicleHeight"
              type="number"
              value={form.vehicleHeight}
              onChange={handleChange}
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              fullWidth
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              fullWidth
              label="End Time"
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Booking"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
