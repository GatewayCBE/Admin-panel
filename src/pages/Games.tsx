import React from "react";
import fbimage from "../assets/football2-removebg-preview.png";
import cricket from "../assets/cricket1-removebg-preview.png";
import basketball from "../assets/bb-removebg-preview.png";
import archery from "../assets/archery1-removebg-preview.png";
import pickleball from "../assets/pickleball1-removebg-preview.png";
import tennis from "../assets/tennis1-removebg-preview.png";

// Sample sports data
const sports = [
  { name: "Football", image: fbimage },
  { name: "Cricket", image: cricket },
  { name: "Basketball", image: basketball },
  { name: "Archery", image: archery },
  { name: "Table Tennis", image: pickleball },
  { name: "Tennis", image: tennis },
];

const Games: React.FC = () => {
  return (
    <div className="container py-5 text-center">
      <h2 className="fw-bold mb-4 text-success">Available Games</h2>

    <div className="row g-4 justify-content-center">
  {sports.map((sport, index) => (
    <div className="col-6 col-md-4 col-lg-4" key={index}>
      <div
        className="card shadow-sm border-0 text-center h-100"
        style={{
          backgroundColor: "#02613a",
          borderRadius: "12px",
          transition: "transform 0.3s ease, background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.backgroundColor = "#5ad79f";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.backgroundColor = "#02613a";
        }}
      >
        <div className="card-body d-flex flex-column align-items-center">
          <img
            src={sport.image}
            alt={sport.name}
            className="img-fluid mb-3"
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
          />
          <p
            className="fw-bold mb-0"
            style={{ color: "#d8f3dc", transition: "color 0.3s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1b4332")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#d8f3dc")}
          >
            {sport.name}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

    </div>
  );
};

export default Games;
