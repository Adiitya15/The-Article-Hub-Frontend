import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./navBar";
import Footer from "./footer";
import Sidebar from "./sideBar";

export default function ArticlesLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* NAVBAR - FULL WIDTH AT TOP */}
      <Navbar 
  showMenu={isAdmin}
  onMenuClick={() => setSidebarOpen(prev => !prev)}
/>

      {/* SIDEBAR + CONTENT BELOW NAVBAR */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        {isAdmin && (
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 px-6 py-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
