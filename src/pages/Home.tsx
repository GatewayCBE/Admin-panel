import React, { useState, useEffect } from "react";
import HomeImg from "../assets/p1.jpg";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="vh-100 position-relative d-flex align-items-center"
      style={{
        backgroundImage: `url(${HomeImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
   

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <div
        className="container text-center text-white"
        style={{
          zIndex: 2,
          animation: "fadeUp 1.2s ease",
          marginTop: "80px",
        }}
      >
        <h1
          className="display-3 fw-bold mb-4"
          style={{
            textShadow: "3px 3px 6px rgba(0,0,0,0.7)",
            letterSpacing: "2px",
          }}
        >
          Book Your Slot
        </h1>

        <p
          className="fs-4 mb-5"
          style={{
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            maxWidth: "800px",
            margin: "0 auto 2rem",
            lineHeight: "1.6",
          }}
        >
          <span style={{ color: "#52b788", fontWeight: "600" }}>Your Field</span> •{" "}
          <span style={{ color: "#74c69d", fontWeight: "600" }}>Your Time</span> •{" "}
          <span style={{ color: "#95d5b2", fontWeight: "600" }}>Your Game</span> •{" "}
          <span style={{ color: "#b7e4c7", fontWeight: "600" }}>Your Turf Tracker</span>
        </p>

        {/* <button
          className="btn btn-lg fw-bold explore-btn"
          style={{
            background: "linear-gradient(135deg, #52b788, #2d6a4f)",
            color: "#fff",
            padding: "15px 40px",
            borderRadius: "50px",
            border: "3px solid rgba(255,255,255,0.3)",
            fontSize: "1.2rem",
            boxShadow: "0 8px 25px rgba(82, 183, 136, 0.4)",
            transition: "all 0.4s ease",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08) translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 12px 35px rgba(82, 183, 136, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(82, 183, 136, 0.4)";
          }}
        >
          Explore Turfs →
        </button> */}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "50px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          animation: "bounce 2s infinite",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "50px",
            border: "2px solid rgba(255,255,255,0.5)",
            borderRadius: "20px",
            display: "flex",
            justifyContent: "center",
            paddingTop: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "10px",
              background: "#52b788",
              borderRadius: "3px",
              animation: "scroll 1.5s infinite",
            }}
          ></div>
        </div>
      </div>

      <style>
        {`
          .nav-link-custom::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #52b788, #d8f3dc);
            transition: all 0.3s ease;
            transform: translateX(-50%);
          }
          
          .nav-link-custom:hover::after {
            width: 100%;
          }
          
          .nav-link-custom:hover {
            color: #52b788 !important;
            transform: translateY(-2px);
          }
          
          @media (max-width: 991px) {
            .navbar-collapse {
              background: rgba(0, 0, 0, 0.95);
              padding: 1rem;
              border-radius: 10px;
              margin-top: 1rem;
            }
          }
          
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            50% {
              transform: translateX(-50%) translateY(10px);
            }
          }
          
          @keyframes scroll {
            0% {
              opacity: 0;
              transform: translateY(0);
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translateY(15px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;