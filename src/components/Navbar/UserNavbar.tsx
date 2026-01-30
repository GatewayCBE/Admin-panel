import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import LogoImg from "../../assets/LogoImg.png";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top shadow-sm"
      style={{
        backgroundColor: "#67a521ff",
       height: "70px",
        padding: "0.5rem 0",
      }}
    >
      <div className="container px-3 px-lg-4 h-100">

        {/* LOGO */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center p-0"
          onClick={closeMenu}
          style={{ height: "100%" }}
        >
          <img
            src={LogoImg}
            alt="BookYourTurf Logo"
            className="img-fluid"
            style={{
              height: "80px",
              objectFit: "contain",
            }}
          />
        </Link>

        {/* TOGGLER */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENU */}
        <div 
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          style={{
            position: "absolute",
            top: "80px",
            left: "0",
            right: "0",
            backgroundColor: "#fff",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "0 0 10px 10px",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          
          {/* CENTER LINKS */}
          <ul className="navbar-nav mx-auto text-center text-lg-start gap-lg-3 mb-0">
            <li className="nav-item">
              <Link 
                className="nav-link fs-6 fw-bold d-lg-inline-block" 
                style={{ color: "#333" }}
                to="/" 
                onClick={closeMenu}
              >
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link fs-6 fw-bold d-lg-inline-block" 
                style={{ color: "#333" }}
                to="/ugames" 
                onClick={closeMenu}
              >
                GAMES
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link fs-6 fw-bold d-lg-inline-block" 
                style={{ color: "#333" }}
                to="/user/turfs" 
                onClick={closeMenu}
              >
                VENUES
              </Link>
            </li>
              <li className="nav-item">
              <Link 
                className="nav-link fs-6 fw-bold d-lg-inline-block" 
                style={{ color: "#333" }}
                to="/user/bookinghistory" 
                onClick={closeMenu}
              >
                BOOKING HISTORY
              </Link>
            </li>
          </ul>

          {/* RIGHT SIDE */}
          <div className="d-lg-flex align-items-center text-center mt-3 mt-lg-0">
              <Link 
                className="nav-link fs-6 fw-bold d-lg-inline-block me-4" 
                style={{ color: "#333" }}
                to="/user/profile" 
                onClick={closeMenu}
              >
                PROFILE
              </Link>
            <button
              className="btn fw-bold px-4 py-2"
              style={{
                backgroundColor: "#e63946",
                color: "#fff",
                borderRadius: "20px",
                transition: "0.3s",
                fontSize: "0.95rem",
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#d62839";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#e63946";
              }}
            >
              Logout
            </button>

          </div>

        </div>
      </div>
      
      {/* Custom CSS for mobile menu */}
      <style>{`
        @media (max-width: 991.98px) {
          .navbar-collapse {
            position: absolute !important;
            top: 80px !important;
            left: 0 !important;
            right: 0 !important;
            background-color: #67a521!important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            border-radius: 0 0 10px 10px !important;
            padding: 1.5rem 1rem !important;
            z-index: 1000 !important;
          }
          
          .navbar-collapse .nav-link {
            color: #333 !important;
            padding: 0.75rem 0 !important;
          }
          
          .navbar-collapse .nav-link:hover {
            color: #67a521ff !important;
          }
          
          .navbar-collapse .nav-item:last-child .nav-link {
            border-bottom: none;
          }
        }
        
        @media (min-width: 992px) {
          .navbar-collapse {
            position: relative !important;
            top: auto !important;
            background-color: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          
          .navbar-collapse .nav-link {
            color: #fff !important;
            padding: 0.5rem 0 !important;
            border-bottom: none !important;
          }
          
          .navbar-collapse .nav-link:hover {
            color: #f0f0f0 !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;