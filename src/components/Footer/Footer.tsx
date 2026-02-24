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
<div className="container d-flex justify-content-between align-items-center flex-wrap">          {/* Left: Copyright */}
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
  <span
    role="button"
    data-bs-toggle="modal"
    data-bs-target="#termsModal"
    style={{ cursor: "pointer" ,fontSize:'12px'}}
  >
    Terms & Conditions
  </span>

  {" | "}
  <span
    role="button"
    data-bs-toggle="modal"
    data-bs-target="#privacyModal"
    style={{ cursor: "pointer",fontSize:'12px' }}
  >
    Privacy Policy
  </span>
</p>

{/* Privacy Policy Modal */}
<div
  className="modal fade"
  id="privacyModal"
  tabIndex={-1}
>
  <div className="modal-dialog modal-lg modal-dialog-scrollable">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Privacy Policy</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
        ></button>
      </div>

 <div className="modal-body">
        <p>
         BookYourTurf is a complete digital solution created to simplify turf management and player booking. Whether it’s football, cricket, badminton, or any sports arena, BookYourTurf gives users a seamless experience with real-time slot availability, instant booking confirmation, secure online payments, and automated notifications. 
        </p>

        <p>
          For turf owners, the platform eliminates manual work by automating schedules, payments, daily reports, customer reminders, and revenue tracking. 
        </p>

        <p>
        It reduces no-shows, increases bookings, and boosts profitability — all from one simple dashboard. With BookYourTurf, players enjoy a smooth, one-click booking experience.
        </p>
        <p>
         Turf owners enjoy stress-free management. Smart booking for smart players. Simple management for smart owners.
        </p>
         <p>
          BookYourTurf is a smart and modern sports booking app designed for players,
          teams, and sports enthusiasts who want quick, easy, and reliable access
          to nearby sports venues.
        </p>

        <p>
          The app helps you discover sports courts, grounds, turfs, and arenas
          around you — whether you're playing Football, Box Cricket, Badminton,
          Futsal, or Swimming.
        </p>

        <p>
          With seamless payment integration and instant confirmation,
          BookYourTurf ensures a fast, convenient, and hassle-free booking experience.
        </p>

        <ul>
          <li>Google Pay (GPay)</li>
          <li>PhonePe</li>
          <li>UPI QR Codes</li>
          <li>Debit/Credit Cards</li>
        </ul>

        <p>
          We ensure that your personal information is secure and never shared
          without your consent.
        </p>
      </div>
       
    </div>
  </div>
</div>

{/* Terms & Conditions Modal */}
<div
  className="modal fade"
  id="termsModal"
  tabIndex={-1}
>
  <div className="modal-dialog modal-lg modal-dialog-scrollable">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Terms & Conditions</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
        ></button>
      </div>

      <div className="modal-body">

        <p>
          Welcome to <strong>Book Your Turf</strong>, the online platform that helps you easily book your sports venues for Box Cricket, Football, Badminton & more.
        </p>

        <p>
          By accessing or using this platform, you agree to the following Terms & Conditions.
        </p>

        <h6 className="fw-bold mt-4">1. Booking Policy</h6>
        <ul>
          <li>Users can book available slots for sports listed on the Book Your Turf platform.</li>
          <li>Bookings are confirmed based on advance / full payment.</li>
          <li>Each booking is valid only for the selected time slot & date mentioned at the time of booking.</li>
          <li>Users must arrive 10–15 minutes before the booked slot time to avoid delays.</li>
          <li>Playtime starts and ends as per the allotted schedule. Delays cannot be adjusted.</li>
          <li>User made bookings only for sports activities.</li>
          <li>Other activities are subject to venue partner discretion.</li>
        </ul>

        <h6 className="fw-bold mt-4">2. Payment Terms</h6>
        <ul>
          <li>All payments must be made through the secure payment gateway integrated into Book Your Turf.</li>
          <li>Prices displayed include applicable taxes and convenience charges unless stated otherwise.</li>
          <li>The Company or Partner is not responsible for failed payments caused by network/payment gateway issues.</li>
        </ul>

        <h6 className="fw-bold mt-4">3. Cancellation & Refund Policy</h6>
        <ul>
          <li><strong>User Cancellations:</strong></li>
          <li>Cancellation allowed up to 6 hours before the slot start time. Refunds will be processed after deducting 5% cancellation charges.</li>
          <li>No refund for cancellations made after this window or for no-shows.</li>
          <li>Refunds will be processed within 7–10 business days to the original payment method.</li>
        </ul>

        <h6 className="fw-bold mt-4">4. User Responsibilities</h6>
        <ul>
          <li>Users must follow all sports venue rules including dress code, footwear, safety measures, etc.</li>
          <li>Users must not damage venue property such as nets, lights, grass, mats, or equipment. Any damage will be charged.</li>
          <li>Alcohol, smoking, or abusive behavior is strictly prohibited.</li>
        </ul>

        <h6 className="fw-bold mt-4">5. Liability Disclaimer</h6>
        <ul>
          <li>Book Your Turf acts as an online booking platform between users and sports venue owners.</li>
          <li>The Company is not liable for injuries, accidents, or damages occurring at the venue.</li>
          <li>Venue management is solely responsible for on-ground safety, lighting, maintenance, and first aid.</li>
        </ul>

        <h6 className="fw-bold mt-4">6. Prohibited Activities</h6>
        <ul>
          <li>Misuse the platform or make fake bookings.</li>
          <li>Create multiple accounts to misuse offers.</li>
          <li>Use the venue for unlawful, illegal, or unsanctioned activities.</li>
        </ul>

        <h6 className="fw-bold mt-4">7. Data & Privacy</h6>
        <ul>
          <li>User information (name, contact, email, booking details) will be used only for booking and communication purposes.</li>
          <li>Book Your Turf follows standard data privacy and security practices.</li>
          <li>User data will not be sold or shared with third parties without consent.</li>
        </ul>

        <h6 className="fw-bold mt-4">8. Platform Rights</h6>
        <ul>
          <li>Book Your Turf reserves the right to modify prices, offers, or venue listings without prior notice.</li>
          <li>The Company may suspend or block user accounts involved in fraudulent or inappropriate activity.</li>
        </ul>

        <h6 className="fw-bold mt-4">9. Acceptance</h6>
        <p>
          By clicking <strong>Book Now</strong> on Book Your Turf, you confirm that you have read, understood, and accepted these Terms & Conditions.
        </p>

        <hr />

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
        <p className="fst-italic">
          Owner of Book Your Turf
        </p>

      </div>
    </div>
  </div>
</div>
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