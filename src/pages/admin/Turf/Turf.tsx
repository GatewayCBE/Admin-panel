// src/pages/admin/Turf/Turf.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTurf } from "./useTurf";

const Turf: React.FC = () => {
  const { turfs } = useTurf();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Filter logic
  const filteredTurfs = turfs.filter((turf) =>
    turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
    turf.turf_location.toLowerCase().includes(search.toLowerCase()) ||
    turf.owner_id.toLowerCase().includes(search.toLowerCase())
  );

  // Helper: Get minimum price from sport_specific_price
  const getStartingPrice = (priceObj: any): number | null => {
    if (!priceObj || typeof priceObj !== "object") return null;

    const allPrices: number[] = [];

    Object.values(priceObj).forEach((sport: any) => {
      Object.values(sport).forEach((daySlot: any) => {
        if (daySlot.day) allPrices.push(daySlot.day);
        if (daySlot.night) allPrices.push(daySlot.night);
      });
    });

    return allPrices.length ? Math.min(...allPrices) : null;
  };

  // Helper: Convert amenity text to emoji
  const amenityEmoji = (a: string) => {
    if (a.toLowerCase().includes("parking")) return "🚗";
    if (a.toLowerCase().includes("drinking")) return "💧";
    if (a.toLowerCase().includes("rest")) return "🚻";
    if (a.toLowerCase().includes("cctv")) return "📹";
    if (a.toLowerCase().includes("music")) return "🎵";
    return "✔️";
  };

  // Helper: Convert sports to icons
  const sportIcon = (sport: string) => {
    sport = sport.toLowerCase();
    if (sport.includes("football")) return "⚽";
    if (sport.includes("cricket")) return "🏏";
    if (sport.includes("badminton")) return "🏸";
    return "🎯";
  };

  return (
    <div className="container py-1">
      {/* Page Title */}
      <h2 className="text-center text-success fw-bold mb-4 display-5">
        Turf Details
      </h2>

      {/* Search Bar */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <div className="input-group input-group-lg shadow-sm rounded-pill">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill">🔍</span>
            <input
              type="text"
              className="form-control border-start-0 rounded-end-pill"
              placeholder="Search by turf name, location or owner ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* No results */}
      {filteredTurfs.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">😔</div>
          <p className="fs-4 text-muted">No turf found matching your search</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTurfs.map((turf) => {
            const startingPrice = getStartingPrice(turf.sport_specific_price);
            const maxCapacity = turf.sports_specific_person_count
              ? Math.max(...Object.values(turf.sports_specific_person_count))
              : null;

            return (
              <div className="col-12 col-md-6 col-lg-4" key={turf.turf_id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">

                  {/* ───────────── Image Section with Carousel ───────────── */}
                  {Array.isArray(turf.turf_images) && turf.turf_images.length > 1 ? (
                    <div
                      id={`carousel-${turf.turf_id}`}
                      className="carousel slide"
                      data-bs-ride="carousel"
                    >
                      <div className="carousel-inner">
                        {turf.turf_images.map((img: string, idx: number) => (
                          <div
                            className={`carousel-item ${idx === 0 ? "active" : ""}`}
                            key={idx}
                          >
                            <img
                              src={img}
                              className="d-block w-100"
                              alt={turf.turf_name}
                              style={{ height: "200px", objectFit: "cover" }}
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target={`#carousel-${turf.turf_id}`}
                        data-bs-slide="prev"
                      >
                        <span className="carousel-control-prev-icon"></span>
                      </button>

                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target={`#carousel-${turf.turf_id}`}
                        data-bs-slide="next"
                      >
                        <span className="carousel-control-next-icon"></span>
                      </button>
                    </div>
                  ) : turf.turf_image_url ? (
                    <img
                      src={turf.turf_image_url}
                      className="w-100"
                      alt={turf.turf_name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="d-flex justify-content-center align-items-center bg-light"
                      style={{ height: "200px" }}
                    >
                      <span className="fs-1">⚽</span>
                    </div>
                  )}

                  {/* Badge */}
                  <span className="badge bg-primary position-absolute top-0 start-0 m-2 rounded-pill">
                    New Turf
                  </span>

                  {/* ───────────── Card Body ───────────── */}
                  <div className="card-body bg-white">

                    {/* Turf Name */}
                    <h5 className="fw-bold text-success">{turf.turf_name}</h5>

                    {/* Description (shortened) */}
                    {turf.turf_description && (
                      <p className="small text-muted mb-2">
                        {turf.turf_description.slice(0, 80)}...
                      </p>
                    )}

                    {/* Starting Price */}
                    {startingPrice && (
                      <p className="text-dark mb-2">
                        💰 Starting from <strong>₹{startingPrice}</strong> / hour
                      </p>
                    )}

                    {/* Sports Icons */}
                    {turf.available_sports_list && (
                      <p className="text-muted small mb-2">
                        {turf.available_sports_list.map((sport: string, i: number) => (
                          <span key={i} className="me-2">
                            {sportIcon(sport)} {sport}
                          </span>
                        ))}
                      </p>
                    )}

                    {/* Amenities (max 3) */}
                    {turf.amenities && (
                      <p className="text-muted small mb-2">
                        {turf.amenities.slice(0, 3).map((a: string, i: number) => (
                          <span key={i} className="badge bg-light text-dark border me-2">
                            {amenityEmoji(a)} {a}
                          </span>
                        ))}
                      </p>
                    )}

                    {/* Player Capacity */}
                    {maxCapacity && (
                      <p className="text-muted small mb-2">
                        👥 Up to {maxCapacity} players
                      </p>
                    )}

                    {/* Location (short) */}
                    <p className="text-muted small mb-3">
                      📍 {turf.turf_location.split(",")[0]}
                    </p>

                    {/* CTA */}
                    <button
                      className="btn btn-success w-100 rounded-pill fw-semibold"
                      onClick={() => navigate(`/user/turfs/${turf.turf_id}`)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Turf;
