import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    // 1. Clear all session data
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_logged_in");
    
    // 2. Close the mobile menu if open
    setIsOpen(false);

    // 3. Navigate back to the landing page
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "linear-gradient(90deg, #67a521ff, #67a521ff)",
 }}>
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
              <Link className="nav-link text-white fs-5" to="/dashboard" onClick={handleNavItemClick}>
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
          {/* Logout Button */}
          <div className="d-flex">
            <button 
              className="btn btn-outline-light fw-bold" 
              onClick={handleLogout}
              style={{ borderRadius: "20px", padding: "5px 20px" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
