// components/Turfowner.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";

const Turfowner: React.FC = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const [turfs, setTurfs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!ownerId) return;

    const fetchTurfs = async () => {
      const data = await getTurfsByOwner(ownerId);
      setTurfs(data);
    };

    fetchTurfs();
    window.scrollTo(0, 0);
  }, [ownerId]);

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.turf_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf.turf_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <AdminNavbar />

      <div className="container pt-5 mt-4">
        {/* PAGE TITLE */}
        <h2 className="fw-bold text-success text-center mb-4">
          Turfs List of Owner
        </h2>

        {/* SEARCH */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-lg shadow-sm"
                placeholder="Search by turf name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingRight: "45px" }}
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                style={{ pointerEvents: "none" }}
              >
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* TURF LIST */}
        {filteredTurfs.length === 0 ? (
          <p className="text-center text-muted">
            No turfs found for this owner.
          </p>
        ) : (
          <div className="row g-3">
            {filteredTurfs.map((turf) => (
              <div
                key={turf.turf_id}
                className="col-12 col-md-6 col-lg-4"
              >
                <div
                  className="card h-100 border-0 shadow-sm rounded-4"
                  style={{
                    backgroundColor: "#5ad79f",
                    color: "#02613a",
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="fw-bold mb-2">
                        {turf.turf_name}
                      </h5>
                      <p className="mb-0 small">
                        📍 <strong>Location:</strong>{" "}
                        {turf.turf_location}
                      </p>
                    </div>

                    <div className="mt-3 d-flex flex-column flex-sm-row gap-2">
                      <Link
                        to={`/dashboard/owners/${ownerId}/${turf.turf_id}`}
                        className="btn btn-light btn-sm text-success fw-semibold rounded-pill flex-fill"
                        style={{ textDecoration: "none" }}
                      >
                        View Details →
                      </Link>

                      <Link
                        to={`/dashboard/owners/${ownerId}/${turf.turf_id}/slots`}
                        className="btn btn-light btn-sm text-success fw-semibold rounded-pill flex-fill"
                        style={{ textDecoration: "none" }}
                      >
                        View Slots 🔎
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Turfowner;
