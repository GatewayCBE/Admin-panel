import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoImg from "../../assets/LogoImg.png";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top"
      style={{
        background: "linear-gradient(90deg, #67a521ff, #67a521ff)",
        height: "70px",
        padding: "0",
      }}
    >
      <div className="container h-100">
        <Link to="/" className="navbar-brand d-flex align-items-center" style={{ position: "relative", zIndex: 10 }}>
          <img 
            src={LogoImg} 
            alt="BookYourTurf Logo" 
            style={{
              height: "100px",
              width: "auto",
              objectFit: "contain",
              marginTop: "-20px",
              marginBottom: "-20px",
            }}
          />
        </Link>

        <button
          className="navbar-toggler"
          onClick={() => setIsOpen(!isOpen)}
          style={{ zIndex: 10 }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} style={{ height: "100%" }}>
          <ul className="navbar-nav mx-auto gap-4 align-items-center h-100">
            {["HOME", "ABOUT", "GAMES", "ADMIN"].map((item) => (
              <li key={item} className="nav-item fw-bold text-white d-flex align-items-center">
                <Link
                  to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                  className="nav-link fs-6 position-relative"
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
              backgroundColor: "#64b617ff",
              color: "white",
              borderRadius: "20px",
            }}
          >
            SIGN IN | SIGN UP
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;