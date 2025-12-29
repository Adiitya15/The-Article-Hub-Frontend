import { NavLink } from "react-router-dom";
import { MdClose } from "react-icons/md";

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 
          h-[calc(100vh-4rem)] md:h-auto
          w-64 bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 z-50
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Admin Menu</span>
          
          {/* Close button (mobile) */}
          <button
            className="md:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setOpen(false)}
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 py-4 space-y-1">
          <NavLink
            to="/articles"
            onClick={() => setOpen(false)}
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
            onClick={() => setOpen(false)}
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
    </>
  );
}
