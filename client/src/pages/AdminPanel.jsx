// import React, { useEffect, useState } from "react";
// import {
//   Container, Typography, List, ListItem, ListItemText, Button, Box,
//   Modal, Pagination, MenuItem, TextField, Stack
// } from "@mui/material";
// import axios from "axios";
// import dayjs from "dayjs";

// const modalStyle = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   borderRadius: 2,
//   p: 3,
// };

// const statusOptions = ["all", "pending", "approved", "rejected", "cancelled"];

// export default function AdminPanel() {
//   const [bookings, setBookings] = useState([]);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [page, setPage] = useState(1);
//   const itemsPerPage = 20;
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [filterVehicleType, setFilterVehicleType] = useState("");
//   const [filterStartDate, setFilterStartDate] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [locationModalOpen, setLocationModalOpen] = useState(false);
//   const [newLocation, setNewLocation] = useState("");

//   const [vehicleTypeModalOpen, setVehicleTypeModalOpen] = useState(false);
//   const [newVehicleType, setNewVehicleType] = useState({
//     type: "",
//     length: "",
//     breadth: "",
//     height: ""
//   });

//   useEffect(() => {
//     fetchVehicleTypes();
//     fetchBookings();
//   }, []);

//   const fetchVehicleTypes = async () => {
//     try {
//       const res = await axios.get("/api/dropdowns/vehicle-types");
//       setVehicleTypes(res.data);
//     } catch (err) {
//       console.error("Vehicle types fetch error:", err);
//     }
//   };

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const params = {};

//       if (filterStatus !== "all") params.status = filterStatus;
//       if (filterVehicleType) params.vehicleType = filterVehicleType;
//       if (filterStartDate) params.startDate = dayjs(filterStartDate).format("YYYY-MM-DD");

//       const res = await axios.get("/api/bookings/all", {
//         headers: { Authorization: `Bearer ${token}` },
//         params,
//       });

//       setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
//     } catch (err) {
//       console.error("Fetch bookings error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     fetchBookings();
//     setPage(1);
//   };

//   const handleUpdateStatus = async (id, status) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.patch(`/api/bookings/${id}/status`, { status }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchBookings();
//     } catch (err) {
//       alert("Failed to update status");
//       console.error(err);
//     }
//   };

//   const openModal = (booking) => {
//     setSelectedBooking(booking);
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setSelectedBooking(null);
//   };

//   const handleAddLocation = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post("/api/admin/locations", { name: newLocation }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("Location added successfully");
//       setNewLocation("");
//       setLocationModalOpen(false);
//     } catch (err) {
//       console.error("Add location failed", err);
//       alert("Failed to add location");
//     }
//   };

//   const handleAddVehicleType = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post("/api/dropdowns/vehicle-types", newVehicleType, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("Vehicle type added successfully");
//       setVehicleTypeModalOpen(false);
//       setNewVehicleType({ type: "", length: "", breadth: "", height: "" });
//       fetchVehicleTypes();
//     } catch (err) {
//       console.error("Add vehicle type failed", err);
//       alert("Failed to add vehicle type");
//     }
//   };

//   const paginatedBookings = bookings.slice(
//     (page - 1) * itemsPerPage,
//     page * itemsPerPage
//   );

//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom>Admin Panel</Typography>

//       {/* Filters */}
//       <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
//         <TextField
//           select
//           label="Status"
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           size="small"
//         >
//           {statusOptions.map((status) => (
//             <MenuItem key={status} value={status}>
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//             </MenuItem>
//           ))}
//         </TextField>

//         <TextField
//           select
//           label="Vehicle Type"
//           value={filterVehicleType}
//           onChange={(e) => setFilterVehicleType(e.target.value)}
//           size="small"
//           sx={{ minWidth: 150 }}
//         >
//           <MenuItem value="">All</MenuItem>
//           {vehicleTypes.map((v) => (
//             <MenuItem key={v.id} value={v.type}>{v.type}</MenuItem>
//           ))}
//         </TextField>

//         <TextField
//           type="date"
//           label="Date"
//           InputLabelProps={{ shrink: true }}
//           size="small"
//           value={filterStartDate}
//           onChange={(e) => setFilterStartDate(e.target.value)}
//         />

//         <Button variant="contained" onClick={handleSearch}>Search</Button>
//       </Box>

//       {/* Admin Add Buttons */}
//       <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
//         <Button variant="outlined" onClick={() => setLocationModalOpen(true)}>
//           Add Location
//         </Button>
//         <Button variant="outlined" onClick={() => setVehicleTypeModalOpen(true)}>
//           Add Vehicle Type
//         </Button>
//       </Box>

//       {/* Booking List */}
//       <List>
//         {paginatedBookings.map((booking) => (
//           <ListItem
//             key={booking.id}
//             divider
//             component="div"
//             onClick={() => openModal(booking)}
//             sx={{ cursor: "pointer" }}
//             secondaryAction={
//               booking.status === "pending" && (
//                 <>
//                   <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={(e) => {
//                     e.stopPropagation();
//                     handleUpdateStatus(booking.id, "approved");
//                   }}>
//                     Approve
//                   </Button>
//                   <Button variant="outlined" color="error" onClick={(e) => {
//                     e.stopPropagation();
//                     handleUpdateStatus(booking.id, "rejected");
//                   }}>
//                     Reject
//                   </Button>
//                 </>
//               )
//             }
//           >
//             <ListItemText
//               primary={`Booking #${booking.id} — ${booking.purpose}`}
//               secondary={`Status: ${booking.status} | Pickup: ${booking.pickup} → ${booking.delivery}`}
//             />
//           </ListItem>
//         ))}
//       </List>

//       <Pagination
//         count={Math.ceil(bookings.length / itemsPerPage)}
//         page={page}
//         onChange={(e, val) => setPage(val)}
//         sx={{ mt: 2, display: "flex", justifyContent: "center" }}
//       />

//       {/* Booking Details Modal */}
//       <Modal open={modalOpen} onClose={closeModal}>
//         <Box sx={modalStyle}>
//           {selectedBooking ? (
//             <>
//               <Typography variant="h6" gutterBottom>
//                 Booking #{selectedBooking.id}
//               </Typography>
//               <Typography><strong>Purpose:</strong> {selectedBooking.purpose}</Typography>
//               <Typography><strong>Pickup:</strong> {selectedBooking.pickup}</Typography>
//               <Typography><strong>Delivery:</strong> {selectedBooking.delivery}</Typography>
//               <Typography><strong>Item Description:</strong> {selectedBooking.itemDesc}</Typography>
//               <Typography><strong>Weight:</strong> {selectedBooking.weight} kg</Typography>
//               <Typography><strong>Vehicle Type:</strong> {selectedBooking.vehicleType?.type}</Typography>
//               <Typography><strong>Status:</strong> {selectedBooking.status}</Typography>
//               <Typography><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</Typography>

//               {selectedBooking.user && (
//                 <Box sx={{ mt: 2 }}>
//                   <Typography variant="subtitle1">User Info</Typography>
//                   <Typography><strong>Name:</strong> {selectedBooking.user.name}</Typography>
//                   <Typography><strong>Email:</strong> {selectedBooking.user.email}</Typography>
//                   <Typography><strong>Phone:</strong> {selectedBooking.user.phone}</Typography>
//                 </Box>
//               )}

//               <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
//                 {selectedBooking.status === "pending" && (
//                   <>
//                     <Button variant="contained" color="success" onClick={() => handleUpdateStatus(selectedBooking.id, "approved")}>
//                       Approve
//                     </Button>
//                     <Button variant="outlined" color="error" onClick={() => handleUpdateStatus(selectedBooking.id, "rejected")}>
//                       Reject
//                     </Button>
//                   </>
//                 )}
//                 <Button onClick={closeModal}>Close</Button>
//               </Box>
//             </>
//           ) : (
//             <Typography>Loading booking details...</Typography>
//           )}
//         </Box>
//       </Modal>

//       {/* Add Location Modal */}
//       <Modal open={locationModalOpen} onClose={() => setLocationModalOpen(false)}>
//         <Box sx={modalStyle}>
//           <Typography variant="h6" gutterBottom>Add New Location</Typography>
//           <TextField
//             fullWidth
//             label="Location Name"
//             value={newLocation}
//             onChange={(e) => setNewLocation(e.target.value)}
//             sx={{ mb: 2 }}
//           />
//           <Stack direction="row" spacing={2} justifyContent="flex-end">
//             <Button onClick={() => setLocationModalOpen(false)}>Cancel</Button>
//             <Button variant="contained" onClick={handleAddLocation}>Add</Button>
//           </Stack>
//         </Box>
//       </Modal>

//       {/* Add Vehicle Type Modal */}
//       <Modal open={vehicleTypeModalOpen} onClose={() => setVehicleTypeModalOpen(false)}>
//         <Box sx={modalStyle}>
//           <Typography variant="h6" gutterBottom>Add Vehicle Type</Typography>
//           <TextField
//             fullWidth
//             label="Type"
//             value={newVehicleType.type}
//             onChange={(e) => setNewVehicleType({ ...newVehicleType, type: e.target.value })}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             fullWidth
//             label="Length (m)"
//             type="number"
//             value={newVehicleType.length}
//             onChange={(e) => setNewVehicleType({ ...newVehicleType, length: e.target.value })}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             fullWidth
//             label="Breadth (m)"
//             type="number"
//             value={newVehicleType.breadth}
//             onChange={(e) => setNewVehicleType({ ...newVehicleType, breadth: e.target.value })}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             fullWidth
//             label="Height (m)"
//             type="number"
//             value={newVehicleType.height}
//             onChange={(e) => setNewVehicleType({ ...newVehicleType, height: e.target.value })}
//             sx={{ mb: 2 }}
//           />
//           <Stack direction="row" spacing={2} justifyContent="flex-end">
//             <Button onClick={() => setVehicleTypeModalOpen(false)}>Cancel</Button>
//             <Button variant="contained" onClick={handleAddVehicleType}>Add</Button>
//           </Stack>
//         </Box>
//       </Modal>
//     </Container>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  Container, Typography, List, ListItem, ListItemText, Button, Box,
  Modal, Pagination, MenuItem, TextField, Stack
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
            <MenuItem key={v.id} value={v.type}>{v.type}</MenuItem>
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
    </Container>
  );
}
