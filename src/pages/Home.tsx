import React, { useState, useEffect } from "react";
import BgImg1 from "../assets/BgImg3.jpg";
import BgImg2 from "../assets/BgImg1.jpg";
import BgImg3 from "../assets/BgImg4.jpg";
import BgImg4 from "../assets/BgImg2.jpg";


const Home = () => {
  const images = [BgImg1, BgImg2, BgImg3, BgImg4];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto background slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // change image every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="vh-100 position-relative d-flex align-items-center"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 1.5s ease-in-out",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* CONTENT */}
      <div
        className="container text-center text-white"
        style={{
          zIndex: 2,
          animation: "fadeUp 1.2s ease",
          marginTop: "30px",
        }}
      >
        <h1 className="display-3 fw-bold mb-4">
          Book Your Turf
        </h1>

        <p className="fs-5 mb-5" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span style={{ color: "#1812b8ff", fontWeight: "600" }}>SPORTS </span>
          <span style={{ color: "#70cf9bff", fontWeight: "600" }}>MADE </span>
          <span style={{ color: "#70cf9bff", fontWeight: "600" }}>
            SMART
          </span>
        </p>
      </div>

      {/* SCROLL INDICATOR */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
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
          />
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
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
