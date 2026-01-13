import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoImg from "../../assets/LogoImg.png";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

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

        {/* MOBILE + DESKTOP MENU */}
        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          style={{
            backgroundColor: isOpen ? "#67a521ff" : "transparent",
          }}
        >
          <ul className="navbar-nav mx-auto text-center text-lg-start">
            {["HOME", "ABOUT", "GAMES", "ADMIN"].map((item) => (
              <li key={item} className="nav-item">
                <Link
                  to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                  className="nav-link fw-bold py-2"
                  onClick={closeMenu}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          {/* AUTH BUTTON */}
          <div className="text-center pb-3 pb-lg-0">
            <Link
              to="/auth"
              className="btn fw-bold px-4"
              onClick={closeMenu}
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
      </div>
    </nav>
  );
};

export default Navbar;
