import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Navbar({ showMenu = false, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="w-full px-4 h-16 flex justify-between items-center">
       {/* Left - Admin menu + App Name */}
<div className="flex items-center gap-3">
  {showMenu && (
   <button
    onClick={onMenuClick}
    className="md:hidden text-2xl text-gray-700 dark:text-gray-200 hover:text-blue-600"
    aria-label="Open admin sidebar"
  >
    ☰
  </button>
  )}

  <button
    onClick={() => navigate("/articles")}
    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
  >
    The Articles Hub
  </button>
</div>


        {/* Right - User Name + Profile Icon */}
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          {user && (
            <span className="text-gray-800 dark:text-gray-300 font-medium text-base">
              {user.firstName} {user.lastName}
            </span>
          )}

          {/* Profile Icon (Dropdown Trigger) */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {/* Dropdown BELOW the trigger */}
          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg ring-1 ring-black/5 z-50"
              role="menu"
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/drafts");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                  >
                    Drafts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
