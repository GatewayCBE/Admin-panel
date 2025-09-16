import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";


const FooterInfo: React.FC = () => {
  return (
    <div className="container-fluid bg-success text-white py-5">
      <div className="row">
        
        {/* About Us */}
        <div className="col-md-3 mb-4">
          <h5 className="fw-bold">About Us</h5>
          <hr className="border-light w-50" />
          <p>
            BookMyTurf helps you book and manage turf grounds with ease.  
            A seamless platform for users and owners.
          </p>
        </div>

        {/* Quick Links */}
        <div className="col-md-3 mb-4">
          <h5 className="fw-bold">Quick Links</h5>
          <hr className="border-light w-50" />
          <ul className="list-unstyled">
            <li><a href="/" className="text-white">Home</a></li>
            <li><a href="/about" className="text-white">About Us</a></li>
            <li><a href="/dashboard" className="text-white">Admin Panel</a></li>
            <li><a href="/login" className="text-white">Sign In | Sign Up</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="col-md-3 mb-4">
          <h5 className="fw-bold">Contact Us</h5>
          <hr className="border-light w-50" />
          <p>Email: support@bookmyturf.com</p>
          <p>Phone: +91 12345 67890</p>
          <p>Location: Chennai, Tamil Nadu</p>
        </div>

        {/* Newsletter */}
        <div className="col-md-3 mb-4">
          <h5 className="fw-bold">Newsletter</h5>
          <hr className="border-light w-50" />
          <p>Subscribe to get the latest updates.</p>
          <form className="d-flex">
            <input
              type="email"
              className="form-control me-2"
              placeholder="Enter your email"
            />
            <button type="submit" className="btn btn-success" style={{backgroundColor:"rgb(2, 97, 57)"}}>
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FooterInfo;
