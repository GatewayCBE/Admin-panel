// src/pages/admin/Turf/Turf.tsx
import React, { useState } from "react";
import { useTurf } from "./useTurf";

const Turf: React.FC = () => {
  const { turfs } = useTurf();
  const [search, setSearch] = useState("");
  const [contactInfo, setContactInfo] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  const filteredTurfs = turfs.filter((turf) =>
    turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
    turf.turf_location.toLowerCase().includes(search.toLowerCase())
  );

  const sportIcon = (sport: string) => {
    sport = sport.toLowerCase();
    if (sport.includes("football")) return "⚽";
    if (sport.includes("cricket")) return "🏏";
    if (sport.includes("badminton")) return "🏸";
    return "🎯";
  };

  const handleShowContact = (name: string, phone: string) => {
    setContactInfo({ name, phone });
  };

  const openInGoogleMaps = (address: string) => {
    if (!address) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  return (
    <div className="container py-1">
      <h2 className="text-center text-success fw-bold mb-4 display-5">Turf Details</h2>

      {/* Search Bar */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <div className="input-group input-group-lg shadow-sm rounded-pill">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill">🔍</span>
            <input
              type="text"
              className="form-control border-start-0 rounded-end-pill"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredTurfs.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-4 text-muted">No turf found matching your search</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTurfs.map((turf) => (
            <div className="col-12 col-md-6 col-lg-4" key={turf.turf_id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                
                {/* ───────────── Restored Image Section ───────────── */}
                {Array.isArray(turf.turf_images) && turf.turf_images.length > 1 ? (
                  <div id={`carousel-${turf.turf_id}`} className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                      {turf.turf_images.map((img: string, idx: number) => (
                        <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={idx}>
                          <img src={img} className="d-block w-100" alt={turf.turf_name} style={{ height: "200px", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target={`#carousel-${turf.turf_id}`} data-bs-slide="prev">
                      <span className="carousel-control-prev-icon"></span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target={`#carousel-${turf.turf_id}`} data-bs-slide="next">
                      <span className="carousel-control-next-icon"></span>
                    </button>
                  </div>
                ) : (
                  <img 
                    src={turf.turf_image_url || turf.turf_images?.[0] || "https://via.placeholder.com/400x200?text=No+Image"} 
                    className="w-100" 
                    alt={turf.turf_name} 
                    style={{ height: "200px", objectFit: "cover" }} 
                  />
                )}

                {/* ───────────── Simplified Card Body ───────────── */}
                <div className="card-body bg-white d-flex flex-column">
                  {/* 1. Name */}
                  <h5 className="fw-bold text-success mb-2">{turf.turf_name}</h5>

                  {/* 2. Sports Name */}
                  {turf.available_sports_list && (
                    <div className="mb-2">
                      {turf.available_sports_list.map((sport: string, i: number) => (
                        <span key={i} className="me-2 small text-muted">
                          {sportIcon(sport)} {sport}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 3. Location */}
                  <p 
                    className="text-muted small mb-4 mt-auto text-truncate" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => openInGoogleMaps(turf.turf_location)}
                    title={turf.turf_location}
                  >
                    <span className="text-primary me-1">📍</span> 
                    {turf.turf_location}
                  </p>

                  {/* 4. Contact Button */}
                  <button
                    className="btn btn-success w-100 rounded-pill fw-semibold"
                    data-bs-toggle="modal"
                    data-bs-target="#contactModal"
                    onClick={() => handleShowContact(turf.turf_name, turf.turf_mobile_number)}
                  >
                    📞 Contact Turf
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal remains the same */}
      <div className="modal fade" id="contactModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow border-0 text-center">
            <div className="modal-header border-0">
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body pb-4">
              <h4 className="fw-bold text-success">{contactInfo?.name}</h4>
              <p className="fs-5 text-muted mb-4">{contactInfo?.phone}</p>
              <div className="d-grid gap-2 px-4">
                <a href={`tel:${contactInfo?.phone}`} className="btn btn-success btn-lg rounded-pill shadow-sm">
                  📲 Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turf;