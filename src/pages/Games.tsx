import React from "react";
import "./Style/Games.css";
import fbimage from "../assets/football2-removebg-preview.png"
import cricket from "../assets/cricket1-removebg-preview.png"
import basketball from "../assets/bb-removebg-preview.png"
import archery from "../assets/archery1-removebg-preview.png"
import pickleball from "../assets/pickleball1-removebg-preview.png"
import tennis from "../assets/tennis1-removebg-preview.png"

// Sample sports data (you can expand later or fetch from Firestore)
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
    <div className="games-container">
      <h2 className="games-title">Available Games</h2>
      <div className="games-grid">
        {sports.map((sport, index) => (
          <div className="game-card" key={index}>
            <div className="game-image">
              <img src={sport.image} alt={sport.name} />
            </div>
            <p className="game-name">{sport.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Games;
