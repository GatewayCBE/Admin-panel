import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import FooterInfo from "../components/FooterInfo/FooterInfo";
import Footer from "../components/Footer/Footer";

const Layout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar fixed at top */}
      <nav className="fixed-top w-100">
        <Navbar />
      </nav>

      {/* Main content (pushes footer down) */}
      <main className="flex-grow-1 mt-5 pt-2">
        <Outlet />
      </main>

      {/* Footer Info + Footer */}
      <div className="bg-dark text-white">
        <FooterInfo />
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
