// src/pages/admin/Turf/Turf.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTurf } from "./useTurf";

const Turf: React.FC = () => {
  const { turfs } = useTurf();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
    const [selectedSport, setSelectedSport] = useState<string>("all");

  const [contactInfo, setContactInfo] = useState<{
    name: string;
    phone: string;
  } | null>(null);

// ⭐ GROUPING (MOVE THIS UP)
const extractSports = (raw: string): string[] => {
  if (!raw) return [];

  return raw
    .toLowerCase()
    .replace(/&/g, ",")
    .replace(/\//g, ",")
    .split(",")
    .map(s => s.trim())
    .filter(s =>
      s.length >= 3 &&
      !/^\d+$/.test(s) &&
      !s.includes("road") &&
      !s.includes("rd") &&
      !s.includes("street") &&
      !s.includes("colony") &&
      !s.includes("nagar") &&
      !s.includes("salem") &&
      !s.includes("tamil") &&
      !s.includes("district")
    )
    .map(s => {
      if (s.includes("cricket")) return "Cricket";
      if (s.includes("football") || s === "footbal") return "Football";
      if (s.includes("badminton") || s === "batminton") return "Badminton";
      if (s.includes("pickle")) return "Pickleball";
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
};

// ✅ NOW use it
const filteredTurfs = turfs.filter(turf => {
  const matchesSearch =
    turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
    turf.turf_location.toLowerCase().includes(search.toLowerCase());

  const matchesSport =
    selectedSport === "all" ||
    turf.available_sports_list?.some((sport: string) =>
      extractSports(sport).includes(selectedSport)
    );

  return matchesSearch && matchesSport;
});


const availableSports = Array.from(
  new Set(
    turfs.flatMap(turf =>
      turf.available_sports_list?.flatMap((sport: string) =>
        extractSports(sport)
      ) || []
    )
  )
).sort();

  const bookNowTurfs = filteredTurfs.filter(
    (t) => t.booking_type === "book_now"
  );
  const callNowTurfs = filteredTurfs.filter(
    (t) => t.booking_type !== "book_now"
  );

  const sportIcon = (sport: string) => {
    const s = sport.toLowerCase();
    if (s.includes("football")) return "⚽";
    if (s.includes("cricket")) return "🏏";
    if (s.includes("badminton")) return "🏸";
    return "🎯";
  };

  const handleShowContact = (name: string, phone: string) => {
    setContactInfo({ name, phone });
  };

  const openInGoogleMaps = (address: string) => {
    if (!address) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`,
      "_blank"
    );
  };

  const renderTurfs = (list: typeof filteredTurfs) =>
    list.map((turf) => {
      const sports = turf.available_sports_list ?? [];
      const images = turf.turf_images ?? [];
      const bookingType = turf.booking_type ?? "call_now";
      const location = turf.turf_location ?? "";
      const phone = turf.turf_mobile_number ?? "";

      return (
        <div className="col-12 col-md-6 col-lg-4" key={turf.turf_id}>
  <div
    className={`card h-100 border-0 shadow-sm rounded-4 ${
      bookingType === "book_now"
        ? "border-top border-3 border-primary"
        : "border-top border-3 border-success"
    }`}
    style={{ transition: "transform 0.2s ease" }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.transform = "translateY(-4px)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.transform = "translateY(0)")
    }
  >
    {/* Image */}
    <img
      src={
        turf.turf_image_url ||
        images[0] ||
        "https://via.placeholder.com/400x200?text=No+Image"
      }
      className="w-100 rounded-top-4"
      alt={turf.turf_name}
      style={{ height: "180px", objectFit: "cover" }}
    />

    {/* Body */}
    <div className="card-body d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h6 className="fw-bold text-dark mb-0">
          {turf.turf_name}
        </h6>

        {/* SINGLE Badge */}
        <span
          className={`badge rounded-pill ${
            bookingType === "book_now"
              ? "bg-primary-subtle text-primary"
              : "bg-success-subtle text-success"
          }`}
        >
          {bookingType === "book_now" ? "Online" : "Call"}
        </span>
      </div>

      {/* Sports */}
      {sports.length > 0 && (
        <small className="text-muted mb-2">
          {sports.map((s, i) => (
            <span key={i} className="me-2">
              {sportIcon(s)} {s}
            </span>
          ))}
        </small>
      )}

      {/* Location */}
      <p
        className="text-muted small mb-3 mt-auto"
        style={{ cursor: "pointer" }}
        onClick={() => openInGoogleMaps(location)}
      >
        📍 {location}
      </p>

      {/* CTA */}
      {bookingType === "book_now" ? (
        <button
          className="btn btn-primary w-100 rounded-pill fw-semibold"
          onClick={() =>
            navigate(`/user/turfs/${turf.turf_id}/slots`)
          }
        >
          Book Slots
        </button>
      ) : (
        <button
          className="btn btn-success w-100 rounded-pill fw-semibold"
          data-bs-toggle="modal"
          data-bs-target="#contactModal"
          onClick={() =>
            handleShowContact(turf.turf_name, phone)
          }
        >
          Contact Turf
        </button>
      )}
    </div>
  </div>
</div>

      );
    });

  return (
    <div className="container py-2" style={{ maxWidth: "1200px" }}>
      <h2 className="text-center text-success fw-bold mb-4 display-5">
        Turf Details
      </h2>

      {/* Search */}
      <div className="row justify-content-center mb-4">
  <div className="col-md-10 col-lg-8">
    <div className="d-flex gap-3 align-items-center">
      
      {/* Search */}
      <div className="input-group input-group-lg shadow-sm rounded-pill flex-grow-1">
        <span className="input-group-text bg-white border-end-0 rounded-start-pill">
          🔍
        </span>
        <input
          type="text"
          className="form-control border-start-0 rounded-end-pill"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Sports Filter */}
<div className="dropdown">
  <button
    className="btn btn-outline-success btn-lg rounded-pill dropdown-toggle"
    data-bs-toggle="dropdown"
  >
    {selectedSport === "all" ? "Filter Sports" : selectedSport}
  </button>

  <ul className="dropdown-menu">
    <li>
      <button
        className="dropdown-item"
        onClick={() => setSelectedSport("all")}
      >
        All Sports
      </button>
    </li>

    {availableSports.map((sport) => (
      <li key={sport}>
        <button
          className="dropdown-item"
          onClick={() => setSelectedSport(sport)}
        >
          {sport}
        </button>
      </li>
    ))}
  </ul>
</div>



    </div>
  </div>
</div>

      {/* ONLINE BOOKING */}
{bookNowTurfs.length > 0 && (
  <div className="mb-5 p-3 rounded-4 bg-light">
    <h5 className="fw-bold text-primary mb-3">
      🗓️ Online Booking
    </h5>
    <div className="row g-4">
      {renderTurfs(bookNowTurfs)}
    </div>
  </div>
)}

{/* CALL ONLY */}
{callNowTurfs.length > 0 && (
  <div className="p-3 rounded-4 bg-light">
    <h5 className="fw-bold text-success mb-3">
      📞 Call to Book
    </h5>
    <div className="row g-4">
      {renderTurfs(callNowTurfs)}
    </div>
  </div>
)}

      {/* Contact Modal */}
      <div className="modal fade" id="contactModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow border-0 text-center">
            <div className="modal-header border-0">
              <button
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body pb-4">
              <h4 className="fw-bold text-success">
                {contactInfo?.name}
              </h4>
              <p className="fs-5 text-muted mb-4">
                {contactInfo?.phone}
              </p>
              <a
                href={`tel:${contactInfo?.phone}`}
                className="btn btn-success btn-lg rounded-pill"
              >
                📲 Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turf;
