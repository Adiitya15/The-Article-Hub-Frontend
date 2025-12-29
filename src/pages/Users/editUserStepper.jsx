import { useState } from "react";

export default function EditUserStepper({ user, onClose, onSave }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">Edit User</h2>

        {/* First Name */}
        <label className="block text-sm font-medium mb-1">First Name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Last Name */}
        <label className="block text-sm font-medium mb-1">Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Email */}
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* Role */}
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Actions */}
        <hr className="my-4 border-gray-200" />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={() =>
              onSave(user._id, {
                firstName,
                lastName,
                email,
                role,
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
