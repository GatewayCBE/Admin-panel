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
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{
          backgroundColor: "#67a521ff",
                 height: "70px",
  
        }}
      >
      <div className="container">
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

        <button
          className="navbar-toggler"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-4">
            <Link className="nav-link text-white fs-5" to="/">Home</Link>
            <Link className="nav-link text-white fs-5" to="/ugames">Games</Link>
            <Link className="nav-link text-white fs-5" to="/user/turfs">Venues</Link>
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
