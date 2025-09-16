import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer: React.FC = () => {
  return (
    <>
   

      {/* Bottom Footer */}
      <footer
        className="container-fluid text-white py-2"
        style={{ backgroundColor: "#1b4332" }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          {/* Left: Copyright */}
          <p className="mb-0">
            © {new Date().getFullYear()} BookMyTurf. All rights reserved.
          </p>

          {/* Right: Social Icons */}
          <div className="d-flex gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-5"
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-5"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-5"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-5"
            >
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
