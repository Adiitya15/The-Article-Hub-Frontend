
import Navbar from "./navBar"
import { Outlet } from "react-router-dom"
import Footer from "./footer";

export default function ArticlesLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
