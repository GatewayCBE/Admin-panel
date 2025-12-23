import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
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
              <Link className="nav-link text-white fs-5" to="/ugames" onClick={handleNavItemClick}>
                Games
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-5" to="/user/turfs" onClick={handleNavItemClick}>
                Venues
              </Link>
            </li>
          </ul>

          {/* Sign In / Sign Up button */}
          <div className="d-flex">
            <button
              className="btn fw-bold"
              style={{ backgroundColor: "#d8f3dc", color: "#2d6a4f" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
