import React from "react";
import cricket from "../assets/boxcricket_football.png";
import tennis from "../assets/tennis.png";
import volleyball from "../assets/volleyball.png";
import badminton from "../assets/badminton.png";
import football from "../assets/football.png";
import pickleball from "../assets/PickleImg.jpg";

const sports = [
  { name: "Football", image: football },
  { name: "Cricket", image: cricket },
  { name: "Pickleball", image: pickleball },
  // { name: "Tennis", image: tennis },
  { name: "Badminton", image: badminton },
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
          backgroundColor: "#5ad79f",
          borderRadius: "12px",
          transition: "transform 0.3s ease, background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.backgroundColor = "#54a784e0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.backgroundColor = "#5ad79f";
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
            style={{ color: "#1b4332" }}
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
