//newly created
// src/components/CreateBookingModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

const CreateBookingModal = ({ isOpen, onClose, onBookingCreated }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    pickup: '',
    delivery: '',
    itemDesc: '',
    weight: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bookings/create', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onBookingCreated(); // refresh the bookings list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="purpose"
            placeholder="Purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="pickup"
            placeholder="Pickup Location"
            value={formData.pickup}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="delivery"
            placeholder="Delivery Location"
            value={formData.delivery}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
          <textarea
            name="itemDesc"
            placeholder="Item Description"
            value={formData.itemDesc}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
