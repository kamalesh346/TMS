import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";

export default function FuelPage() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5; // adjust per your preference

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const fetchFuelLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/fuel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch fuel logs", err);
    }
  };

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Fuel</Typography>
        <Box>
          <Button component={Link} to="/dashboard" variant="outlined">Back to Dashboard</Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>Total Fuel<br /><strong>--</strong></Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>Fill Logs<br /><strong>{logs.length}</strong></Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>Avg per Fill<br /><strong>--</strong></Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>Last Fill<br /><strong>--</strong></Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Fuel Logs</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentLogs.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.vehicle?.name || l.vehicleId}</TableCell>
                <TableCell>{l.driver?.name || l.driverId}</TableCell>
                <TableCell>{l.fuelQuantity}</TableCell>
                <TableCell>{new Date(l.filledAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Button onClick={handlePrev} disabled={currentPage === 1}>Previous</Button>
          <Typography>Page {currentPage} of {totalPages}</Typography>
          <Button onClick={handleNext} disabled={currentPage === totalPages}>Next</Button>
        </Box>
      </Paper>
    </Container>
  );
}
