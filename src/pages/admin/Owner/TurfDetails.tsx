import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
              height: "clamp(250px, 50vh, 500px)",
              objectFit: "cover",
              filter: "brightness(0.75)",
            }}
          />
        )}

        {/* Main Glass Overlay - Responsive positioning */}
        <div
          className="position-absolute top-50 start-50 translate-middle text-white text-center p-3 p-sm-4 p-md-5 rounded-4 shadow-lg"
          style={{
            zIndex: 2,
            width: "95%",
            maxWidth: "950px",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(20px) saturate(200%)",
            WebkitBackdropFilter: "blur(20px) saturate(200%)",
          }}
        >
          {/* Title - Responsive sizing */}
          <h1 className="fw-bold mb-3 mb-md-4" style={{ fontSize: "clamp(1.25rem, 4vw, 3rem)", lineHeight: "1.2" }}>
            {(turf.turf_name || "Unnamed Turf").toUpperCase()}
          </h1>

          {/* Buttons - Stack on mobile, row on larger screens */}
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3">
            <button 
              className="btn btn-outline-light btn-sm btn-md-lg px-3 px-md-4"
              onClick={() => setShowOwnerModal(true)}
              style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
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

        {/* Bottom Location Bar – Glass Style - Responsive */}
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x text-white text-center px-3 px-sm-4 px-md-5 py-2 py-sm-3 py-md-4 rounded-top-4"
          style={{
            zIndex: 2,
            width: "95%",
            maxWidth: "950px",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(20px) saturate(200%)",
            WebkitBackdropFilter: "blur(20px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderBottom: "none",
            boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.25)",
          }}
        >
          <p className="mb-0 fw-medium" style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)" }}>
            <i className="bi bi-geo-alt-fill me-2"></i>
            {turf.turf_location || "Location not specified"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4 py-md-5 px-3 px-sm-4">
        {/* Quick Info Cards - Responsive grid */}
        <div className="row g-3 mb-4 mb-md-5 text-center">
          <div className="col-12 col-sm-6 col-md-4">
            <div className="card shadow-sm p-3 h-100">
              <h6 className="text-muted mb-1" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>Max Players</h6>
              <h4 className="fw-bold text-success mb-0" style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}>10+</h4>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <div className="card shadow-sm p-3 h-100">
              <h6 className="text-muted mb-1" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>Timings</h6>
              <h5 className="fw-bold mb-0" style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}>6 AM – 11 PM</h5>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-4">
            <div className="card shadow-sm p-3 h-100">
              <h6 className="text-muted mb-1" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>Price Range</h6>
              <h5 className="fw-bold text-success mb-0" style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}>
                ₹{minPrice} – ₹{maxPrice}
              </h5>
            </div>
          </div>
        </div>

        {/* Sports, Amenities, and Dimensions - Responsive layout */}
        <div className="row g-3 g-md-4 mb-4 mb-md-5">
          {/* 1. Available Sports */}
          <div className={`col-12 col-lg-${hasBoxFootball ? '4' : '6'}`}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-light text-center py-3">
                <h5 className="mb-0 fw-bold" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>Available Sports</h5>
              </div>
              <div className="card-body p-3 p-md-4 d-flex flex-column">
                {Object.entries(turf.sport_specific_timing || {}).length > 0 ? (
                  <div className="flex-grow-1 d-flex flex-column gap-2 gap-md-3 overflow-auto" style={{ maxHeight: "400px" }}>
                    {Object.entries(turf.sport_specific_timing || {}).map(([sport, timing]: any) => {
                      const sportKey = sport.toLowerCase().trim();
                      const sportImage = sportImageMap[sportKey] || "/assets/default.png";

                      return (
                        <div key={sport} className="d-flex align-items-center gap-2 gap-md-3 p-2 bg-white rounded border border-light">
                          <img
                            src={sportImage}
                            alt={sport}
                            className="flex-shrink-0"
                            style={{ width: "clamp(40px, 8vw, 50px)", height: "clamp(40px, 8vw, 50px)", objectFit: "contain" }}
                          />
                          <div className="flex-grow-1 min-width-0">
                            <h6 className="fw-bold mb-1 text-capitalize text-truncate" style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                              {sport}
                            </h6>
                            <p className="mb-0 small text-muted" style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>
                              {timing?.opening_time || "—"} – {timing?.closing_time || "—"}
                            </p>
                          </div>
                          <span
                            className={`badge px-2 px-md-3 py-1 flex-shrink-0 ${
                              timing.sport_available ? "bg-success" : "bg-danger"
                            }`}
                            style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}
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
          <div className={`col-12 col-lg-${hasBoxFootball ? '4' : '6'}`}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-light text-center py-3">
                <h5 className="mb-0 fw-bold" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>Amenities</h5>
              </div>
              <div className="card-body p-3 p-md-4 d-flex flex-column">
                {turf.amenities && Array.isArray(turf.amenities) && turf.amenities.length > 0 ? (
                  <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "400px" }}>
                    <div className="d-flex flex-wrap gap-2">
                      {turf.amenities.map((amenity: string, index: number) => (
                        <span
                          key={index}
                          className="badge bg-info text-dark px-2 px-md-3 py-2 text-capitalize shadow-sm"
                          style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}
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
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-light text-center py-3">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>Turf Dimensions</h5>
                </div>
                <div className="card-body p-3 p-md-4 text-center d-flex flex-column justify-content-center">
                  <div className="row g-2 g-md-3">
                    <div className="col-4">
                      <div className="p-2 p-md-3 bg-light rounded">
                        <h6 className="text-muted mb-1 small" style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>Length</h6>
                        <h5 className="fw-bold mb-0" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>{turf.turf_length || "—"}</h5>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 p-md-3 bg-light rounded">
                        <h6 className="text-muted mb-1 small" style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>Breadth</h6>
                        <h5 className="fw-bold mb-0" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>{turf.turf_breadth || "—"}</h5>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 p-md-3 bg-light rounded">
                        <h6 className="text-muted mb-1 small" style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>Height</h6>
                        <h5 className="fw-bold mb-0" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>{turf.turf_height || "—"}</h5>
                      </div>
                    </div>
                  </div>

                  {!turf.turf_length && !turf.turf_breadth && !turf.turf_height && (
                    <p className="text-muted mt-3 mt-md-4 mb-0 small">Dimensions not specified</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Chart - Responsive table */}
        <div className="card border-0 shadow-sm mb-4 mb-md-5">
          <div
            className="card-header bg-light d-flex justify-content-between align-items-center py-3"
            data-bs-toggle="collapse"
            data-bs-target="#priceChart"
            style={{ cursor: "pointer" }}
          >
            <h5 className="mb-0 fw-bold" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>Day-split Timing and Price</h5>
            <span className="text-muted">▼</span>
          </div>

          <div id="priceChart" className="collapse show">
            <div className="card-body p-0">
              {Object.entries(turf.sport_specific_price || {}).map(([sport, priceObj]: [string, any]) => {
                const timing = turf.sport_specific_timing?.[sport] || {};

                return (
                  <div key={sport} className="p-3 p-md-4 border-bottom">
                    <h5 className="fw-bold text-success mb-3 text-capitalize" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>
                      {sport} {timing.court_count ? `(${timing.court_count} Courts)` : ""}
                    </h5>

                    {/* Mobile: Card layout */}
                    <div className="d-md-none">
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

                        const dayStart = timing.day_start_time || timing.opening_time || "—";
                        const dayEnd = timing.day_end_time || timing.closing_time || "—";
                        const nightStart = timing.night_start_time || "—";
                        const nightEnd = timing.night_end_time || "—";

                        const isAvailable = timing.sport_available !== false;

                        return (
                          <div 
                            key={day} 
                            className={`card mb-3 ${day === currentDay ? "border-success" : ""}`}
                          >
                            <div className={`card-header ${day === currentDay ? "bg-success-subtle" : "bg-light"}`}>
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold text-capitalize">{day}</h6>
                                <span className={`badge ${isAvailable ? "bg-success" : "bg-danger"}`}>
                                  {isAvailable ? "Available" : "Closed"}
                                </span>
                              </div>
                            </div>
                            <div className="card-body p-3">
                              <div className="row g-2">
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <small className="text-muted d-block mb-1">Day Price</small>
                                    <strong>{dayPrice}</strong>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <small className="text-muted d-block mb-1">Night Price</small>
                                    <strong>{nightPrice}</strong>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <small className="text-muted d-block mb-1">Day Timing</small>
                                    <small>{dayStart} – {dayEnd}</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="border rounded p-2">
                                    <small className="text-muted d-block mb-1">Night Timing</small>
                                    <small>{nightStart} – {nightEnd}</small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop/Tablet: Table layout */}
                    <div className="d-none d-md-block table-responsive">
                      <table className="table table-bordered table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>Day</th>
                            <th style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>Day Price</th>
                            <th style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>Day Timing</th>
                            <th style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>Night Price</th>
                            <th style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>Night Timing</th>
                            <th style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>Status</th>
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

                            const dayStart = timing.day_start_time || timing.opening_time || "—";
                            const dayEnd = timing.day_end_time || timing.closing_time || "—";
                            const nightStart = timing.night_start_time || "—";
                            const nightEnd = timing.night_end_time || "—";

                            const isAvailable = timing.sport_available !== false;

                            return (
                              <tr key={day}>
                                <td className={`fw-medium text-capitalize ${day === currentDay ? "bg-success-subtle" : ""}`} style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>
                                  {day}
                                </td>
                                <td style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>{dayPrice}</td>
                                <td style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>{dayStart} – {dayEnd}</td>
                                <td style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>{nightPrice}</td>
                                <td style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>{nightStart} – {nightEnd}</td>
                                <td>
                                  <span
                                    className={`badge px-2 px-md-3 py-2 ${
                                      isAvailable ? "bg-success" : "bg-danger"
                                    }`}
                                    style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}
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
                  <p className="mb-0">No pricing or timing information available for this turf.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location - Responsive iframe */}
        <div className="card border-0 shadow-sm mb-4 mb-md-5">
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold mb-3" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>📍 Location</h5>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(turf.turf_location || "")}&output=embed`}
              width="100%"
              height="300"
              className="d-md-none"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen
              loading="lazy"
              title="turf-location-mobile"
            ></iframe>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(turf.turf_location || "")}&output=embed`}
              width="100%"
              height="450"
              className="d-none d-md-block"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen
              loading="lazy"
              title="turf-location-desktop"
            ></iframe>
            <p className="text-muted mt-3 small text-center mb-0" style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}>
              {turf.turf_location || "Location details not available"}
            </p>
          </div>
        </div>

        {/* About Venue */}
        {turf.turf_description && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>📝 About Venue</h5>
              <p className="text-muted mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.7", fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>
                {turf.turf_description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* React-controlled Owner Modal - Responsive */}
      {showOwnerModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setShowOwnerModal(false)}
          />
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered mx-3 mx-sm-auto">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>
                    Channel Partner / Owner Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowOwnerModal(false)}
                  />
                </div>
                <div className="modal-body p-3 p-md-4">
                  {owner ? (
                    <div className="list-group list-group-flush">
                      <div className="list-group-item d-flex flex-column flex-sm-row justify-content-between gap-2">
                        <strong>Name</strong>
                        <span className="text-break">{owner.owner_name || "—"}</span>
                      </div>
                      <div className="list-group-item d-flex flex-column flex-sm-row justify-content-between gap-2">
                        <strong>Email</strong>
                        <span className="text-break">{owner.owner_email || "—"}</span>
                      </div>
                      <div className="list-group-item d-flex flex-column flex-sm-row justify-content-between gap-2">
                        <strong>Mobile</strong>
                        <span className="text-break">{owner.owner_mobile_number || "—"}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted py-3 mb-0">Owner information not available.</p>
                  )}
                </div>
                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary px-3 px-md-4" onClick={() => setShowOwnerModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        /* Responsive utilities */
        .min-width-0 {
          min-width: 0;
        }

        /* Smooth transitions */
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

        /* Button responsive sizing */
        @media (max-width: 576px) {
          .btn-sm {
            padding: 0.5rem 1rem;
          }
        }

        /* Carousel responsive controls */
        @media (max-width: 768px) {
          .carousel-control-prev,
          .carousel-control-next {
            width: 10%;
          }
        }

        /* Table responsive improvements */
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
        }

        /* Scrollbar styling */
        .overflow-auto::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Prevent text overflow */
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .text-break {
          word-break: break-word;
        }

        /* Card styling */
        .card {
          border-radius: 16px;
          overflow: hidden;
        }

        /* Badge responsive sizing */
        .badge {
          white-space: nowrap;
        }

        /* Modal responsive */
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TurfDetails;