import { useState } from "react";
import UserProfileModal from "../components/profileModel";
import BackButton from "../components/backButton";

export default function Profile() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const getInitials = () => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  const profileImageUrl = user?.profileImage
    ? `${import.meta.env.VITE_BACKEND_URL}${user.profileImage}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackButton/>
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-6">
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="
   w-20 h-20 rounded-full
    flex items-center justify-center
    border border-gray-300 dark:border-gray-600
    bg-cyan-600 dark:bg-gray-900
    text-3xl font-semibold
    text-white dark:text-gray-100
    hover:bg-cyan-700 dark:hover:bg-gray-800
    transition-all
  ">
                
                  {getInitials()}
                
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1.5
  rounded
  border border-gray-300 dark:border-gray-600
  bg-cyan-600 dark:bg-gray-900
  text-sm font-medium
  text-white dark:text-gray-100
  hover:bg-cyan-700 dark:hover:bg-gray-800
  transition-all"
            >
              Edit Profile
            </button>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-white">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal
        open={open}
        onClose={() => setOpen(false)}
        user={user}
        setUser={setUser}
      />
    </div>
  );
}