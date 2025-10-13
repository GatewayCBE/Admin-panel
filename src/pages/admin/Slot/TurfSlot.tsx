import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAvailableDates } from "../../../services/firestoreService";

type TurfDateInfo = {
  court: string;
  sport: string;
};

const TurfSlot: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [dates, setDates] = useState<Record<string, TurfDateInfo>>({});

  useEffect(() => {
    async function fetchDates() {
      if (!turfId) {
        console.log("No turfId provided!");
        return;
      }

      const result = await getAvailableDates(turfId);
      setDates(result || {});
    }

    fetchDates();
  }, [turfId]);

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success text-center mb-4">
        Slots for Turf: {turfId}
      </h2>

      {Object.keys(dates).length === 0 ? (
        <p className="text-center text-muted">No dates found for this turf.</p>
      ) : (
        <div className="row justify-content-center">
          {Object.entries(dates).map(([date, info]) => (
            <div
              key={date}
              className="col-md-4 mb-3"
            >
              <div className="card shadow-sm border-success rounded-3">
                <div className="card-body text-center">
                  <h5 className="text-success fw-bold">{date}</h5>
                  <p className="mb-1">
                    <strong>Sport:</strong> {info.sport}
                  </p>
                  <p className="mb-0">
                    <strong>Court:</strong> {info.court}
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

export default TurfSlot;
