import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getTurfsByOwner , getOwnerById  } from "../../../services/firestoreService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { getTurfById, getOwnerByOwnerId } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import badmintonImg from "../../../assets/badminton.png";
import cricketImg from "../../../assets/boxcricket_football.png";
import pickleImg from "../../../assets/PickleImg.png"

interface TurfData {
  turf_id: string;
  owner_id?: string;
  turf_name?: string;
  turf_location?: string;
  turf_description?: string;
  turf_images?: string[];
  turf_active_status?: boolean;
  sports_specific_person_count?: Record<string, number>;
  sport_specific_timing?: Record<string, any>;
  sport_specific_price?: Record<string, any>;
  [key: string]: any;
}

const TurfDetails: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [turf, setTurf] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  const navigate = useNavigate();
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


  const hasBoxFootball = turf
  ? Object.keys(turf.sport_specific_timing || {}).some((sport) =>
      sport.toLowerCase().includes("boxcricket") ||
      sport.toLowerCase().includes("football") ||
      sport.toLowerCase().includes("cricket & football")
    )
  : false;

  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  useEffect(() => {
    if (!turfId) return;

    const fetchData = async () => {
      try {
        const turfData = await getTurfById(turfId) as TurfData;
        if (!turfData) {
          setTurf(null);
          setLoading(false);
          return;
        }
        setTurf(turfData);

        if (turfData.owner_id) {
          const ownerData = await getOwnerByOwnerId(turfData.owner_id);
          setOwner(ownerData);
        }
      } catch (error) {
        console.error("Error fetching turf or owner data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [turfId]);

  const handleApproveTurf = async () => {
    if (!turfId || !turf) return;
    try {
      const turfRef = doc(db, "environment", "testing", "turfs", turfId);
      await updateDoc(turfRef, { turf_active_status: true });
      setTurf({ ...turf, turf_active_status: true });
      alert("Turf approved successfully!");
    } catch (error) {
      console.error("Error approving turf:", error);
      alert("Failed to approve turf");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3">Loading turf details...</p>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="container py-5 text-center">
        <h4>Turf not found</h4>
        <p className="text-muted">The requested venue could not be loaded.</p>
      </div>
    );
  }

  const firstTiming = Object.values(turf.sport_specific_timing || {})[0] as any;

  const priceValues = Object.values(turf.sport_specific_price || {})
    .flatMap((sportPrices: any) =>
      Object.values(sportPrices).flatMap((p: any) => [p.day, p.night])
    )
    .filter((v) => typeof v === "number");

  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;

  const sportImageMap: Record<string, string> = {
    "badminton": badmintonImg,
    "boxcricket & football": cricketImg,
    "pickleball": pickleImg,
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f8f9fa" }}>
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

{/* Hero Section with Carousel for Multiple Images */}
<div className="position-relative">
  {/* Carousel for multiple turf images */}
  {turf.turf_images && turf.turf_images.length > 0 ? (
    <div id="turfImageCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {turf.turf_images.map((imgUrl: string, index: number) => (
          <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <img
              src={imgUrl}
              alt={`${turf.turf_name || "Turf"} image ${index + 1}`}
              className="d-block w-100"
              style={{
                height: "500px",
                objectFit: "cover",
                filter: "brightness(0.75)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Carousel Controls - only show if more than 1 image */}
      {turf.turf_images.length > 1 && (
        <>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#turfImageCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#turfImageCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </div>
  ) : (
    /* Fallback single placeholder image */
    <img
      src="https://via.placeholder.com/1200x500/67a521/ffffff?text=Turf"
      alt="Turf Placeholder"
      className="w-100"
      style={{
        height: "500px",
        objectFit: "cover",
        filter: "brightness(0.75)",
      }}
    />
  )}

  {/* Main Glass Overlay */}
  <div
    className="position-absolute top-50 start-50 translate-middle text-white text-center p-5 rounded-4 shadow-lg"
    style={{
      zIndex: 2,
      width: "90%",
      maxWidth: "950px",
      background: "rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(20px) saturate(200%)",
      WebkitBackdropFilter: "blur(20px) saturate(200%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
    }}
  >
    {/* Title */}
    <h1 className="display-4 fw-bold mb-5 text-shadow">
      {(turf.turf_name || "Unnamed Turf").toUpperCase()}
    </h1>

    {/* Buttons */}
    <div className="d-flex justify-content-center gap-4 flex-wrap">
      <button
        className="btn btn-outline-light btn-lg px-5 py-3 fw-semibold"
        onClick={() => setShowOwnerModal(true)}
      >
        Owner Details
      </button>

      <button
        className="btn btn-outline-warning btn-lg px-5 py-3 fw-semibold"
        onClick={() => navigate(`/dashboard/owners/${turf.owner_id}/turfs/${turfId}/edit`)}
      >
        Edit Turf
      </button>

      <button
        className={`btn btn-lg px-5 py-3 fw-bold ${
          turf.turf_active_status ? "btn-success" : "btn-danger"
        }`}
        onClick={handleApproveTurf}
        disabled={turf.turf_active_status}
      >
        {turf.turf_active_status ? "Approved" : "Approve Turf"}
      </button>
    </div>
  </div>

  {/* Bottom Location Bar – Glass Style */}
  <div
    className="position-absolute bottom-0 start-50 translate-middle-x text-white text-center px-5 py-4 rounded-top-4"
    style={{
      zIndex: 2,
      width: "90%",
      maxWidth: "950px",
      background: "rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(20px) saturate(200%)",
      WebkitBackdropFilter: "blur(20px) saturate(200%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      borderBottom: "none",
      boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.25)",
    }}
  >
    <p className="mb-0 fs-5 fw-medium">
      <i className="bi bi-geo-alt-fill me-2"></i>
      {turf.turf_location || "Location not specified"}
    </p>
  </div>
</div>

      {/* Main Content */}
      <div className="container py-5">
        {/* Quick Info Cards */}
        <div className="row g-4 mb-5 justify-content-center">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center p-4 h-100">
              <h6 className="text-muted mb-2">Max Players</h6>
              <h3 className="fw-bold text-success">
                {`${Number(
                    Object.values(turf.sports_specific_person_count)[0]
                  )}+`}
              </h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center p-4 h-100">
              <h6 className="text-muted mb-2">Timings</h6>
              <h5 className="fw-bold">
                {firstTiming?.opening_time && firstTiming?.closing_time
                  ? `${firstTiming.opening_time} – ${firstTiming.closing_time}`
                  : "N/A"}
              </h5>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center p-4 h-100">
              <h6 className="text-muted mb-2">Price Range</h6>
              <h5 className="fw-bold text-success">
                ₹{minPrice} – ₹{maxPrice}
              </h5>
            </div>
          </div>
        </div>

        {/* Quick Info Cards - Perfectly aligned & scrollable when needed */}
{/* Quick Info Cards - Perfectly centered & equal height */}
<div className="row g-4 mb-5 justify-content-center">
  {/* 1. Available Sports */}
  <div className={`col-12 col-md-6 col-lg-${hasBoxFootball ? '4' : '5'} mx-auto my-auto`}>
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-light text-center py-3">
        <h5 className="mb-0 fw-bold">Available Sports</h5>
      </div>
      <div className="card-body p-4 d-flex flex-column">
        {Object.entries(turf.sport_specific_timing || {}).length > 0 ? (
          <div className="flex-grow-1 d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: "340px" }}>
            {Object.entries(turf.sport_specific_timing || {}).map(([sport, timing]: any) => {
              const sportKey = sport.toLowerCase().trim();
              const sportImage = sportImageMap[sportKey] || "/assets/default.png";

              return (
                <div key={sport} className="d-flex align-items-center gap-3 p-2 bg-white rounded border border-light">
                  <img
                    src={sportImage}
                    alt={sport}
                    style={{ width: "50px", height: "50px", objectFit: "contain" }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1 text-capitalize">{sport}</h6>
                    <p className="mb-1 small text-muted">
                      {timing?.opening_time || "—"} – {timing?.closing_time || "—"}
                    </p>
                  </div>
                  <span
                    className={`badge fs-6 px-3 py-1 ${
                      timing.sport_available ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {timing.sport_available ? "Available" : "Closed"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 text-muted flex-grow-1 d-flex align-items-center justify-content-center">
            <div>
              <i className="bi bi-list-ul fs-1 mb-3 d-block opacity-50"></i>
              <p className="mb-0">No sports information available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* 2. Amenities */}
  <div className={`col-12 col-md-6 col-lg-${hasBoxFootball ? '4' : '5'} mx-auto my-auto`}>
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-light text-center py-3">
        <h5 className="mb-0 fw-bold">Amenities</h5>
      </div>
      <div className="card-body p-4 d-flex flex-column">
        {turf.amenities && Array.isArray(turf.amenities) && turf.amenities.length > 0 ? (
          <div
            className="flex-grow-1 overflow-auto pe-2"
            style={{ maxHeight: "340px" }}
          >
            <div className="d-flex flex-wrap gap-3">
              {turf.amenities.map((amenity: string, index: number) => (
                <span
                  key={index}
                  className="badge bg-info text-dark fs-6 px-3 py-2 text-capitalize shadow-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-5 text-muted flex-grow-1 d-flex align-items-center justify-content-center">
            <div>
              <i className="bi bi-list-check fs-1 mb-3 d-block opacity-50"></i>
              <p className="mb-0">No amenities listed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* 3. Turf Dimensions – only shown when Boxcricket/Football exists */}
  {hasBoxFootball && (
    <div className="col-lg-4 mx-auto my-auto">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-header bg-light text-center py-3">
          <h5 className="mb-0 fw-bold">Turf Dimensions</h5>
        </div>
        <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
          <div className="row g-3">
            <div className="col-4">
              <div className="p-3 bg-light rounded">
                <h6 className="text-muted mb-1 small">Length</h6>
                <h5 className="fw-bold">{turf.turf_length || "—"}</h5>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded">
                <h6 className="text-muted mb-1 small">Breadth</h6>
                <h5 className="fw-bold">{turf.turf_breadth || "—"}</h5>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded">
                <h6 className="text-muted mb-1 small">Height</h6>
                <h5 className="fw-bold">{turf.turf_height || "—"}</h5>
              </div>
            </div>
          </div>

          {!turf.turf_length && !turf.turf_breadth && !turf.turf_height && (
            <p className="text-muted mt-4">Dimensions not specified</p>
          )}
        </div>
      </div>
    </div>
  )}
</div>

        {/* Price Chart */}
<div className="card border-0 shadow-sm mb-5">
  <div
    className="card-header bg-light d-flex justify-content-between align-items-center py-3"
    data-bs-toggle="collapse"
    data-bs-target="#priceChart"
    style={{ cursor: "pointer" }}
  >
    <h5 className="mb-0 fw-bold">Day-split Timing and Price</h5>
    <span className="text-muted">▼</span>
  </div>

  <div id="priceChart" className="collapse show">
    <div className="card-body">
      {Object.entries(turf.sport_specific_price || {}).map(([sport, priceObj]: [string, any]) => {
        // Get timing object for this sport
        const timing = turf.sport_specific_timing?.[sport] || {};

        return (
          <div key={sport} className="mb-5">
            <h5 className="fw-bold text-success mb-3 text-capitalize">
              {sport}{timing.court_count ? `(${timing.court_count} Courts)` : ""}
            </h5>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Day</th>
                    <th>Day Price</th>
                    <th>Day Timing</th>
                    <th>Night Price</th>
                    <th>Night Timing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                  ].map((day) => {
                    const price = priceObj?.[day] || {};
                    const dayPrice = typeof price.day === "number" ? `₹${price.day}` : "—";
                    const nightPrice = typeof price.night === "number" ? `₹${price.night}` : "—";

                    // Timing logic - prefer day/night specific, fallback to general
                    const dayStart = timing.day_start_time || timing.opening_time || "—";
                    const dayEnd = timing.day_end_time || timing.closing_time || "—";
                    const nightStart = timing.night_start_time || "—";
                    const nightEnd = timing.night_end_time || "—";

                    const isAvailable = timing.sport_available !== false;

                    return (
                      <tr key={day}>
                        <td className={`fw-medium text-capitalize ${day === currentDay ? "bg-success-subtle" : ""}`}>{day}</td>
                        <td>{dayPrice}</td>
                        <td>{dayStart} – {dayEnd}</td>
                        <td>{nightPrice}</td>
                        <td>{nightStart} – {nightEnd}</td>
                        <td>
                          <span
                            className={`badge fs-6 px-3 py-2 ${
                              isAvailable ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {isAvailable ? "Available" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {Object.keys(turf.sport_specific_price || {}).length === 0 && (
        <div className="text-center py-5 text-muted">
          <p>No pricing or timing information available for this turf.</p>
        </div>
      )}
    </div>
  </div>
</div>

        {/* Location */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">📍 Location</h5>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(turf.turf_location || "")}&output=embed`}
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen
              loading="lazy"
              title="turf-location"
            ></iframe>
            <p className="text-muted mt-3 small text-center">
              {turf.turf_location || "Location details not available"}
            </p>
          </div>
        </div>

        {/* About Venue */}
        {turf.turf_description && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">📝 About Venue</h5>
              <p className="text-muted" style={{ whiteSpace: "pre-line", lineHeight: "1.7" }}>
                {turf.turf_description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* React-controlled Owner Modal */}
      {showOwnerModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setShowOwnerModal(false)}
          />
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">Channel Partner / Owner Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowOwnerModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {owner ? (
                    <div className="list-group list-group-flush">
                      <div className="list-group-item d-flex justify-content-between">
                        <strong>Name</strong>
                        <span>{owner.owner_name || "—"}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between">
                        <strong>Email</strong>
                        <span>{owner.owner_email || "—"}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between">
                        <strong>Mobile</strong>
                        <span>{owner.owner_mobile_number || "—"}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted py-3">Owner information not available.</p>
                  )}
                </div>
                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary px-4" onClick={() => setShowOwnerModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.6); }
        .bg-gradient-dark {
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
        }
        .card { border-radius: 16px; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default TurfDetails;