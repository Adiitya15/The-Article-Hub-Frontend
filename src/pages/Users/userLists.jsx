import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import EditUserStepper from "./editUserStepper";
import axiosInstance from "../../utils/axios.interceptor";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get(`/user/all`);

      setUsers(data?.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CREATE ---------------- */
  const handleCreateUser = async (_, data) => {
    try {

      await axiosInstance.post(
        `user/create`,
        data,
      );

      toast.success("User created successfully");
      fetchUsers();
      return true;
    } catch {
      toast.error("Failed to create user");
      return false;
    }
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdateUser = async (id, data) => {
    try {

      await axiosInstance.put(
        `user/${id}`,
        data
      );

      toast.success("User updated successfully");
      fetchUsers();
      return true;
    } catch {
      toast.error("Failed to update user");
      return false;
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {

      await axiosInstance.delete(`user/${id}`)

      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-gray-200 rounded"
        >
          + Create User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4">Loading users...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-6 py-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="mr-2 text-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600"
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <EditUserStepper
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedUser && (
        <EditUserStepper
          mode="edit"
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
        />
      )}
    </section>
  );
}
