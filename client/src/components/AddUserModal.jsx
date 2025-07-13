import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from "@mui/material";
import axios from "axios";

const AddUserModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    loginId: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/auth/register", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      setForm({ name: "", role: "", loginId: "", password: "" }); // reset fields
    } catch (err) {
      console.error("Registration failed", err);
      alert(err?.response?.data?.message || "Failed to register user");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          name="name"
          fullWidth
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Role"
          name="role"
          select
          fullWidth
          value={form.role}
          onChange={handleChange}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="booker">Booker</MenuItem>
          <MenuItem value="driver">Driver</MenuItem>
        </TextField>
        <TextField
          margin="dense"
          label="Login ID (email/code)"
          name="loginId"
          fullWidth
          value={form.loginId}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Password"
          name="password"
          type="password"
          fullWidth
          value={form.password}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Register</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
