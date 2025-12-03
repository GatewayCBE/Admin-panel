import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavItemClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#2d6a4f" }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/" onClick={handleNavItemClick}>
          BookYourTurf
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          onClick={handleToggle}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/" onClick={handleNavItemClick}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/admin/reports/*" onClick={handleNavItemClick}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/admin/recentbookings" onClick={handleNavItemClick}>
                Bookings
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/admin/turfs" onClick={handleNavItemClick}>
                Turfs
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/admin/users" onClick={handleNavItemClick}>
                Users
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
