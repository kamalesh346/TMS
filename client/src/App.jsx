import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import DashboardRedirect from "./pages/DashboardRedirect";
import Navbar from "./components/Navbar";
import Bookings from "./pages/Bookings";
import AdminPanel from "./pages/AdminPanel";
import DriverTrips from "./pages/DriverTrips";
import ProtectedRoute from "./components/ProtectedRoute"; 
import TripAssignmentPage from "./pages/TripAssignmentPage";
import ManageUsers from "./pages/ManageUsers";
import Dashboard from "./pages/Dashboard";   // ✅ Admin hub
import DriversPage from "./pages/DriversPage";
import FuelPage from "./pages/FuelPage";
import VehiclesPage from "./pages/VehiclesPage";

function Layout() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // ✅ Improved navbar hide logic
  const hideNavbarRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {token && !shouldHideNavbar && <Navbar />}
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Role-based entry point */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect /> {/* ✅ routes to /admin, /bookings, /driver */}
            </ProtectedRoute>
          }
        />

        {/* AdminPanel (admin lands here first) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Hub (accessible from AdminPanel button) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Sub Dashboards */}
        <Route
          path="/admin/dashboard/drivers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DriversPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/fuel"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FuelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/vehicles"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <VehiclesPage />
            </ProtectedRoute>
          }
        />

        {/* Booker-only Routes */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={["booker"]}>
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/* Assign-trip */}
        <Route
          path="/assign-trip"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TripAssignmentPage />
            </ProtectedRoute>
          }
        />

        {/* Driver-only Route */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverTrips />
            </ProtectedRoute>
          }
        />

        {/* Manage Users */}
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        {/* Change Password */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}