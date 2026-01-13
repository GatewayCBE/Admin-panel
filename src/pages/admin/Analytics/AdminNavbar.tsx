import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoImg from "../../../assets/LogoImg.png";

const AdminNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

 
   const closeMenu = () => setIsOpen(false);

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
     <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{
          backgroundColor: "#67a521ff",
                 height: "70px",
  
        }}
      >
        <div className="container ">
  
          {/* LOGO */}
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center"
            onClick={closeMenu}
          >
            <img
                src={LogoImg} 
              alt="BookYourTurf Logo" 
              style={{
                height: "100px",
                width: "auto",
                objectFit: "contain",
                marginTop: "-25px",
                marginBottom: "-20px",
              }}
            />
          </Link>
  
          {/* TOGGLER */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
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
            className="btn fw-bold px-4"
            style={{
              backgroundColor: "#e63946",
              color: "#fff",
              borderRadius: "20px",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
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

export default AdminNavbar;
