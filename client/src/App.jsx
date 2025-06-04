// // App.jsx
// import React from "react";
// import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Navbar from "./components/Navbar";

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem("token");
//   return token ? children : <Navigate to="/login" replace />;
// }

// function Layout() {
//   const token = localStorage.getItem("token");
//   const location = useLocation();
//   const hideNavbarRoutes = ["/login", "/register"];
//   const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

//   return (
//     <>
//       {token && !shouldHideNavbar && <Navbar />}
//       <Outlet />
//     </>
//   );
// }

// export default function App() {
//   return (
//     <Routes>
//       <Route element={<Layout />}>
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Route>
//     </Routes>
//   );
// }
import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking";
import AdminPanel from "./pages/AdminPanel";
import DriverTrips from "./pages/DriverTrips";
import ProtectedRoute from "./components/ProtectedRoute"; // ⬅️ Make sure it's imported

function Layout() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

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

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
        <Route
          path="/create-booking"
          element={
            <ProtectedRoute allowedRoles={["booker"]}>
              <CreateBooking />
            </ProtectedRoute>
          }
        />

        {/* Admin-only Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
