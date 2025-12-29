import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateUser() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  });

  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/api/user/create`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User created successfully");
      navigate("/users"); // back to list
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="mb-4 text-sm text-gray-600 hover:underline"
      >
        ← Back to Users
      </button>
      
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Create User</h2>

      <input
        name="firstName"
        placeholder="First Name"
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <input
        name="lastName"
        placeholder="Last Name"
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <select
        name="role"
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Create User
      </button>
    </form>
    </div>
  );
}
