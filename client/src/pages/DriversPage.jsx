import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// --- SVG Icons (Self-contained to avoid import issues) ---
const KpiIcon = ({ type }) => {
  const icons = {
    totalDrivers: <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-8 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 0 0-2 2v1h4v-1a2 2 0 0 0-2-2zm8-2a2 2 0 0 0-2 2v1h4v-1a2 2 0 0 0-2-2z" />,
    totalTrips: <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8h2v-2h14v2h2v-8l-2.08-5.99zM6.5 12c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9s1.5.67 1.5 1.5S7.33 12 6.5 12zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />,
    avgTripsPerDriver: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />,
    topDriver: <path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z" />,
  };
  return <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">{icons[type] || ""}</svg>;
};

// --- Reusable Components ---
const KpiCard = ({ title, value, iconType }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }} elevation={2}>
    <Box sx={{ color: 'primary.main' }}><KpiIcon type={iconType} /></Box>
    <Box>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" component="p" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ padding: "8px 12px" }}>
        <Typography variant="subtitle2" gutterBottom>{label}</Typography>
        {payload.map((pld) => (
           <Typography key={pld.dataKey} variant="body2" sx={{ color: pld.fill || pld.stroke }}>
            {`${pld.name}: ${pld.value.toFixed(1)}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`driver-tabpanel-${index}`} aria-labelledby={`driver-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3} }}>{children}</Box>}
    </div>
  );
};

// --- Main Page Component ---
export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [driversRes, tripsRes] = await Promise.all([
          axios.get("/api/dropdowns/drivers", { headers }),
          axios.get("/api/admin/trips", { headers }),
        ]);
        setDrivers(driversRes.data || []);
        setTrips(tripsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const { chartData, kpis, radarChartData, fleetTrendsData } = React.useMemo(() => {
    if (!drivers.length || !trips.length) return { chartData: [], kpis: {}, radarChartData: [], fleetTrendsData: [] };

    // --- Main Driver Performance Data ---
    const data = drivers.map(d => {
      const driverTrips = trips.filter(t => t.driverId === d.id);
      const tripCount = driverTrips.length;
      const { totalDuration, totalDistance } = driverTrips.reduce((acc, t) => {
        let duration = 0;
        if (t.startTime && t.endTime) {
          duration = (new Date(t.endTime) - new Date(t.startTime)) / (1000 * 60 * 60);
        }
        acc.totalDuration += duration;
        acc.totalDistance += Number(t.distance) || 0;
        return acc;
      }, { totalDuration: 0, totalDistance: 0 });
      return {
        name: d.name,
        Trips: tripCount,
        "Avg Duration (hrs)": tripCount > 0 ? Number((totalDuration / tripCount).toFixed(1)) : 0,
        "Total Distance (km)": Number(totalDistance.toFixed(1)),
      };
    }).sort((a, b) => b.Trips - a.Trips);

    // --- KPIs ---
    const kpiMetrics = {
      totalDrivers: drivers.length,
      totalTrips: trips.length,
      avgTripsPerDriver: drivers.length ? (trips.length / drivers.length).toFixed(1) : 0,
      topDriver: data.length ? data[0].name : "-",
    };

    // --- Radar Chart Data (Top 5 Drivers) ---
    const top5Drivers = data.slice(0, 5);
    const radarMetrics = ["Trips", "Avg Duration (hrs)", "Total Distance (km)"];
    const radarData = radarMetrics.map(metric => {
        const entry = { subject: metric };
        top5Drivers.forEach(driver => {
            entry[driver.name] = driver[metric];
        });
        return entry;
    });

    // --- Fleet Trends Data (Last 30 Days) ---
    const trends = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    trips.forEach(trip => {
        const tripDate = new Date(trip.startTime);
        if (tripDate >= thirtyDaysAgo) {
            const dateStr = tripDate.toISOString().split('T')[0];
            if (!trends[dateStr]) {
                trends[dateStr] = { date: dateStr, "Total Trips": 0, "Total Distance": 0 };
            }
            trends[dateStr]["Total Trips"] += 1;
            trends[dateStr]["Total Distance"] += Number(trip.distance) || 0;
        }
    });
    const sortedTrends = Object.values(trends).sort((a,b) => new Date(a.date) - new Date(b.date));


    return { chartData: data.slice(0, 15), kpis: kpiMetrics, radarChartData: radarData, fleetTrendsData: sortedTrends };
  }, [drivers, trips]);

  const selectedDriverTrips = React.useMemo(() => {
    if (!selectedDriver) return [];
    return trips
      .filter(t => t.driverId === selectedDriver.id)
      .slice(-10)
      .map((t, index) => ({
        name: `Trip ${index + 1}`,
        Distance: t.distance || 0,
        date: new Date(t.startTime).toLocaleDateString(),
      }));
  }, [selectedDriver, trips]);

  const top5DriverColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">Drivers Analytics</Typography>
          <Button component={Link} to="/dashboard" variant="outlined">Back to Dashboard</Button>
        </Box>

        <Paper elevation={2} sx={{ width: '100%' }}>
          <Box sx={{ p: { xs: 2, md: 3 }, pb: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}><KpiCard title="Total Drivers" value={kpis.totalDrivers} iconType="totalDrivers" /></Grid>
              <Grid item xs={12} sm={6} md={3}><KpiCard title="Total Trips" value={kpis.totalTrips} iconType="totalTrips" /></Grid>
              <Grid item xs={12} sm={6} md={3}><KpiCard title="Avg Trips / Driver" value={kpis.avgTripsPerDriver} iconType="avgTripsPerDriver" /></Grid>
              <Grid item xs={12} sm={6} md={3}><KpiCard title="Top Driver" value={kpis.topDriver} iconType="topDriver" /></Grid>
            </Grid>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="driver charts tabs" variant="scrollable" scrollButtons="auto">
              <Tab label="Fleet Trends" id="driver-tab-0" />
              <Tab label="Driver Performance" id="driver-tab-1" />
              <Tab label="Top Driver Comparison" id="driver-tab-2" />
            </Tabs>
          </Box>
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom align="center">Fleet Activity (Last 30 Days)</Typography>
            <Box sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={fleetTrendsData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" stroke="#82ca9d" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="Total Trips" stroke="#82ca9d" fillOpacity={1} fill="url(#colorTrips)" />
                    <Area yAxisId="right" type="monotone" dataKey="Total Distance" stroke="#8884d8" fillOpacity={1} fill="url(#colorDistance)" />
                  </AreaChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom align="center">Trips per Driver (Top 15)</Typography>
            <Box sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 20 }}>
                   <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} domain={[0, 'dataMax + 2']} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                  <Bar dataKey="Trips" fill="url(#colorBar)" barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom align="center">Top 5 Driver Comparison</Typography>
            <Box sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {chartData.slice(0, 5).map((driver, index) => (
                      <Radar key={driver.name} name={driver.name} dataKey={driver.name} stroke={top5DriverColors[index]} fill={top5DriverColors[index]} fillOpacity={0.6} />
                    ))}
                  </RadarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
        </Paper>

        <Paper sx={{ p: 2, mt: 4 }} elevation={2}>
          <Typography variant="h6" gutterBottom>All Driver Details</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Total Trips</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.email || "-"}</TableCell>
                  <TableCell>{trips.filter(t => t.driverId === d.id).length}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => setSelectedDriver(d)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={Boolean(selectedDriver)} onClose={() => setSelectedDriver(null)} maxWidth="md" fullWidth>
          <DialogTitle>Driver Details: {selectedDriver?.name}</DialogTitle>
          <DialogContent>
            {selectedDriver && (
              <Box>
                <Typography><strong>Email:</strong> {selectedDriver.email || 'N/A'}</Typography>
                <Paper sx={{ p: 2, mt: 2, height: 300 }} variant="outlined">
                  <Typography variant="subtitle1" gutterBottom>Last 10 Trips (Distance)</Typography>
                  <ResponsiveContainer width="100%" height="90%">
                    {selectedDriverTrips.length > 0 ? (
                      <LineChart data={selectedDriverTrips}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Distance" stroke="#8884d8" activeDot={{ r: 8 }}/>
                      </LineChart>
                    ) : (
                      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                        <Typography>No trip data to display for this driver.</Typography>
                      </Box>
                    )}
                  </ResponsiveContainer>
                </Paper>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

