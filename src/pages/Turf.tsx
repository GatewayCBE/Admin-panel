import React, { useEffect, useState } from "react";
import { getTurfs } from "../services/firestoreService";
import "./Style/Turf.css"; // <-- Turf-specific CSS

interface Turf {
  turf_id: string;
  turf_name: string;
  turf_location: string;
  turf_description: string;
  owner_id: string;
  turf_closing_hour: string;
  turf_opening_hour: string;
}

const Turf: React.FC = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const turfData = await getTurfs();
      setTurfs(
        turfData.map((turf: any) => ({
          turf_id: turf.turf_id ?? turf.id ?? "",
          turf_name: turf.turf_name ?? "",
          turf_location: turf.turf_location ?? "",
          turf_description: turf.turf_description ?? "",
          owner_id: turf.owner_id ?? "",
          turf_closing_hour: turf.turf_closing_hour ?? "",
          turf_opening_hour: turf.turf_opening_hour ?? "",
        }))
      );
    };
    fetchData();
  }, []);

  return (
    <div className="turf-page">
      <h2 className="turf-title">Turf Details</h2>
      {turfs.length === 0 ? (
        <p>No turf details available.</p>
      ) : (
        <div className="turf-grid">
          {turfs.map((turf) => (
            <div key={turf.turf_id} className="turf-card">
              <h3>{turf.turf_name}</h3>
              <p>📍 {turf.turf_location}</p>
              <p>
                🕒 {turf.turf_opening_hour} - {turf.turf_closing_hour}
              </p>
              <p>{turf.turf_description}</p>
              <p>👤 Owner ID: {turf.owner_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Turf;
