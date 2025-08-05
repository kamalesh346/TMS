import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Pagination,
} from "@mui/material";
import axios from "axios";
import AddUserModal from "../components/AddUserModal";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5; // users per page

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Fetch all users (no pagination in query)
      const res = await axios.get(`/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data); // ✅ Directly store full list
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refetch after delete
    } catch (err) {
      console.error("Delete user failed", err);
      alert("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Slice users based on current page
  const paginatedUsers = users.slice((page - 1) * limit, page * limit);
  const pageCount = Math.ceil(users.length / limit);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Manage Users</Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Add User
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {users.length === 0 ? (
        <Typography color="text.secondary">No users found.</Typography>
      ) : (
        <List>
          {paginatedUsers.map((user) => (
            <ListItem
              key={user.id}
              secondaryAction={
                <Button color="error" onClick={() => handleDelete(user.id)}>
                  Delete
                </Button>
              }
            >
              <ListItemText
                primary={`${user.name} (${user.role})`}
                secondary={`Login ID: ${user.loginId} | Email: ${user.email || "N/A"}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Pagination controls */}
      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchUsers();
        }}
      />
    </Container>
  );
}
