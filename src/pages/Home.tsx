import React from "react";
import "./Style/Home.css";

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="home-overlay">
        <h2 className="home-title">Book Your Slot</h2>
        <p className="home-subtitle">
          Your Field, Your Time, Your Game, Your Turf Tracker
        </p>
      </div>
    </div>
  );
};

export default Home;
