import React, { useEffect, useState } from "react";
import { 
  Container, Typography, Box, Grid, Paper, Table, TableHead, TableRow, 
  TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, CircularProgress, Divider, TablePagination
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [vehiclesRes, tripsRes] = await Promise.all([
          axios.get("/api/dropdowns/vehicles", { headers }),
          axios.get("/api/admin/trips", { headers }),
        ]);

        setVehicles(vehiclesRes.data || []);
        setTrips(tripsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch vehicles or trips:", err);
        setError("Failed to load vehicle data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // KPIs and Bar Chart Data
  const { kpis, barChartData } = React.useMemo(() => {
    if (!vehicles.length) return { kpis: {}, barChartData: [] };

    const vehiclesOnTripIds = new Set(
      trips.filter(t => t.startTime && !t.endTime).map(t => t.vehicleId)
    );

    const types = [...new Set(vehicles.map(v => v.type).filter(Boolean))];

    const kpiMetrics = {
      totalVehicles: vehicles.length,
      vehicleTypes: types.length,
      available: vehicles.length - vehiclesOnTripIds.size,
      onTrip: vehiclesOnTripIds.size,
    };

    const chartData = types.map(type => ({
      name: type,
      'Vehicle Count': vehicles.filter(v => v.type === type).length
    })).sort((a, b) => b['Vehicle Count'] - a['Vehicle Count']);

    return { kpis: kpiMetrics, barChartData: chartData };
  }, [vehicles, trips]);

  const handleClose = () => setSelectedVehicle(null);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!vehicles.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography>No vehicles found.</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vehicle Fleet Analytics
        </Typography>
        <Button component={Link} to="/dashboard" variant="outlined">Back to Dashboard</Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <KpiCard icon={<LocalShippingIcon color="primary" />} title="Total Vehicles" value={kpis.totalVehicles || 0} />
          <KpiCard icon={<AltRouteIcon color="secondary" />} title="Vehicle Types" value={kpis.vehicleTypes || 0} />
          <KpiCard icon={<CheckCircleOutlineIcon color="success" />} title="Available" value={kpis.available || 0} />
          <KpiCard icon={<NotInterestedIcon color="error" />} title="On Trip" value={kpis.onTrip || 0} />
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Fleet Composition</Typography>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip cursor={{fill: 'rgba(233, 236, 239, 0.5)'}}/>
                  <Legend />
                  <Bar dataKey="Vehicle Count" fill="#1976d2" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <Typography>No vehicle data to display chart.</Typography>
              </Box>
            )}
          </Grid>

          {/* Vehicle Table */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>All Vehicle Details</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((v) => {
                      const onTrip = trips.some(t => t.vehicleId === v.id && !t.endTime);
                      return (
                        <TableRow key={v.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{v.number}</TableCell>
                          <TableCell>{v.type || "N/A"}</TableCell>
                          <TableCell>{onTrip ? "On Trip" : "Available"}</TableCell>
                          <TableCell>
                            <Button variant="outlined" size="small" onClick={() => setSelectedVehicle(v)}>View</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={vehicles.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5]}
              />
            </TableContainer>
          </Grid>

        </Grid>
      </Paper>

      {/* Vehicle Details Dialog */}
      <Dialog open={Boolean(selectedVehicle)} onClose={handleClose}>
        <DialogTitle>Vehicle Details</DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Box>
              <Typography><strong>Number:</strong> {selectedVehicle.number}</Typography>
              <Typography><strong>Type:</strong> {selectedVehicle.type || 'N/A'}</Typography>
              <Typography><strong>Status:</strong> {trips.some(t => t.vehicleId === selectedVehicle.id && !t.endTime) ? 'On Trip' : 'Available'}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

// KPI Card Helper
function KpiCard({ icon, title, value }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Box display="flex" alignItems="center" p={2} sx={{ borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
        {icon}
        <Box ml={2}>
          <Typography color="textSecondary">{title}</Typography>
          <Typography variant="h5"><strong>{value}</strong></Typography>
        </Box>
      </Box>
    </Grid>
  );
}

// Table Container Helper
function TableContainer({ children }) {
  return <Box sx={{ width: '100%', overflowX: 'auto' }}>{children}</Box>;
}
