import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top shadow"
     style={{
                background: "linear-gradient(90deg, #2d6a4f, #2d6a4f)",

  }}
    >
      <div className="container">
           <Link
                 className="navbar-brand fw-bold"
                 to="/"
                 style={{
                   fontSize: "1.8rem",
                   letterSpacing: "1px",
                   textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                 }}
               >
                 <span style={{ color: "#14012bff" }}>Book </span>
                 <span style={{ color: "#27ac3dff" }}>Your Turf</span>
               </Link>

        <button
          className="navbar-toggler"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-4">
            <Link className="nav-link fs-5" to="/">Home</Link>
            <Link className="nav-link fs-5" to="/ugames">Games</Link>
            <Link className="nav-link fs-5" to="/user/turfs">Venues</Link>
          </ul>

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
    </nav>
  );
};

export default Navbar;
