// components/Turfowner.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";
import AdminSidebar from "../Analytics/AdminSidebar";
import AdminNavbar from "../Analytics/AdminNavbar";

const Turfowner: React.FC = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const [turfs, setTurfs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTurfs = turfs.filter((turf) =>
  turf.turf_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  turf.turf_location?.toLowerCase().includes(searchTerm.toLowerCase())
);


  useEffect(() => {
    if (ownerId) {
      const fetchTurfs = async () => {
        const data = await getTurfsByOwner(ownerId);
        setTurfs(data);
      };
      fetchTurfs();
    }

    window.scrollTo(0, 0);
  }, [ownerId]);

  return (
    <div className="admin-page-container mt-5 pt-5">
          <AdminNavbar />
      <h2 className="fw-bold text-success text-center mb-5">
        Turfs List of Owner
      </h2>
      <div
  className="mb-4"
  style={{
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  }}
>
  <input
    type="text"
    className="form-control shadow-sm"
    placeholder="Search by Turf name or Location..."
    value={searchTerm}
    style={{ width: "100%", paddingRight: "40px" }}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <span
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#888",
    }}
  >
    🔍
  </span>
</div>


{filteredTurfs.length === 0 ? (
        <p className="text-center text-muted">No turfs found for this owner.</p>
      ) : (
        <ul className="list-group">
{filteredTurfs.map((turf) => (
            <div
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap rounded-3 mb-3 border-0 shadow-sm"
              style={{
                marginLeft: "130px",
                width: "80%",
                backgroundColor: "#5ad79f",
                color: "#02613a",
              }}
            >
              <div>
                <h5 className="fw-bold mb-1">{turf.turf_name}</h5>
                <p className="mb-1">
                  📍 <strong>Location:</strong> {turf.turf_location}
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <Link
                  to={`/dashboard/owners/${ownerId}/${turf.turf_id}`}
                  className="badge bg-light text-success rounded-pill px-3 py-2 me-3"
                  style={{ textDecoration: "none" }}
                >
                  View Details →
                </Link>
                <Link
                  to={`/dashboard/owners/${ownerId}/${turf.turf_id}/slots`}
                  className="badge bg-light text-success rounded-pill px-3 py-2"
                  style={{ textDecoration: "none" }}
                >
                  View Slots 🔎
                </Link>
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Turfowner;
