import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTurfsByOwner } from "../../../services/firestoreService";

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
            <button className="btn btn-outline-success me-2">Activate Turf</button>
            {/* <button className="btn btn-outline-success me-2">In Active</button> */}

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
      style={{ objectFit: "cover", width: "100%", height: "auto", maxHeight: "450px" }}
    />
  )}
</div>

          <div className="col-md-5 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h6 className="fw-semibold">🕒 Timings</h6>
              <p>{turf.turf_opening_hour} - {turf.turf_closing_hour}</p>
            </div>
            <div>
              <h6 className="fw-semibold">📍 Location Map</h6>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(turf.turf_location)}&output=embed`}
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

<div className="container py-5">
  <div className="row">
    <div className="col-lg-12">

      {/* Sports Available */}
      {Array.isArray(turf.available_sports_list) && turf.available_sports_list.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">🏆 Sports Available 
              {/* <small className="text-muted">(Click on sports to view price chart)</small> */}
            </h5>
            <div className="d-flex flex-wrap gap-3">
              {turf.available_sports_list.map((sport: string, i: number) => (
                <button
                  key={i}
                  className="btn btn-outline-success d-flex align-items-center px-3 py-2"
                  style={{ minWidth: "120px" }}
                >
                  <span className="me-2">🏊</span> {/* Replace with sport-specific icons if needed */}
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Amenities */}
      {Array.isArray(turf.amenities) && turf.amenities.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">🛠️ Amenities</h5>
            <div className="row">
              {turf.amenities.map((item: string, i: number) => (
                <div key={i} className="col-6 col-md-4 mb-2 d-flex align-items-center">
                  <span className="text-success me-2">✔️</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Capacity */}
      {typeof turf.sports_specific_person_count === "object" && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">👥 Player Capacity</h5>
            <ul className="mb-0">
              {Object.entries(turf.sports_specific_person_count).map(([sport, count]) => (
                <li key={sport} className="mb-1">
                  {sport}: {Number(count)} players
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}


{typeof turf.sport_specific_price === "object" && (
  <div className="card mb-4">
    <div className="card-body">
      <h5 className="card-title mb-3">💰 Price Chart</h5>
{Object.entries(turf.sport_specific_price).map(
  ([sport, priceObj]: [string, any]) => (
    <div key={sport} className="mb-3">
      <strong>{sport}</strong>
      <ul className="mb-0">
        {/* Weekdays (Mon–Fri) */}
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
          <li key={day}>
            {day}: ₹{priceObj?.weekday ?? "N/A"}
          </li>
        ))}

        {/* Weekends (Sat–Sun) */}
        {["Saturday", "Sunday"].map((day) => (
          <li key={day}>
            {day}: ₹{priceObj?.weekend ?? "N/A"}
          </li>
        ))}
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
            <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
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
