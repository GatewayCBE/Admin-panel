import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";

const OwnerTurfs: React.FC = () => {
  const ownerId = localStorage.getItem("user_id");
  const [turfs, setTurfs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!ownerId) return;

    const fetchTurfs = async () => {
      const data = await getTurfsByOwner(ownerId);
      setTurfs(data);
    };

    fetchTurfs();
  }, [ownerId]);

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.turf_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf.turf_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h4 className="fw-bold text-success text-center mb-4">
        Your Venues
      </h4>

      {/* SEARCH */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <input
            className="form-control shadow-sm"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LIST */}
      {filteredTurfs.length === 0 ? (
        <p className="text-center text-muted">
          No venues added yet.
        </p>
      ) : (
        <div className="row g-3">
          {filteredTurfs.map((turf) => (
            <div key={turf.turf_id} className="col-md-4">
              <div className="card shadow-sm border-0 h-100 rounded-4">
                <div className="card-body">
                  <h5 className="fw-bold text-success">
                    {turf.turf_name}
                  </h5>
                  <p className="small mb-3">
                    📍 {turf.turf_location}
                  </p>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/dashboard/turf/${turf.turf_id}`}
                      className="btn btn-outline-success btn-sm flex-fill"
                    >
                      View
                    </Link>
                    <Link
                      to={`/dashboard/turf/${turf.turf_id}/slots`}
                      className="btn btn-outline-success btn-sm flex-fill"
                    >
                      Slots
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerTurfs;
