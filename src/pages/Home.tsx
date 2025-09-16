import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import p2 from '../assets/p2.jpeg';

const Home: React.FC = () => {
  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center text-center"
      style={{
        backgroundImage: `url(${p2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-dark bg-opacity-50 p-3 rounded text-white">
        <h2 className="fw-bold display-4 mb-3">Book Your Slot</h2>
        <p className="lead">
          Your Field, Your Time, Your Game, Your Turf Tracker
        </p>
      </div>
    </div>
  );
};

export default Home;
