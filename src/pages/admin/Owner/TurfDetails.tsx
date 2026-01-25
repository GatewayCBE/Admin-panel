import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTurfsByOwner , getOwnerById  } from "../../../services/firestoreService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import AdminNavbar from "../Analytics/AdminNavbar";
import "bootstrap/dist/js/bootstrap.bundle.min";
import badmintonImg from "../../../assets/badminton.png";
import cricketImg from "../../../assets/boxcricket_football.png";

const TurfDetails: React.FC = () => {
  const { ownerId, turfId } = useParams<{ ownerId: string; turfId: string }>();
  const [turf, setTurf] = useState<any | null>(null);
const [owner, setOwner] = useState<any | null>(null);

useEffect(() => {
  if (ownerId && turfId) {
    (async () => {
      const turfs = await getTurfsByOwner(ownerId);
      const selectedTurf = turfs.find((t: any) => t.turf_id === turfId);
      setTurf(selectedTurf || null);

      // 🔹 Fetch owner details
      const ownerData = await getOwnerById(ownerId);
      setOwner(ownerData);
    })();
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
      await updateDoc(turfRef, { turf_active_status: true });
      setTurf({ ...turf, turf_active_status: true });
      alert("Turf activated successfully!");
    } catch (error) {
      console.error("Error activating turf:", error);
    }
  };

  const firstTiming = Object.values(turf.sport_specific_timing)[0] as {
    opening_time?: string;
    closing_time?: string;
    sport_available?: boolean;
  };

  const priceValues = Object.values(turf.sport_specific_price)
    .flatMap((sportPrices: any) =>
      Object.values(sportPrices).flatMap((p: any) => [p.day, p.night])
    )
    .filter((v) => typeof v === "number");

  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;

  const sportImageMap: Record<string, string> = {
    badminton: badmintonImg,
    cricket: cricketImg,
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>
      <AdminNavbar />
{owner && (
  <div className="container mt-5">
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-body">
        <h5 className="fw-bold text-success mb-3">👤 Owner Details</h5>
        <div className="row">
          <div className="col-md-4">
            <p className="mb-1"><strong>Name:</strong> {owner.owner_name}</p>
          </div>
          <div className="col-md-4">
            <p className="mb-1"><strong>Email:</strong> {owner.owner_email}</p>
          </div>
          <div className="col-md-4">
            <p className="mb-1"><strong>Mobile:</strong> {owner.owner_mobile_number}</p>
          </div>
        </div>
        {owner.owner_address && (
          <p className="mb-0 mt-2"><strong>Address:</strong> {owner.owner_address}</p>
        )}
      </div>
    </div>
  </div>
)}

      {/* Details Section */}
      <div className="container mt-5 pt-5">
        <div className="row">
          {/* LEFT: IMAGE */}
          <div className="col-lg-5">
            <div className="card shadow-sm mb-4">
              <img
                src={turf.turf_images?.[0]}
                alt="Turf Preview"
                className="img-fluid rounded"
                style={{ width: "100%", height: "350px", objectFit: "cover" }}
              />
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="col-lg-7">
            <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
              <button className="btn btn-secondary" onClick={handleActivateTurf}>{turf.turf_active_status ? "Turf Active" : "Inactive"}</button>
            </div>
            {/* Quick Info */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div className="card text-center p-3 shadow-sm">
                  <h6>👥 Max Players</h6>
                  <strong>{`${Number(
                    Object.values(turf.sports_specific_person_count)[0]
                  )}+`}</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center p-3 shadow-sm">
                  <h6>🕒 Timings</h6>
                  <strong>
                    {firstTiming?.opening_time && firstTiming?.closing_time
                      ? `${firstTiming.opening_time} – ${firstTiming.closing_time}`
                      : "N/A"}
                  </strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center p-3 shadow-sm">
                  <h6>💰 Price Range</h6>
                  <strong>From ₹{minPrice}</strong>
                </div>
              </div>
            </div>

            {/* Sport Timings */}
            <div className="row g-3">
              {Object.entries(turf.sport_specific_timing).map(
                ([sport, timing]: any) => {
                  const sportKey = sport.toLowerCase().trim();
                  const sportImage =
                    sportImageMap[sportKey] || "/assets/default.png";

                  return (
                    <div className="col-md-6" key={sport}>
                      <div className="card shadow-sm p-3 d-flex align-items-center">
                        <img
                          src={sportImage}
                          alt={sport}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                          }}
                          className="mb-2"
                        />
                        <h6 className="fw-semibold mb-1 text-center">
                          {sport}
                        </h6>
                        <p
                          className="mb-1 text-center"
                          style={{ fontSize: "14px" }}
                        >
                          {timing?.opening_time} – {timing?.closing_time}
                        </p>
                        <span
                          className={`badge ${
                            timing.sport_available ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {timing.sport_available ? "Available" : "Closed"}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="card mb-3 shadow-sm">
          <div
            className="card-header d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            data-bs-target="#priceChartCollapse"
            style={{ cursor: "pointer" }}
          >
            <h5 className="fw-semibold mb-0">💰 Price Chart</h5>
            <span className="text-primary">▼</span>
          </div>

          <div id="priceChartCollapse" className="collapse">
            <div className="card-body">
              {Object.entries(turf.sport_specific_price).map(
                ([sport, priceObj]: any) => (
                  <div key={sport} className="mb-3">
                    <h6 className="text-primary">{sport}</h6>

                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>🌞 Day Price</th>
                          <th>🌙 Night Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(priceObj).map(([day, price]: any) => (
                          <tr key={day}>
                            <td>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </td>
                            <td>₹{price.day}</td>
                            <td>₹{price.night}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card mb-3 shadow-sm">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">📍 Location</h5>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                turf.turf_location
              )}&output=embed`}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="turf-map"
            ></iframe>
          </div>
        </div>

        {/* About Venue */}
        {turf.turf_description && (
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">📝 About Venue</h5>
              <p style={{ whiteSpace: "pre-line" }}>{turf.turf_description}</p>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .card-header[aria-expanded="true"] span {
  transform: rotate(180deg);
  transition: 0.3s;
}
.card-header span {
  transition: 0.3s;
}
      `}</style>
    </div>
  );
};

export default TurfDetails;
