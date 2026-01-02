// UserProfileModal.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById, updateUserById } from "../utils/api";


export default function UserProfileModal({ open, onClose, user, setUser }) {
  const { id: routeUserId } = useParams();
  const userId = user?._id || routeUserId;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";

  // Prefill form when modal opens
  useEffect(() => {
    if (!open || !user) return;

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "",
      profileImage: null,
    });

    if (user.profileImage) {
      setPreview(
        `${import.meta.env.VITE_BACKEND_URL}${user.profileImage}`
      );
    }
  }, [open, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({ ...form, profileImage: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!userId) {
        alert("User ID missing. Please re-login.");
        return;
      }

      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("role", form.role);

      if (form.profileImage) {
        formData.append("profileImage", form.profileImage);
      }

      const res = await updateUserById(userId, formData);
      const updatedUser = res.data.data[0];

      // Update state
      const normalizedUser = {
        ...updatedUser,
        _id: updatedUser._id || updatedUser.id,
      };

      // Update user state
      setUser(normalizedUser);

      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      console.log("ERROR:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = form.firstName?.[0] || "";
    const last = form.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  if (!open) return null;

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                  <span className="text-2xl font-semibold text-white">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>
            <label className="mt-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
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