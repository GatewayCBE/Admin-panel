import React, { useEffect, useState } from "react";
import { getTurfs } from "../../services/firestoreService";
import { useNavigate } from "react-router-dom";

interface Turf {
  turf_id: string;
  turf_name: string;
  turf_location: string;
  owner_id: string;
  turf_closing_hour: string;
  turf_opening_hour: string;
}

const Turf: React.FC = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const turfData = await getTurfs();
      setTurfs(
        turfData.map((turf: any) => ({
          turf_id: turf.turf_id ?? turf.id ?? "",
          turf_name: turf.turf_name ?? "",
          turf_location: turf.turf_location ?? "",
          owner_id: turf.owner_id ?? "",
          turf_closing_hour: turf.turf_closing_hour ?? "",
          turf_opening_hour: turf.turf_opening_hour ?? "",
        }))
      );
    };
    fetchData();
  }, []);

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
      turf.turf_location.toLowerCase().includes(search.toLowerCase()) ||
      turf.owner_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h2 className="text-center text-success mb-4 fw-bold">Turf Details</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control w-50 shadow-sm"
          placeholder="Search by Turf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          // style={{ backgroundColor: "#2d6a4f",color:'white'}}
        />
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
