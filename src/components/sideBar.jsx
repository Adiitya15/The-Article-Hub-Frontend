import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      className="
        fixed top-[65px] left-0
        h-[calc(100vh-65px)] w-64
        bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
      "
    >
      {/* Header */}
      <div className="px-4 py-4 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          Admin Menu
        </span>
      </div>

      {/* Nav */}
      <nav className="px-2 py-4 space-y-1">
        <NavLink
          to="/articles"
          className={({ isActive }) =>
            `block w-full rounded transition ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <span className="block px-4 py-2.5">Articles</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `block w-full rounded transition ${
              isActive
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <span className="block px-4 py-2.5">Users</span>
        </NavLink>
      </nav>
    </aside>
  );
}
