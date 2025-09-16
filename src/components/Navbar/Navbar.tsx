import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#2d6a4f" }}>
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          BookMyTurf
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/games">Games</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/dashboard">Admin</Link>
            </li>
          </ul>

          {/* Sign In / Sign Up button */}
          <div className="d-flex">
            <Link
              to="/login"
              className="btn fw-bold"
              style={{ backgroundColor: "#d8f3dc", color: "#2d6a4f" }}
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
