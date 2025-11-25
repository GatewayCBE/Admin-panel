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
      </aside>

      <nav className="admin-navbar d-none d-lg-flex align-items-center px-4 py-2 shadow-sm" style={{ backgroundColor: "#2d6a4f" }}>
  <Link className="navbar-brand text-white fw-bold" to="/">BookYourTurf</Link>

  <ul className="nav ms-4">
    <li className="nav-item"><Link className="nav-link text-white" to="/admin/analytics">Dashboard</Link></li>
    <li className="nav-item"><Link className="nav-link text-white" to="/admin/recentbookings">Bookings</Link></li>
    <li className="nav-item"><Link className="nav-link text-white" to="/dashboard/turfs">Turfs</Link></li>
    <li className="nav-item"><Link className="nav-link text-white" to="/dashboard/owners">Users</Link></li>
  </ul>
</nav>

      {/* Styles */}
      <style>{`
        .admin-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 65px;
  z-index: 1050;
}

@media (max-width: 991px) {
  .admin-navbar {
    display: none;
  }
}
      `}</style>
    </>
  );
};

export default AdminSidebar;