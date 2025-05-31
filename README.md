# 🚚 Transport Management System (TMS)

A full-stack role-based web application to manage company vehicle bookings, assignments, and transport utilization.

---

## 📌 Project Overview

This system allows:
- Department users (Bookers) to request vehicle bookings.
- Admins to approve/reject/manage bookings.
- Drivers to view assigned trips and update trip statuses.

The goal is to improve efficiency and prevent misuse of company transport resources.

---

## ✅ Completed Milestones

### 🧠 Backend (Server)
- ✅ **Role-Based Authentication**
  - Roles: `Admin`, `Driver`, `Booker`
  - JWT-based login and protected routes
- ✅ **User Registration/Login**
  - Secure password hashing using bcrypt
- ✅ **Booking System**
  - Bookers can create bookings with details (date, location, purpose, etc.)
  - Admins can view, approve/reject, and filter bookings
  - Bookers can cancel *pending* bookings
- ✅ **Driver Flow**
  - Drivers can view assigned trips
  - Update loading/unloading/start/end times
- ✅ **Email Notifications**
  - On booking creation, status updates, and cancellations
- ✅ **Error Handling & Validation**
  - Input validation and clean error responses
- ✅ **Project Structure**
  - Modular Express + Prisma backend with `.env` support

---

### 🎨 Frontend (Client)
- ✅ **React Project Setup**
  - Vite for fast builds and hot reload
- ✅ **Installed Core Dependencies**
  - `react-router-dom`, `axios`, `react-icons`, etc.
- ✅ **Tailwind CSS Setup**
  - Tailwind + PostCSS + Autoprefixer
  - Fixed Tailwind CLI issues with manual config
- ✅ **React App Folder Structure**
