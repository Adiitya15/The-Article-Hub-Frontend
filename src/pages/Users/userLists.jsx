import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import EditUserStepper from "./editUserStepper";
import { confirmDelete, showSuccess, showError } from "../../utils/sweetAlert";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); //edit
  const [showModal, setShowModal] = useState(false); //edit

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${backendUrl}/api/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("check1>>", data);

      setUsers(data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // 5️ OPEN EDIT (ADD HERE)
  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // 6️ CLOSE EDIT (ADD HERE)
  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  // 7️ UPDATE USER (SAVE)
  const handleUpdateUser = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${backendUrl}/api/user/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User updated");
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  // 8️ DELETE USER
  const handleDelete = async (id) => {
    const result = await confirmDelete({
      title: "Delete this user?",
      text: "This action cannot be undone.",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${backendUrl}/api/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await showSuccess({
        title: "Deleted",
        text: "The user has been removed.",
      });

      fetchUsers(); // refresh list
    } catch (err) {
      console.error(err);
      await showError({
        title: "Failed",
        text: "Could not delete the user. Please try again.",
      });
    }
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
      Users
    </h1>
    <p className="text-sm text-gray-500">
      Manage platform users and permissions
    </p>

        <Link
  to="/users/create"
  className="inline-flex items-center gap-2 px-8 py-2.5 
             bg-gray-200 dark:bg-gray-700 text-black text-sm font-medium 
             rounded-lg shadow-sm
             hover:bg-gray-100 dark:hover:bg-gray-700
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
             transition"
>
  <span className="text-lg leading-none">+</span>
  Create User
</Link>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-gray-500">No users found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide w-[22%]">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide w-[38%]">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide w-[20%]">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide w-[20%]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t dark:border-gray-700">
                  {/* Name */}
                  <td className="px-6 py-4">
  <div className="font-medium text-gray-900 dark:text-white">
    {user.firstName} {user.lastName}
  </div>
</td>

                  {/* Email */}
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 break-all">
  {user.email}
</td>
                  {/* Role */}
                  <td className="px-6 py-4">
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      user.role === "admin"
        ? "bg-purple-100 text-purple-700"
        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
    }`}
  >
    {user.role}
  </span>
</td>

                 <td className="px-6 py-4">
  <div className="flex justify-end items-center gap-2">
    <button
      onClick={() => openEditModal(user)}
      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
      title="Edit user"
    >
      <FaEdit className="w-4 h-4" />
    </button>

    <button
      onClick={() => handleDelete(user._id)}
      className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
      title="Delete user"
    >
      <MdDelete className="w-4 h-4" />
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && selectedUser && (
        <EditUserStepper
          user={selectedUser}
          onClose={closeModal}
          onSave={handleUpdateUser}
        />
      )}
    </section>
  );
}
