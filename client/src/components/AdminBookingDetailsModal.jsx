// import React, { useEffect, useState } from "react";
// import { Modal, Box, Typography, Button, Divider } from "@mui/material";
// import axios from "axios";

// const style = {
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

// export default function AdminBookingDetailsModal({
//   bookingId,
//   isOpen,
//   onClose,
//   onUpdateStatus,
// }) {
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Fetch booking details
//   useEffect(() => {
//     if (isOpen && bookingId) {
//       const fetchBookingDetails = async () => {
//         try {
//           setLoading(true);
//           const token = localStorage.getItem("token");
//           const res = await axios.get(`/api/admin/bookings/${bookingId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setBookingDetails(res.data);
//         } catch (err) {
//           console.error("Error fetching booking details:", err);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchBookingDetails();
//     }
//   }, [isOpen, bookingId]);

//   // Reset modal state when closed
//   useEffect(() => {
//     if (!isOpen) {
//       setBookingDetails(null);
//       setLoading(false);
//     }
//   }, [isOpen]);

//   return (
//     <Modal open={isOpen} onClose={onClose}>
//       <Box sx={style}>
//         {loading ? (
//           <Typography>Loading booking details...</Typography>
//         ) : bookingDetails ? (
//           <>
//             <Typography variant="h6" gutterBottom>
//               Booking #{bookingDetails.id}
//             </Typography>
//             <Divider sx={{ mb: 2 }} />

//             <Typography>
//               <strong>Purpose:</strong> {bookingDetails.purpose || "Not specified"}
//             </Typography>
//             <Typography>
//               <strong>Pickup:</strong> {bookingDetails.pickup || "Not specified"}
//             </Typography>
//             <Typography>
//               <strong>Delivery:</strong> {bookingDetails.delivery || "Not specified"}
//             </Typography>
//             <Typography>
//               <strong>Item:</strong> {bookingDetails.itemDesc || "Not specified"}
//             </Typography>
//             <Typography>
//               <strong>Weight:</strong>{" "}
//               {bookingDetails.weight ? `${bookingDetails.weight} kg` : "Not specified"}
//             </Typography>
//             <Typography>
//               <strong>Status:</strong> {bookingDetails.status || "Not specified"}
//             </Typography>

//             <Typography sx={{ mt: 1 }}>
//               <strong>Req. Start Time:</strong>{" "}
//               {bookingDetails.requiredStartTime
//                 ? new Date(bookingDetails.requiredStartTime).toLocaleString()
//                 : "Not specified"}
//             </Typography>
//             <Typography sx={{ mt: 1 }}>
//               <strong>Req. End Time:</strong>{" "}
//               {bookingDetails.requiredEndTime
//                 ? new Date(bookingDetails.requiredEndTime).toLocaleString()
//                 : "Not specified"}
//             </Typography>

//             {bookingDetails.status === "pending" && (
//               <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
//                 <Button
//                   variant="contained"
//                   color="success"
//                   onClick={() => onUpdateStatus(bookingDetails.id, "approved")}
//                 >
//                   Approve
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   onClick={() => onUpdateStatus(bookingDetails.id, "rejected")}
//                 >
//                   Reject
//                 </Button>
//               </Box>
//             )}

//             <Box sx={{ mt: 2, textAlign: "right" }}>
//               <Button onClick={onClose}>Close</Button>
//             </Box>
//           </>
//         ) : (
//           <Typography>No booking details found.</Typography>
//         )}
//       </Box>
//     </Modal>
//   );
// }
import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, Divider } from "@mui/material";
import axios from "axios";

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
  bookingId,
  isOpen,
  onClose,
  onUpdateStatus,
}) {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch booking details
  useEffect(() => {
    if (isOpen && bookingId) {
      const fetchBookingDetails = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const res = await axios.get(`/api/admin/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBookingDetails(res.data);
        } catch (err) {
          console.error("Error fetching booking details:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setBookingDetails(null);
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        {loading ? (
          <Typography>Loading booking details...</Typography>
        ) : bookingDetails ? (
          <>
            <Typography variant="h6" gutterBottom>
              Booking #{bookingDetails.id}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography>
              <strong>Purpose:</strong> {bookingDetails.purpose || "Not specified"}
            </Typography>
            <Typography>
              <strong>Pickup:</strong> {bookingDetails.pickup || "Not specified"}
            </Typography>
            <Typography>
              <strong>Delivery:</strong> {bookingDetails.delivery || "Not specified"}
            </Typography>
            <Typography>
              <strong>Item:</strong> {bookingDetails.itemDesc || "Not specified"}
            </Typography>
            <Typography>
              <strong>Weight:</strong>{" "}
              {bookingDetails.weight ? `${bookingDetails.weight} kg` : "Not specified"}
            </Typography>
            <Typography>
              <strong>Status:</strong> {bookingDetails.status || "Not specified"}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              <strong>Req. Start Time:</strong>{" "}
              {bookingDetails.requiredStartTime
                ? new Date(bookingDetails.requiredStartTime).toLocaleString()
                : "Not specified"}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Req. End Time:</strong>{" "}
              {bookingDetails.requiredEndTime
                ? new Date(bookingDetails.requiredEndTime).toLocaleString()
                : "Not specified"}
            </Typography>

            {/* ✅ User Info Section */}
            {bookingDetails.user && (
              <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>User Info:</strong>
                </Typography>
                <Typography>
                  <strong>Name:</strong> {bookingDetails.user.name || "N/A"}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {bookingDetails.user.email || "N/A"}
                </Typography>
              </Box>
            )}

            {bookingDetails.status === "pending" && (
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onUpdateStatus(bookingDetails.id, "approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onUpdateStatus(bookingDetails.id, "rejected")}
                >
                  Reject
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button onClick={onClose}>Close</Button>
            </Box>
          </>
        ) : (
          <Typography>No booking details found.</Typography>
        )}
      </Box>
    </Modal>
  );
}
