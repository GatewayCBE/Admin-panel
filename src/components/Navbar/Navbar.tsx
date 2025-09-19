import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle navbar
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Close navbar when link clicked
  const handleNavItemClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#2d6a4f" }}>
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand fw-bold" to="/" onClick={handleNavItemClick}>
          BookMyTurf
        </Link>

        {/* Toggler for mobile */}
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

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/" onClick={handleNavItemClick}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/about" onClick={handleNavItemClick}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/games" onClick={handleNavItemClick}>
                Games
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/dashboard" onClick={handleNavItemClick}>
                Admin
              </Link>
            </li>
          </ul>

          {/* Sign In / Sign Up button */}
          <div className="d-flex">
            <Link
              to="/login"
              className="btn fw-bold"
              style={{ backgroundColor: "#d8f3dc", color: "#2d6a4f" }}
              onClick={handleNavItemClick}
            >
              Sign In | Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
