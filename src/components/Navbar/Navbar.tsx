import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <h1 className="navbar-logo">BookMyTurf</h1>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/about" className="navbar-link">About</Link>
        <Link to="/games" className="navbar-link">Games</Link>
        <Link to="/dashboard" className="navbar-link">Admin</Link>
      </div>
      <div className="navbar-login">
        <Link to="/login" className="navbar-button">Sign In | Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
