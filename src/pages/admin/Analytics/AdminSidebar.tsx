import React from "react";
import { Link } from "react-router-dom";

interface Props {
  isOpen: boolean;
  closeSidebar: () => void;
}

const AdminSidebar: React.FC<Props> = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Overlay (mobile only) */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar bg-white shadow-sm border-end ${isOpen ? "open" : ""
          }`}
      >
        <div className="px-4 pb-4 pt-4 d-flex justify-content-between align-items-center d-lg-none">
          <h5 className="mb-0 fw-bold">Menu</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={closeSidebar}>
            ✖
          </button>
        </div>

        <nav className="nav flex-column px-3">
          <Link to="/admin/analytics" className="nav-link text-dark px-3 py-2 rounded">
            📊 Dashboard
          </Link>

          <Link to="/admin/bookings" className="nav-link text-dark px-3 py-2 rounded">
            📅 Bookings
          </Link>

          <Link to="/admin/turfs" className="nav-link text-dark px-3 py-2 rounded">
            🏟️ Turfs
          </Link>

          <Link to="/admin/users" className="nav-link text-dark px-3 py-2 rounded">
            👥 Users
          </Link>
        </nav>
      </aside>

      {/* Styles */}
      <style>{`
        .admin-sidebar {
          width: 400px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          padding-top: 80px;
          transition: transform 0.3s ease-in-out;
        }

        /* Desktop: always visible */
        @media (min-width: 992px) {
          .admin-sidebar {
            transform: translateX(0);
            position: sticky;
          }
        }

        /* Mobile: hidden initially */
        @media (max-width: 991px) {
          .admin-sidebar {
            transform: translateX(-100%);
            z-index: 1040;
            padding-top: 20px;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.45);
            opacity: 0; visibility: hidden;
            transition: 0.3s;
            z-index: 1030;
          }
          .sidebar-overlay.show {
            opacity: 1;
            visibility: visible;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
