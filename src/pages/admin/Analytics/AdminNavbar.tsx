import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoImg from "../../../assets/LogoImg.png";

const AdminNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_logged_in");
    localStorage.clear();
  sessionStorage.clear();
    setIsOpen(false);
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
      <div className="container px-3 px-lg-4">

        {/* LOGO */}
        <Link to="/" className="navbar-brand d-flex align-items-center" onClick={closeMenu}>
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
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENU */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          
          {/* CENTER LINKS */}
          <ul className="navbar-nav mx-auto text-center text-lg-start gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link text-white fs-6 fw-bold" to="/" onClick={closeMenu}>
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-6 fw-bold" to="/dashboard" onClick={closeMenu}>
                
                DASHBOARD
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white fs-6 fw-bold" to="/admin/userbookings" onClick={closeMenu}>
                BOOKINGS
              </Link>
            </li>
          </ul>

          {/* RIGHT SIDE LOGOUT */}
          <div className="d-lg-flex align-items-center text-center mt-3 mt-lg-0">
            <button
              className="btn fw-bold px-4"
              style={{
                backgroundColor: "#e63946",
                color: "#fff",
                borderRadius: "20px",
                transition: "0.3s",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

        </div>
      </div>
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

export default AdminNavbar;
