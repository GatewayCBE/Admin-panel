import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import FooterInfo from "../components/FooterInfo/FooterInfo";
import Footer from "../components/Footer/Footer";
import UserNavbar from "../components/Navbar/UserNavbar";
import OwnerNavbar from "../components/Navbar/OwnerNavbar";
import AdminNavbar from "../pages/admin/Analytics/AdminNavbar";
// import AdminSidebar from "../components/Admin/AdminSidebar"; // optional


/* -----------------------------------
   🌍 PUBLIC LAYOUT (Navbar + Footer)
--------------------------------------*/
export const PublicLayout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="fixed-top w-100">
        <Navbar />
      </nav>

      <main className="flex-grow-1 mt-5 pt-2">
        <Outlet />
      </main>

      <footer className="bg-dark text-white">
        <FooterInfo />
        <Footer />
      </footer>
    </div>
  );
};


/* -----------------------------------
   👤 USER LAYOUT (User Navbar only)
--------------------------------------*/
export const UserLayout: React.FC = () => {
  return (
    <div>
      <UserNavbar/>
      <main>
        <Outlet />
      </main>
        <footer className="bg-dark text-white">
        <FooterInfo />
        <Footer />
      </footer>
    </div>
  );
};

export const OwnerLayout: React.FC = () => {
  return (
    <div>
      <OwnerNavbar/>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

/* -----------------------------------
   🛠 ADMIN LAYOUT (Admin panel style)
--------------------------------------*/
export const AdminLayout: React.FC = () => {
  return (
    <div className="d-flex">
<AdminNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};
