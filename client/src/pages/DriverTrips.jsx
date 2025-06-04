import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, List, ListItem, ListItemText, Button, Box } from "@mui/material";
import * as jwt_decode from 'jwt-decode';

export default function DriverTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get driver ID from token
  const token = localStorage.getItem("token");
  let driverId = null;
  if (token) {
    try {
      const decoded = jwt_decode.jwtDecode(token);
      driverId = decoded.userId;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  useEffect(() => {
    if (!driverId) return;

    async function fetchTrips() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/driver/${driverId}/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Driver trips response:", res.data);
        // Backend might return { trips: [...] } or directly an array
        const data = Array.isArray(res.data.trips)
          ? res.data.trips
          : Array.isArray(res.data)
          ? res.data
          : [];
        setTrips(data);
      } catch (err) {
        setError("Failed to load trips.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [driverId, token]);

  const updateTripStatus = async (tripId, newStatus) => {
    try {
      await axios.put(
        `/api/trips/${tripId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, status: newStatus } : trip
        )
      );
    } catch (err) {
      console.error("Failed to update trip status", err);
      setError("Failed to update trip status.");
    }
  };

  if (loading) return <Typography>Loading trips...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!Array.isArray(trips) || trips.length === 0) {
    return <Typography>No assigned trips.</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Assigned Trips
      </Typography>
      <List>
        {trips.map((trip) => (
          <ListItem key={trip.id} divider>
            <ListItemText
              primary={`From: ${trip.pickupLocation} To: ${trip.deliveryLocation}`}
              secondary={`Status: ${trip.status}`}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              {trip.status !== "started" && (
                <Button
                  variant="outlined"
                  onClick={() => updateTripStatus(trip.id, "started")}
                >
                  Mark Started
                </Button>
              )}
              {trip.status === "started" && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => updateTripStatus(trip.id, "loading")}
                  >
                    Mark Loading
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => updateTripStatus(trip.id, "ended")}
                  >
                    Mark Ended
                  </Button>
                </>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}


