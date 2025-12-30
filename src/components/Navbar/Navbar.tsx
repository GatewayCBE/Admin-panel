import React, { useState } from "react";
import { Link } from "react-router-dom";
import HomeImg from "../../assets/p1.jpg";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
<nav
  className="navbar navbar-expand-lg navbar-dark fixed-top"
  style={{
        background: "linear-gradient(90deg, #016b5f, #48a365ff)",
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
            {["Home", "About", "Games", "Admin"].map((item) => (
              <li key={item} className="nav-item">
                <Link
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="nav-link fs-5 position-relative"
                  style={{ transition: "0.3s" }}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/auth"
            className="btn fw-bold px-4"
            style={{
              backgroundColor: "#d8f3dc",
              color: "#1b4332",
              borderRadius: "20px",
            }}
          >
            Sign In | Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
