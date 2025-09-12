import React from "react";
import "./FooterInfo.css";

const FooterInfo: React.FC = () => {
  return (
    <div className="footer-info">
      <div className="footer-column">
        <h3>About Us</h3><hr />
        <p>
          BookMyTurf helps you book and manage turf grounds with ease.<br/>
          A seamless platform for users and owners.
        </p>
      </div>

      <div className="footer-column">
        <h3>Quick Links</h3><hr />
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/admin">Admin Panel</a></li>
          <li><a href="/login">Sign In | Sign Up</a></li>
        </ul>
      </div>

      <div className="footer-column">
        <h3>Contact Us</h3><hr />
        <p>Email: support@bookmyturf.com</p>
        <p>Phone: +91 12345 67890</p>
        <p>Location: Chennai, Tamil Nadu</p>
      </div>

      <div className="footer-column">
        <h3>Newsletter</h3> <hr />
        <p>Subscribe to get the latest updates.</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
};

export default FooterInfo;
