import { useEffect, useState } from "react";
import axios from "axios";

/* ================================
   API HELPER (LOCAL TO MODAL)
================================ */
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: `${backendUrl}/api`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   API FUNCTIONS
================================ */
const fetchUserById = (id) => API.get(`/users/${id}`);
const updateUserById = (id, data) => API.put(`/users/${id}`, data);

/* ================================
   PROFILE MODAL
================================ */
export default function ProfileModal({ open, onClose }) {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadProfile = async () => {
      try {
        const res = await fetchUserById(loggedInUser._id);
        setForm(res.data.data);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load profile");
      }
    };

    loadProfile();
  }, [open, loggedInUser._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await updateUserById(loggedInUser._id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      });

      // keep navbar in sync
      localStorage.setItem("user", JSON.stringify(res.data.data));

      alert("Profile updated successfully");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          My Profile
        </h2>

        <div className="space-y-3">
          <input
            name="firstName"
            value={form.firstName || ""}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-3 py-2 rounded border dark:bg-gray-700"
          />

          <input
            name="lastName"
            value={form.lastName || ""}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-3 py-2 rounded border dark:bg-gray-700"
          />

          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 rounded border dark:bg-gray-700"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
