import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
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
        Privacy Policy
      </h2>

      <p>
        BookYourTurf is a complete digital solution created to simplify turf
        management and player booking. Whether it's football, cricket, badminton,
        or any sports arena, BookYourTurf gives users a seamless experience with
        real-time slot availability, instant booking confirmation, secure online
        payments, and automated notifications.
      </p>

      <p>
        For turf owners, the platform eliminates manual work by automating
        schedules, payments, daily reports, customer reminders, and revenue
        tracking.
      </p>

      <p>
        It reduces no-shows, increases bookings, and boosts profitability — all
        from one simple dashboard. With BookYourTurf, players enjoy a smooth,
        one-click booking experience.
      </p>

      <p>
        Turf owners enjoy stress-free management. Smart booking for smart
        players. Simple management for smart owners.
      </p>

      <p>
        BookYourTurf is a smart and modern sports booking app designed for
        players, teams, and sports enthusiasts who want quick, easy, and reliable
        access to nearby sports venues.
      </p>

      <p>
        The app helps you discover sports courts, grounds, turfs, and arenas
        around you — whether you're playing Football, Box Cricket, Badminton,
        Futsal, or Swimming.
      </p>

      <p>
        With seamless payment integration and instant confirmation, BookYourTurf
        ensures a fast, convenient, and hassle-free booking experience.
      </p>

      <p>Supported payment methods:</p>
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
  );
};

export default PrivacyPolicy;