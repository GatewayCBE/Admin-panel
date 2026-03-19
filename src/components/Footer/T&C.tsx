import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

   useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="container py-5" style={{ maxWidth: "860px" }}>
      <button
        className="btn btn-sm mb-4"
        style={{ backgroundColor: "#198754", color: "#fff" }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2 className="fw-bold mb-4 text-success">
        Terms &amp; Conditions
      </h2>

      <p>
        Welcome to <strong>Book Your Turf</strong>, the online platform that
        helps you easily book your sports venues for Box Cricket, Football,
        Badminton &amp; more.
      </p>

      <p>
        By accessing or using this platform, you agree to the following Terms
        &amp; Conditions.
      </p>

      <h6 className="fw-bold mt-4">1. Booking Policy</h6>
      <ul>
        <li>Users can book available slots for sports listed on the Book Your Turf platform.</li>
        <li>Bookings are confirmed based on advance / full payment.</li>
        <li>Each booking is valid only for the selected time slot &amp; date mentioned at the time of booking.</li>
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

      <h6 className="fw-bold mt-4">3. Cancellation &amp; Refund Policy</h6>
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

      <h6 className="fw-bold mt-4">7. Data &amp; Privacy</h6>
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
        By clicking <strong>Book Now</strong> on Book Your Turf, you confirm
        that you have read, understood, and accepted these Terms &amp; Conditions.
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
      <p className="fst-italic">Owner of Book Your Turf</p>
    </div>
  );
};

export default TermsAndConditions;