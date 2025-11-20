// components/Turfowner.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";

const Turfowner: React.FC = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const [turfs, setTurfs] = useState<any[]>([]);

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
    <div className="container py-4">
      <h2 className="fw-bold text-success text-center mb-5">
        Turfs List of Owner
      </h2>

      {turfs.length === 0 ? (
        <p className="text-center text-muted">No turfs found for this owner.</p>
      ) : (
        <ul className="list-group">
          {turfs.map((turf) => (
            <div
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap rounded-3 mb-3 border-0 shadow-sm"
              style={{
                backgroundColor: "#02613a",
                color: "#5ad79f",
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
  className="badge bg-warning text-dark rounded-pill px-3 py-2"
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
