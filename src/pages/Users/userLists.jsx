import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import EditUserStepper from "./editUserStepper";
import axiosInstance from "../../utils/axios.interceptor";

const LIMIT = 15;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Refs for intersection observer
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  /* ================= FETCH USERS ================= */

  const fetchUsers = useCallback(async (pageNum) => {
    if (loading) return;

    try {
      setLoading(true);

      const { data } = await axiosInstance.get(
        `/user/all?page=${pageNum}&limit=${LIMIT}`
      );

      const newUsers = data?.data || [];

      setUsers(prev => {
        // Prevent duplicates
        const existingIds = new Set(prev.map(u => u._id));
        const uniqueNewUsers = newUsers.filter(u => !existingIds.has(u._id));
        return [...prev, ...uniqueNewUsers];
      });

      if (newUsers.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    fetchUsers(1);
  }, []);

  /* ================= INTERSECTION OBSERVER ================= */

  useEffect(() => {
    if (loading || !hasMore) return;

    const options = {
      root: document.getElementById("users-scroll-container"),
      rootMargin: "100px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchUsers(nextPage);
          return nextPage;
        });
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, fetchUsers]);

  /* ================= RESET AFTER CRUD ================= */

  const resetAndReload = () => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    fetchUsers(1);
  };

  /* ================= CREATE ================= */

  const handleCreateUser = async (_, data) => {
    try {
      await axiosInstance.post(`user/create`, data);
      toast.success("User created successfully");
      resetAndReload();
      return true;
    } catch {
      toast.error("Failed to create user");
      return false;
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdateUser = async (id, data) => {
    try {
      await axiosInstance.put(`user/${id}`, data);
      toast.success("User updated successfully");
      resetAndReload();
      return true;
    } catch {
      toast.error("Failed to update user");
      return false;
    }
  };

  /* ================= TOGGLE STATUS ================= */

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await axiosInstance.patch(`user/status/${userId}`);
      toast.success(data.message || "User status updated");
      resetAndReload();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update status"
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axiosInstance.delete(`user/${id}`);
      toast.success("User deleted");
      resetAndReload();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  /* ================= UI ================= */

  return (
    <section>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          + Create User
        </button>
      </div>

      {/* TABLE CONTAINER (SCROLLABLE) */}
      <div
        id="users-scroll-container"
        className="bg-white rounded-lg shadow overflow-y-auto"
        style={{ maxHeight: "500px" }}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4">{user.email}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.status === "active"}
                      onChange={() => handleToggleStatus(user._id)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    <span className="ml-3 text-sm">
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </label>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEditModal(true);
                    }}
                    className="mr-3 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* INTERSECTION OBSERVER TARGET */}
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="h-20 flex items-center justify-center"
          >
            {loading && (
              <div className="text-gray-500">Loading more users...</div>
            )}
          </div>
        )}

        {/* END INDICATOR */}
        {!hasMore && users.length > 0 && (
          <div className="p-4 text-center text-gray-400">
            No more users
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && users.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No users found
          </div>
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