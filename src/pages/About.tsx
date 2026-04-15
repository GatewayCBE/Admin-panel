import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import GpayImg from "../assets/Google_Pay_Logo.svg.png";
import PhonepayImg from "../assets/PhonepeImg.png"
import AboutImg from "../assets/AboutImg.jpg";
import CardImg from "../assets/visa.png"

const About: React.FC = () => {
  return (
    <section className="py-5" style={{ backgroundColor: "#f6f6e9" }}>
      <style>
        {`
          .interactive-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }
          
          .interactive-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.6s;
          }
          
          .interactive-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
          }
          
          .interactive-card:hover::before {
            left: 100%;
          }
          
          .interactive-img {
            transition: transform 0.5s ease;
          }
          
          .interactive-card:hover .interactive-img {
            transform: scale(1.05);
          }
          
          .interactive-btn {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .interactive-btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(45, 106, 79, 0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          
          .interactive-btn:hover::after {
            width: 300px;
            height: 300px;
          }
          
          .interactive-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          }
          
          .justified-text {
            text-align: justify;
            text-justify: inter-word;
          }
          
          @media (max-width: 767px) {
            .justified-text {
              text-align: center;
            }
          }
        `}
      </style>
      <div className="container d-flex flex-column gap-5">

        <div
          className="row align-items-center shadow rounded-3 mx-2 w-100 position-relative interactive-card"
          style={{ backgroundColor: "#2d6a4f", maxWidth: "1100px" }}
        >
          {/* Image */}
          <div className="d-none d-md-flex col-md-4 justify-content-center">
            <div
              className="shadow-lg overflow-hidden position-absolute"
              style={{
                borderRadius: "15px",
                top: "-18px",
                width: "250px",
                height: "400px",
                zIndex: "2",
              }}
            >
              <img
                src={AboutImg}
                alt="About BookMyTurf "
                className="img-fluid h-100 w-100 interactive-img"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Mobile Image (stacked on top, same size) */}
          <div className="d-block d-md-none text-center mb-3">
            <div
              className="shadow-lg overflow-hidden mx-auto"
              style={{
                borderRadius: "15px",
                width: "200px",
                height: "350px",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=600&fit=crop"
                alt="About BookMyTurf"
                className="img-fluid h-100 w-100"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          {/* Text */}
          <div className="col-md-8 offset-md-4 text-md-start text-center p-4">
            <h2
              className="fw-bold mb-3"
              style={{
                color: "#f1faee",
                textTransform: "uppercase",
                fontSize: "25px",
              }}
            >
              About Us
            </h2>
            <p className="lh-lg text-light" style={{ fontSize: "14px" }}>
              BookYourTurf is a complete digital solution created to simplify turf
              management and player booking. Whether it’s football, cricket,
              badminton, or any sports arena, BookYourTurf gives users a seamless
              experience with real-time slot availability, instant booking
              confirmation, secure online payments, and automated notifications.
              For turf owners, the platform eliminates manual work by automating
              schedules, payments, daily reports, customer reminders, and revenue
              tracking. It reduces no-shows, increases bookings, and boosts
              profitability — all from one simple dashboard. With BookYourTurf,
              players enjoy a smooth, one-click booking experience. Turf owners
              enjoy stress-free management. Smart booking for smart players.
              Simple management for smart owners.
            </p>
            <button
              className="btn fw-bold shadow-sm px-4 py-2 mt-3"
              style={{
                backgroundColor: "#f6f6e9",
                color: "#2d6a4f",
                borderRadius: "8px",
              }}
            >
              Join Now
            </button>
          </div>
        </div>

        <div
          className="row align-items-center shadow rounded-3 mx-2 w-100 p-4 interactive-card"
          style={{ backgroundColor: "#2d6a4f" }}
        >
          {/* Text */}
          <div className="order-2 order-md-1 text-md-start text-center text-light">
            <h2 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "25px" }}>
              ABOUT APP
            </h2>
            <p className="lh-lg text-light" style={{ fontSize: "14px" }}>
              BookYourTurf is a smart and modern sports booking app designed for players, teams, and sports enthusiasts who want quick, easy, and reliable access to nearby sports venues. The app helps you discover sports courts, grounds, turfs, and arenas around you — with real-time availability, transparent pricing, and instant online booking.

              Whether you play Football, Box Cricket, Badminton, Futsal and soon Tennis, Volleyball, Basketball, Skating, Billiards, Swimming, or any other indoor/outdoor sport — BookYourTurf helps you find and book the perfect spot, slot and sports in seconds.


              To make the experience even smoother, BookYourTurf offers easy-access payment options, allowing users to pay securely and instantly using:
              <span className="d-flex flex-wrap gap-3 justify-content-md-center justify-content-center align-items-center my-3">

                {/* Google Pay */}
                <span className="d-flex align-items-center justify-content-center bg-white px-3 py-2 rounded-3 shadow-sm" style={{ minWidth: "140px" }}>
                  <img
                    src={GpayImg}
                    alt="Google Pay"
                    style={{ height: "26px" }}
                  />
                </span>

                {/* PhonePe */}
                <span className="d-flex align-items-center justify-content-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm" style={{ minWidth: "140px" }}>
                  <img
                    src={PhonepayImg}
                    alt="PhonePe"
                    style={{ height: "26px" }}
                  />
                </span>

                {/* UPI */}
                <span className="d-flex align-items-center justify-content-center gap-2 bg-white px-3 py-2 rounded-3 shadow-sm" style={{ minWidth: "140px" }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
                    alt="UPI"
                    style={{ height: "26px" }}
                  />
                </span>

                {/* Cards (Visa + MasterCard) */}
                <span className="d-flex align-items-center gap-3 bg-white px-3 py-2 rounded-3 shadow-sm" style={{ minWidth: "140px" }}>
                  <img
                    src={CardImg}
                    alt="Visa"
                    style={{ height: "22px" }}
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                    alt="MasterCard"
                    style={{ height: "22px" }}
                  />
                </span>

              </span>

              With seamless payment integration and instant confirmation, BookYourTurf ensures a fast, convenient, and hassle-free booking experience for every player.
            </p>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
