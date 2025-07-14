import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Box,
} from "@mui/material";
import axios from "axios";

const TripAssignmentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [mappingId, setMappingId] = useState("");
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [trips, setTrips] = useState([]);

  const [locationFilter, setLocationFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [
        bookingsRes,
        mappingsRes,
        locationsRes,
        vehicleTypesRes,
        tripsRes,
      ] = await Promise.all([
        axios.get("/api/bookings/all", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "approved" },
        }),
        axios.get("/api/driver-vehicle/mappings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/dropdowns/locations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/dropdowns/vehicle-types", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/admin/trips", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setMappings(mappingsRes.data);
      setLocations(locationsRes.data);
      setVehicleTypes(vehicleTypesRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load trip assignment data.");
    }
  };

  const handleBookingSelect = (id) => {
    setSelectedBookings((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleAssignTrip = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/admin/trips/assign",
        {
          bookingIds: selectedBookings,
          mappingId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Trip assigned successfully!");
      setOpen(false);
      setSelectedBookings([]);
      setMappingId("");
      fetchData();
    } catch (err) {
      console.error("Trip assign error:", err);
      alert("Error assigning trip");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    return (
      (!locationFilter || b.pickup === locationFilter || b.delivery === locationFilter) &&
      (!vehicleTypeFilter || b.vehicleType?.type === vehicleTypeFilter) &&
      (!timeFilter || b.requiredTime?.startsWith(timeFilter))
    );
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Trip Assignment</Typography>

      <Box display="flex" gap={2} my={2} flexWrap="wrap">
        <TextField
          select label="Location" value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.name}>{loc.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Vehicle Type" value={vehicleTypeFilter}
          onChange={(e) => setVehicleTypeFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {vehicleTypes.map((vt) => (
            <MenuItem key={vt.id} value={vt.type}>{vt.type}</MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Required Date"
          InputLabelProps={{ shrink: true }}
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        />
      </Box>

      <Button onClick={() => setOpen(true)} variant="contained">
        Assign Trip
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign New Trip</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>Select Bookings</Typography>
          <FormGroup>
            {filteredBookings.map((booking) => (
              <FormControlLabel
                key={booking.id}
                control={
                  <Checkbox
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleBookingSelect(booking.id)}
                  />
                }
                label={`#${booking.id} | ${booking.pickup} → ${booking.delivery}`}
              />
            ))}
          </FormGroup>

          <Select
            fullWidth
            value={mappingId}
            onChange={(e) => setMappingId(e.target.value)}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="" disabled>Select Driver-Vehicle Mapping</MenuItem>
            {mappings.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.driver?.name} - {m.vehicle?.number} ({m.vehicle?.vehicleType?.type})
              </MenuItem>
            ))}
          </Select>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignTrip}
            variant="contained"
            disabled={!mappingId || selectedBookings.length === 0}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assigned Trips Display */}
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Assigned Trips</Typography>

        {trips.length === 0 ? (
          <Typography>No trips assigned yet.</Typography>
        ) : (
          trips.map((trip) => (
            <Box key={trip.id} p={2} mb={2} border={1} borderRadius={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Trip #{trip.id}
              </Typography>
              <Typography>
                🚛 Vehicle: {trip.vehicle?.number} ({trip.vehicle?.vehicleType?.type})<br />
                👨‍✈️ Driver: {trip.driver?.name}<br />
                🕒 {new Date(trip.startTime).toLocaleString()} → {new Date(trip.endTime).toLocaleString()}<br />
                📦 Bookings: {trip.bookings.map((b) => `#${b.id}`).join(", ")}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
};

export default TripAssignmentPage;
