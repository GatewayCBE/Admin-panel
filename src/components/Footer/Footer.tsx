import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <>
      {/* Bottom Footer */}
      <footer
        className="container-fluid text-white py-2"
        style={{ backgroundColor: "#1b4332" }}
      >
        <div className="container d-flex justify-content-between align-items-center flex-wrap">
          {/* Left: Copyright */}
          <p className="mb-0">
            © {new Date().getFullYear()}{" "}
            <span
              style={{
                fontFamily: "BalloonFont",
                fontStyle: "italic",
                fontSize: "15px",
                fontWeight: "bold",
              }}
            >
              NOTTAM INFOTECH PRIVATE LIMITED
            </span>
            <span> All rights reserved.</span>

            {" | "}
            <Link
              to="/terms"
              className="text-white text-decoration-none"
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Terms & Conditions
            </Link>

            {" | "}
            <Link
              to="/privacy"
              className="text-white text-decoration-none"
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Privacy Policy
            </Link>
          </p>

          {/* Right: Social Icons */}
          <div className="d-flex gap-3">
            <a
              href="https://www.facebook.com/share/14UcTjyHTqS/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-3"
            >
              <i className="fab fa-facebook"></i>
            </a>
            {/* <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-5"
            >
              <i className="fab fa-twitter"></i>
            </a> */}
            <a
              href="https://www.instagram.com/book_your_turf?igsh=MW96d2c4bjh6Y3E3dw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-3"
            >
              <i className="fab fa-instagram"></i>
            </a>
            {/* <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-5"
            >
              <i className="fab fa-linkedin"></i>
            </a> */}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;