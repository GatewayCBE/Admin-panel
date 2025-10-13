import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // adjust path

const TurfDetails: React.FC = () => {
  const { ownerId, turfId } = useParams<{ ownerId: string; turfId: string }>();
  const [turf, setTurf] = useState<any | null>(null);

  useEffect(() => {
    if (ownerId && turfId) {
      const fetchTurf = async () => {
        const turfs = await getTurfsByOwner(ownerId);
        const selectedTurf = turfs.find((t: any) => t.turf_id === turfId);
        setTurf(selectedTurf || null);
      };
      fetchTurf();
    }
    window.scrollTo(0, 0);
  }, [ownerId, turfId]);

  if (!turf) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Turf details not found.</p>
      </div>
    );
  }

const handleActivateTurf = async () => {
  if (!turfId) return;
  try {
    const turfRef = doc(db, "environment", "testing", "turfs", turfId);
    await updateDoc(turfRef, {
      turf_active_status: true,
    });

    setTurf({ ...turf, turf_active_status: true }); 
    alert("Turf activated successfully!")
    console.log("Turf activated successfully!");
  } catch (error) {
    console.error("Error activating turf:", error);
  }
};


  const dayMap: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };

  return (
    <div className="" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Header Section */}
      <div className="container py-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2 className="fw-bold">{turf.turf_name}</h2>

            <div className="d-flex align-items-center gap-2">
              <p className="text-muted mb-0">📍 {turf.turf_location}</p>
              <span className="badge bg-warning text-dark">⭐ 4.5 / 5</span>
              <span className="text-success">Rate Venue</span>
            </div>
          </div>

          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            {turf.turf_active_status ? (
              <button className="btn btn-danger" disabled>
                Turf Active
              </button>
            ) : (
              <button
                className="btn btn-outline-success"
                onClick={handleActivateTurf}
              >
                Activate Turf
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image & Sidebar */}
      <div className="container-fluid px-5">
        <div className="row justify-content-between">
          <div className="col-md-6">
            {turf.turf_images?.length > 0 && (
              <img
                src={turf.turf_images[0]}
                alt={turf.turf_name}
                className="img-fluid"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                  maxHeight: "450px",
                }}
              />
            )}
          </div>

          <div className="col-md-5 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h6 className="fw-semibold">🕒 Timings</h6>
              <p>
                {turf.turf_opening_hour} - {turf.turf_closing_hour}
              </p>
            </div>
            <div>
              <h6 className="fw-semibold">📍 Location Map</h6>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  turf.turf_location
                )}&output=embed`}
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="turf-map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-12">
            {/* Player Capacity */}
            {typeof turf.sports_specific_person_count === "object" && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">👥 Player Capacity</h5>
                  <ul className="mb-0">
                    {Object.entries(turf.sports_specific_person_count).map(
                      ([sport, count]) => (
                        <li key={sport} className="mb-1">
                          {sport}: {Number(count)} players
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Price Chart ✅ */}
            {typeof turf.sport_specific_price === "object" && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">💰 Price Chart</h5>
                  {Object.entries(turf.sport_specific_price).map(
                    ([sport, priceObj]: [string, any]) => (
                      <div key={sport} className="mb-3">
                        <strong>{sport}</strong>
                        <ul className="mb-0">
                          {Object.entries(priceObj).map(
                            ([dayNumber, price]: [string, any]) => (
                              <li key={dayNumber}>
                                {dayMap[Number(dayNumber)]}: ₹{price}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* About Venue */}
            {turf.turf_description && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">📝 About Venue</h5>
                  <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                    {turf.turf_description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDetails;
