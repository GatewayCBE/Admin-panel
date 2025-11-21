// src/pages/admin/TurfBookingsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllBookings } from "../../../services/firestoreService";

const TurfBookingsPage: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getAllBookings();
      const filtered = all.filter((b) => b.turfId === turfId);
      setBookings(filtered);
      setLoading(false);
    })();
  }, [turfId]);

  // Apply filters & sorting
  const filteredBookings = useMemo(() => {
    let data = [...bookings];

    // Status Filter
    if (statusFilter !== "All") {
      data = data.filter((b) =>
        statusFilter === "Paid"
          ? b.payment_status?.includes("success")
          : !b.payment_status?.includes("success")
      );
    }

    // Date Range Filter
    if (dateRange.from) data = data.filter((b) => b.date >= dateRange.from);
    if (dateRange.to) data = data.filter((b) => b.date <= dateRange.to);

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (b) =>
          (b.booking_username || "").toLowerCase().includes(lower) ||
          b.booking_id.toLowerCase().includes(lower)
      );
    }

    // Sorting
    data.sort((a, b) => {
      if (sortOption === "Amount High") return (b.paid_amount || 0) - (a.paid_amount || 0);
      if (sortOption === "Amount Low") return (a.paid_amount || 0) - (b.paid_amount || 0);

      const dateA = `${a.date} ${a.slot_start_time}`;
      const dateB = `${b.date} ${b.slot_start_time}`;
      return sortOption === "Oldest" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    });

    return data;
  }, [bookings, statusFilter, sortOption, searchTerm, dateRange]);

  // Stats
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0);
  const topUser = (
  Object.entries(
    filteredBookings.reduce((acc, cur) => {
      const username = cur.booking_username || "Guest";
      acc[username] = (acc[username] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ) as [string, number][]
).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

const peakTime = (
  Object.entries(
    filteredBookings.reduce((acc, cur) => {
      acc[cur.slot_start_time] = (acc[cur.slot_start_time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ) as [string, number][]
).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }}></div>
          <p className="mt-3 fs-4 text-muted">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 px-4" style={{ background: "#f8f9fc", minHeight: "100vh" }}>
      {/* Back + Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary rounded-pill px-4">
          ← Back
        </button>
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Booked Slots</h1>
          <p className="text-muted mb-0">
            Turf ID: <span className="fw-semibold text-primary">{turfId}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <select className="form-select w-auto" onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>

        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search User / Booking ID"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select className="form-select w-auto" onChange={(e) => setSortOption(e.target.value)}>
          <option>Newest</option>
          <option>Oldest</option>
          <option>Amount High</option>
          <option>Amount Low</option>
        </select>

        <input
          type="date"
          className="form-control w-auto"
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
        />

        <input
          type="date"
          className="form-control w-auto"
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
        />

        <button
          className={`btn btn-sm ${viewType === "grid" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setViewType("grid")}
        >
          🔳 Grid
        </button>
        <button
          className={`btn btn-sm ${viewType === "list" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setViewType("list")}
        >
          📃 List
        </button>
      </div>

      {/* Summary Insights */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h6>Top User</h6>
            <p className="fw-bold">{topUser}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3">
            <h6>Most Booked Time</h6>
            <p className="fw-bold">{peakTime}</p>
          </div>
        </div>
      </div>

      {/* Bookings Display */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">Empty</div>
          <h4 className="text-muted">No bookings match your filters</h4>
        </div>
      ) : viewType === "grid" ? (
        <div className="row g-3">
          {filteredBookings.map((b) => (
            <div key={b.booking_id} className="col-sm-6 col-lg-3 col-xxl-2">
              <BookingCard booking={b} />
            </div>
          ))}
        </div>
      ) : (
        <ul className="list-group">
          {filteredBookings.map((b) => (
            <li key={b.booking_id} className="list-group-item d-flex justify-content-between">
              <span>
                <strong>{b.booking_username}</strong> – {b.date} at {b.slot_start_time}
              </span>
              <span>₹{b.paid_amount}</span>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

// Reusable Card Component
const BookingCard = ({ booking }: { booking: any }) => (
  <div className="card border-0 shadow-sm rounded-4 overflow-hidden hover-lift h-100">
    <div
      className="card-header text-white py-2"
      style={{
        background: booking.payment_status?.includes("success")
          ? "linear-gradient(135deg,#16a34a,#22c55e)"
          : "linear-gradient(135deg,#ca8a04,#eab308)",
      }}
    >
      <div className="d-flex justify-content-between">
        <strong>{booking.date}</strong>
        <span className="badge bg-white text-dark">{booking.payment_status.includes("success") ? "Paid" : "Pending"}</span>
      </div>
    </div>
    <div className="card-body">
      <p><strong>User:</strong> {booking.booking_username}</p>
      <p><strong>Sport:</strong> {booking.sport} / {booking.court}</p>
      <p><strong>Time:</strong> {booking.slot_start_time}</p>
      <p className="fw-bold text-success fs-5">₹{booking.paid_amount}</p>
    </div>
  </div>
);

export default TurfBookingsPage;
