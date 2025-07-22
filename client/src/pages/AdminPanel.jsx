import React, { useEffect, useState } from "react";
import {
  Container, Typography, List, ListItem, ListItemText, Button, Box,
  Modal, Pagination, MenuItem, TextField, Stack, Divider
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import AddUserModal from "../components/AddUserModal"; 

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

const statusOptions = ["all", "pending", "approved", "rejected", "cancelled", "ongoing", "completed"];

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

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [vehicleTypeModalOpen, setVehicleTypeModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const [newLocation, setNewLocation] = useState("");
  const [newVehicleType, setNewVehicleType] = useState({
    type: "",
    length: "",
    breadth: "",
    height: ""
  });
  const [newVehicle, setNewVehicle] = useState({
    number: "",
    vehicleTypeId: ""
  });
  const [driverVehicleModalOpen, setDriverVehicleModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newMapping, setNewMapping] = useState({
    driverId: "",
    vehicleId: ""
  });
  const [driverVehicleMappings, setDriverVehicleMappings] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    fetchVehicleTypes();
    fetchBookings();
    fetchDriversAndVehicles();
    fetchDriverVehicleMappings();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/dropdowns/vehicle-types', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });  
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
      if (filterVehicleType) params.vehicleTypeId = filterVehicleType;
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

  const fetchDriversAndVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get("/api/dropdowns/drivers", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/dropdowns/vehicles", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error("Failed to fetch drivers or vehicles", err);
    }
  };
  
  const fetchDriverVehicleMappings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/driver-vehicle/mappings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDriverVehicleMappings(res.data);
    } catch (err) {
      console.error("Failed to fetch driver-vehicle mappings", err);
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

  const handleAddLocation = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/admin/locations", { name: newLocation }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Location added successfully");
      setNewLocation("");
      setLocationModalOpen(false);
    } catch (err) {
      console.error("Add location failed", err);
      alert("Failed to add location");
    }
  };

  const handleAddVehicleType = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/admin/vehicle-types", newVehicleType, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Vehicle type added successfully");
      setNewVehicleType({ type: "", length: "", breadth: "", height: "" });
      setVehicleTypeModalOpen(false);
      fetchVehicleTypes();
    } catch (err) {
      console.error("Add vehicle type failed", err);
      alert("Failed to add vehicle type");
    }
  };

  const handleAddVehicle = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/admin/vehicles", newVehicle, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Vehicle added successfully");
      setNewVehicle({ number: "", vehicleTypeId: "" });
      setVehicleModalOpen(false);
    } catch (err) {
      console.error("Add vehicle failed", err);
      alert("Failed to add vehicle");
    }
  };

  const handleAssignDriverToVehicle = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/driver-vehicle/assign", newMapping, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Driver assigned successfully");
      setDriverVehicleModalOpen(false);
      setNewMapping({ driverId: "", vehicleId: "" });
      fetchDriverVehicleMappings();    
    } catch (err) {
      console.error("Driver assignment failed", err);
      alert("Failed to assign driver");
    }
  };
  

  const paginatedBookings = bookings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>

      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          select label="Status" value={filterStatus}
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
          select label="Vehicle Type" value={filterVehicleType}
          onChange={(e) => setFilterVehicleType(e.target.value)}
          size="small" sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {vehicleTypes.map((v) => (
            <MenuItem key={v.id} value={v.id}>{v.type}</MenuItem>
          ))}
        </TextField>

        <TextField
          type="date" label="Date" InputLabelProps={{ shrink: true }}
          size="small" value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
        />

        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>

      {/* Admin Add Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => setLocationModalOpen(true)}>Add Location</Button>
        <Button variant="outlined" onClick={() => setVehicleTypeModalOpen(true)}>Add Vehicle Type</Button>
        <Button variant="outlined" onClick={() => setVehicleModalOpen(true)}>Add Vehicle</Button>
        <Button variant="outlined" onClick={() => setDriverVehicleModalOpen(true)}>Assign Driver to Vehicle</Button>
        <Button component={Link} to="/assign-trip" variant="contained">Assign Trip</Button>
        <Button variant="outlined" onClick={() => setUserModalOpen(true)}>Add User</Button>


      </Box>

      {/* Booking List */}
      <List>
        {paginatedBookings.map((booking) => (
          <ListItem
            key={booking.id} divider component="div"
            onClick={() => { setSelectedBooking(booking); setModalOpen(true); }}
            sx={{ cursor: "pointer" }}
            secondaryAction={
              booking.status === "pending" && (
                <>
                  <Button variant="contained" color="success" sx={{ mr: 1 }}
                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, "approved"); }}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="error"
                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, "rejected"); }}>
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

      {/* Booking Details Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
                    <Button variant="contained" color="success"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "approved")}>
                      Approve
                    </Button>
                    <Button variant="outlined" color="error"
                      onClick={() => handleUpdateStatus(selectedBooking.id, "rejected")}>
                      Reject
                    </Button>
                  </>
                )}
                <Button onClick={() => setModalOpen(false)}>Close</Button>
              </Box>
            </>
          ) : (
            <Typography>Loading booking details...</Typography>
          )}
        </Box>
      </Modal>
      
      {/* Driver-Vehicle Mappings Section */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>Driver-Vehicle Mappings</Typography>

      {driverVehicleMappings.map((mapping) => {
        if (!mapping.driver || !mapping.vehicle || !mapping.vehicle.vehicleType) {
          console.warn('❌ Incomplete mapping:', mapping);
          return null;
        }

        return (
          <ListItem key={mapping.id} divider>
            <ListItemText
              primary={`${mapping.driver.name} (${mapping.driver.email})`}
              secondary={`Vehicle: ${mapping.vehicle.number} | Type: ${mapping.vehicle.vehicleType.type}`}
            />
          </ListItem>
        );
      })}


      {/* Add Location Modal */}
      <Modal open={locationModalOpen} onClose={() => setLocationModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add New Location</Typography>
          <TextField fullWidth label="Location Name" value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setLocationModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddLocation}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      {/* Add Vehicle Type Modal */}
      <Modal open={vehicleTypeModalOpen} onClose={() => setVehicleTypeModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add Vehicle Type</Typography>
          {["type", "length", "breadth", "height"].map((field) => (
            <TextField
              key={field}
              fullWidth
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              type={field === "type" ? "text" : "number"}
              value={newVehicleType[field]}
              onChange={(e) => setNewVehicleType({ ...newVehicleType, [field]: e.target.value })}
              sx={{ mb: 2 }}
            />
          ))}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setVehicleTypeModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddVehicleType}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal open={vehicleModalOpen} onClose={() => setVehicleModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add Vehicle</Typography>
          <TextField
            fullWidth label="Vehicle Number" value={newVehicle.number}
            onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select fullWidth label="Vehicle Type"
            value={newVehicle.vehicleTypeId}
            onChange={(e) => setNewVehicle({ ...newVehicle, vehicleTypeId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {vehicleTypes.map((vt) => (
              <MenuItem key={vt.id} value={vt.id}>
                {vt.type}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setVehicleModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddVehicle}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={driverVehicleModalOpen} onClose={() => setDriverVehicleModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Assign Driver to Vehicle</Typography>

          <TextField
            select fullWidth label="Driver"
            value={newMapping.driverId}
            onChange={(e) => setNewMapping({ ...newMapping, driverId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {drivers.map((driver) => (
              <MenuItem key={driver.id} value={driver.id}>{driver.name} ({driver.email})</MenuItem>
            ))}
          </TextField>

          <TextField
            select fullWidth label="Vehicle"
            value={newMapping.vehicleId}
            onChange={(e) => setNewMapping({ ...newMapping, vehicleId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {vehicles.map((v) => (
              <MenuItem key={v.id} value={v.id}>{v.number}</MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setDriverVehicleModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAssignDriverToVehicle}>Assign</Button>
          </Stack>
        </Box>
      </Modal>

      <AddUserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSuccess={() => {
          alert("User registered successfully");
          setUserModalOpen(false);
          // optionally refresh something
        }}
      />


    </Container>
  );
}
