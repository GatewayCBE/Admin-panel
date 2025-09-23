// components/TurfDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";

const TurfDetails: React.FC = () => {
  const { ownerId, turfId } = useParams<{ ownerId: string; turfId: string }>();
  const [turf, setTurf] = useState<any | null>(null);
  const navigate = useNavigate();

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
      <div className="container py-4 text-center">
        <p className="text-muted">Turf details not found.</p>
      </div>
    );
  }

  return (
    <div
      className="modal show fade d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div
          className="modal-content shadow-lg border-0"
          style={{
            background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
            color: "white",
            borderRadius: "15px",
            animation: "zoomIn 0.3s ease"
          }}
        >
          {/* Header */}
          <div
            className="modal-header border-0"
            style={{
              background: "rgba(255,255,255,0.1)",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <h4 className="modal-title fw-bold text-light">
              {turf.turf_name}
            </h4>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={() => navigate(-1)}
            ></button>
          </div>

          {/* Body */}
          <div
            className="modal-body"
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#74c69d #1b4332",
            }}
          >
            <p>
              📍 <strong>Location:</strong> {turf.turf_location}
            </p>

            {Array.isArray(turf.available_sports_list) &&
              turf.available_sports_list.length > 0 && (
                <p>
                  ⚽ <strong>Sports:</strong>{" "}
                  {turf.available_sports_list.map((sport: string, index: number) => (
                    <span
                      key={index}
                      className="badge me-2"
                      style={{
                        backgroundColor: "#d8f3dc",
                        color: "#1b4332",
                        fontSize: "0.9rem",
                      }}
                    >
                      {sport}
                    </span>
                  ))}
                </p>
              )}

            {typeof turf.sport_specific_price === "object" ? (
              <div className="mb-3">
                💰 <strong>Prices:</strong>
                {Object.entries(turf.sport_specific_price).map(([sport, priceObj]) => (
                  <div
                    key={sport}
                    className="ms-3 mt-2 p-2 rounded"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <strong>{sport}</strong>:
                    <ul className="mb-1">
                      {Object.entries(priceObj as Record<string, number>).map(
                        ([dayType, amount]) => (
                          <li key={dayType}>
                            {dayType}: ₹{amount}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            ) : turf.sport_specific_price ? (
              <p>
                💰 <strong>Prices:</strong> {turf.sport_specific_price}
              </p>
            ) : null}

            {typeof turf.sports_specific_person_count === "object" ? (
              <div className="mb-3">
                👥 <strong>Capacity:</strong>
                <ul className="mb-1">
                  {Object.entries(turf.sports_specific_person_count).map(
                    ([sport, count]) => (
                      <li key={sport}>
                        {sport}: {Number(count)} players
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : turf.sports_specific_person_count ? (
              <p>
                👥 <strong>Capacity:</strong> {turf.sports_specific_person_count}
              </p>
            ) : null}

            {turf.turf_description && (
              <p>
                📝 <strong>Description:</strong> {turf.turf_description}
              </p>
            )}

            <p>
              🕒 <strong>Hours:</strong> {turf.turf_opening_hour} – {turf.turf_closing_hour}
            </p>
          </div>

          {/* Footer */}
          <div
            className="modal-footer border-0 d-flex justify-content-between"
            style={{
              background: "rgba(255,255,255,0.1)",
              borderBottomLeftRadius: "15px",
              borderBottomRightRadius: "15px",
            }}
          >
            <small className="text-light">
              ⚡ Book your slot early to avoid last-minute rush!
            </small>
            <button
              type="button"
              className="btn fw-bold"
              style={{
                backgroundColor: "#d8f3dc",
                color: "#1b4332",
                borderRadius: "30px",
                padding: "6px 20px",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = "#95d5b2")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = "#d8f3dc")
              }
              onClick={() => navigate(-1)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes zoomIn {
            from {
              transform: scale(0.7);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TurfDetails;
