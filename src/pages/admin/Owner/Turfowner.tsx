// components/Turfowner.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";

const Turfowner: React.FC = () => {
  const { ownerId } = useParams<{ ownerId: string }>();
  const [turfs, setTurfs] = useState<any[]>([]);

  useEffect(() => {
    if (ownerId) {
      const fetchTurfs = async () => {
        const data = await getTurfsByOwner(ownerId);
        setTurfs(data);
        console.log("data", data);
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
        <div className="row">
          {turfs.map((turf) => (
            <div className="col-md-6 col-lg-4 mb-4" key={turf.turf_id}>
              <div
                className="card shadow-sm h-100 border-success"
                style={{
                  backgroundColor: "#02613a",
                  color: "white",
                }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold ">{turf.turf_name}</h5>
                  <p className="card-text">
                    📍 <strong>Location:</strong> {turf.turf_location}
                  </p>

                  {Array.isArray(turf.available_sports_list) &&
                    turf.available_sports_list.length > 0 && (
                      <p className="card-text">
                        ⚽ <strong>Sports:</strong>{" "}
                        {turf.available_sports_list.map(
                          (sport: string, index: number) => (
                            <span key={index} className="badge bg-success me-1">
                              {sport}
                            </span>
                          )
                        )}
                      </p>
                    )}

                  {typeof turf.sport_specific_price === "object" ? (
                    <div className="mb-2">
                      💰 <strong>Prices:</strong>
                      {Object.entries(turf.sport_specific_price).map(
                        ([sport, priceObj]) => (
                          <div key={sport} className="ms-3 mt-1">
                            <strong>{sport}</strong>:
                            <ul className="mb-1">
                              {Object.entries(
                                priceObj as Record<string, number>
                              ).map(([dayType, amount]) => (
                                <li key={dayType}>
                                  {dayType}: ₹{amount}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  ) : turf.sport_specific_price ? (
                    <p>
                      💰 <strong>Prices:</strong> {turf.sport_specific_price}
                    </p>
                  ) : null}

                  {typeof turf.sports_specific_person_count === "object" ? (
                    <div className="mb-2">
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
                      👥 <strong>Capacity:</strong>{" "}
                      {turf.sports_specific_person_count}
                    </p>
                  ) : null}

                  {turf.turf_description && (
                    <p className="card-text">
                      📝 <strong>Description:</strong> {turf.turf_description}
                    </p>
                  )}

                  <p className="card-text">
                    🕒 <strong>Hours:</strong> {turf.turf_opening_hour} -{" "}
                    {turf.turf_closing_hour}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Turfowner;
