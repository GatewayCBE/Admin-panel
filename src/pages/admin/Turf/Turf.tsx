import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTurf } from "./useTurf";


const Turf: React.FC = () => {
  const { turfs } = useTurf();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  
  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
      turf.turf_location.toLowerCase().includes(search.toLowerCase()) ||
      turf.owner_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h2 className="text-center text-success mb-4 fw-bold">Turf Details</h2>

      <div className="mb-4" style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
        <input
          type="text"
          name="search"
          className="form-control shadow-sm"
          placeholder="Search by Turf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{width: "100%", paddingRight: "40px"}}
        />
        <span 
          style={{position: "absolute", 
            right: "10px", 
            top: "50%", 
            transform: "translateY(-50%)",
            cursor: "pointer", 
            color: "#888"}}
        >
          🔍
        </span>
      </div>

      {filteredTurfs.length === 0 ? (
        <p className="text-center text-muted">No matching turf details found.</p>
      ) : (
        <ul className="list-group shadow-sm">
          {filteredTurfs.map((turf) => (
            <li
              key={turf.turf_id}
              className="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-3 border-0 shadow-sm"
              style={{
                backgroundColor: "#2d6a4f",
                color: "#d8f3dc",
                cursor: "pointer",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onClick={() => navigate(`/slots/${turf.turf_id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#40916c";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2d6a4f";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div>
                <h5 className="fw-bold mb-1">{turf.turf_name}</h5>
                <p className="mb-1">📍 {turf.turf_location}</p>
                <p className="mb-1">
                  🕒 {turf.turf_opening_hour} - {turf.turf_closing_hour}
                </p>
                <small>👤 Owner ID: {turf.owner_id}</small>
              </div>
              <span className="badge bg-light text-success rounded-pill px-3 py-2">
                View Slots →
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Turf;
