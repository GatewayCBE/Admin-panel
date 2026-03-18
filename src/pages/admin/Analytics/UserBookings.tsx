import React, { useState, useEffect, useMemo } from "react";
import {
  getUserBookings,
  cancelBooking,
  canCancelBooking,
} from "../../../services/firestoreService";
import { auth } from "../../../firebase";
import { format } from "date-fns";
import { useAuth } from "../Turf/useAuth";

const UserBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // ✅ Search state
  const [searchQuery, setSearchQuery] = useState("");

  const { user, loading: authLoading, isAdmin, claims } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (authLoading) return;

      console.log("Admin status:", isAdmin);
      console.log("Current claims:", claims);

      if (!isAdmin) {
        setError("Admin access required to view all bookings");
        return;
      }
      try {
        setLoading(true);
        const data = await getUserBookings();
        setBookings(data);
        console.log("data", data);
      } catch (err: any) {
        console.error("Failed to load user bookings:", err);
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    console.log(
      "Current auth token claims:",
      auth.currentUser?.getIdTokenResult(),
    );
    fetchBookings();
  }, [authLoading, isAdmin]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr || "—";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PAID" || status === "paymentSuccess")
      return <span className="badge bg-success">Paid</span>;
    if (status === "CANCELLED")
      return <span className="badge bg-danger">Cancelled</span>;
    if (status === "PENDING")
      return <span className="badge bg-warning">Pending</span>;
    return <span className="badge bg-secondary">{status || "Unknown"}</span>;
  };

  const getDate = (b: any) => {
    const possible = [
      b.date,
      b.selectedDate,
      b.selecteddated,
      b.bookingDate,
      b.selected_date,
    ].find((val) => val && typeof val === "string" && val.trim());

    return possible || "—";
  };

  const getTurfName = (b: any) => {
    const possible = [
      b.turf_name,
      b.turfName,
      b.turf,
      b.turfName_,
      b.venueName,
    ].find((val) => val && typeof val === "string" && val.trim());

    return possible || "Unknown Turf";
  };

  const getSport = (b: any) => {
    const possible = [
      b.booked_sports_name,
      b.bookedSportsName,
      b.sport,
      b.sportsName,
      b.booked_sport,
    ].find((val) => val && typeof val === "string" && val.trim());

    return possible || "—";
  };

  const getTimeDisplay = (b: any) => {
    const start =
      [
        b.slot_start_time,
        b.slotStartTime,
        b.slotStart,
        b.startTime,
        b.slot_start,
      ].find((val) => val && typeof val === "string" && val.trim()) || "—";

    const end =
      [b.slot_end_time, b.slotEndTime, b.slotEnd, b.endTime, b.slot_end].find(
        (val) => val && typeof val === "string" && val.trim(),
      ) || "";

    if (start === "—" && end === "") return "—";
    return end ? `${start} – ${end}` : start;
  };

  const getTotal = (b: any) => {
    return b.total_amount ?? b.totalAmount ?? b.total ?? b.amount ?? 0;
  };

  const getStatus = (b: any) => {
    const s = (
      b.payment_status ||
      b.paymentStatus ||
      b.status ||
      b.bookingStatus ||
      ""
    ).toLowerCase();

    if (s.includes("success") || s === "paid" || s === "confirmed")
      return "Paid";
    if (s.includes("partial") || s === "partial") return "PARTIAL";
    if (s.includes("cancel")) return "Cancelled";
    return s.charAt(0).toUpperCase() + s.slice(1) || "Unknown";
  };

  // ✅ Filtered bookings based on search query
  const filteredBookings = useMemo(() => {
  if (!searchQuery.trim()) return bookings;

  const query = searchQuery.toLowerCase();

  return bookings.filter((booking) => {
    const turfName = getTurfName(booking).toLowerCase();
    const sport = getSport(booking).toLowerCase();
    const bookingId = String(booking.id).toLowerCase();

    return (
      turfName.includes(query) ||
      sport.includes(query) ||
      bookingId.includes(query)
    );
  });
}, [bookings, searchQuery]);

const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

const paginatedBookings = useMemo(() => {
  const start = (currentPage - 1) * rowsPerPage;
  return filteredBookings.slice(start, start + rowsPerPage);
}, [filteredBookings, currentPage]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  const exportCSV = () => {
  const headers = [
    "Booking ID",
    "Turf",
    "Sport",
    "Court",
    "Date",
    "Time",
    "Amount",
    "Status",
  ];

  const rows = filteredBookings.map((b) => [
    b.id,
    getTurfName(b),
    getSport(b),
    b.court || "court 1",
    formatDate(getDate(b)),
    getTimeDisplay(b),
    getTotal(b),
    getStatus(b),
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "bookings.csv");

  document.body.appendChild(link);
  link.click();
};

  return (
    <>
      <style>{`
        .search-wrapper {
          position: sticky;
          top: 70px;
          z-index: 100;
          background: white;
          padding: 1.5rem 0;
          border-radius: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          font-size: 1.25rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 3.5rem;
          border: 2px solid #79e988;
          border-radius: 1rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .search-input:focus {
          border-color: #198754;
          box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1);
        }

        .search-input::placeholder {
          color: #adb5bd;
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-search:hover {
          background: #f8f9fa;
          color: #212529;
        }

        .search-results-info {
          text-align: center;
          color: #6c757d;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 0.5rem;
        }

        .search-results-info strong {
          color: #198754;
          font-weight: 600;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .no-results-icon {
          font-size: 4rem;
          color: #dee2e6;
          margin-bottom: 1.5rem;
        }

        .no-results-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .no-results-text {
          color: #adb5bd;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .search-wrapper {
            top: 60px;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .search-input {
            font-size: 0.95rem;
            padding: 0.875rem 0.875rem 0.875rem 3rem;
          }

          .search-icon {
            font-size: 1.1rem;
            left: 1rem;
          }
          .table thead th {
            background: #e6f4ea;
            font-weight: 600;
          }

          .table td, .table th {
            vertical-align: middle;
          }

          .table-hover tbody tr:hover {
            background: #f8f9fa;
          }
        }
      `}</style>

      <div className="container py-5 mt-5">

  <div className="d-flex justify-content-between align-items-center">
    <h2 className="fw-bold text-success">User Bookings</h2>

    <button className="btn btn-success" onClick={exportCSV}>
      ⬇ Download Report
    </button>
  </div>


        {/* ✅ Search Box */}
        <div className="search-wrapper">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by turf name or sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ✅ Search Results Info */}
        {searchQuery && (
          <div className="search-results-info">
            Showing <strong>{filteredBookings.length}</strong> of{" "}
            <strong>{bookings.length}</strong> bookings
            {searchQuery && (
              <span>
                {" "}
                matching "<strong>{searchQuery}</strong>"
              </span>
            )}
          </div>
        )}

        {/* ✅ No Results State */}
        {filteredBookings.length === 0 && searchQuery && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3 className="no-results-title">No bookings found</h3>
            <p className="no-results-text">
              No bookings match your search for "{searchQuery}"
            </p>
            <button
              className="btn btn-outline-success mt-3"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* ✅ Empty State (no bookings at all) */}
        {bookings.length === 0 && !loading && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50" />
            <h5>No bookings found</h5>
            <p>Book your first turf slot today!</p>
          </div>
        )}

        {/* ✅ Bookings Grid */}
        {filteredBookings.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-success">
                <tr>
                  <th>Booking ID</th>
                  <th>Turf</th>
                  <th>Sport</th>
                  <th>Court</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedBookings.map((booking) => {
                  const canCancel =
                    canCancelBooking(booking) &&
                    booking.payment_status !== "CANCELLED";

                  return (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{getTurfName(booking)}</td>

                      <td>{getSport(booking)}</td>

                      <td>{booking.court || "court 1"}</td>

                      <td>{formatDate(getDate(booking))}</td>

                      <td>{getTimeDisplay(booking)}</td>

                      <td>
                        ₹{getTotal(booking)}
                        {booking.unpaid_amount > 0 && (
                          <small className="text-danger ms-2">
                            (₹{booking.unpaid_amount} pending)
                          </small>
                        )}
                      </td>

                      <td>{getStatusBadge(getStatus(booking))}</td>

                      <td>
                        {canCancel ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Cancelling
                              </>
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        ) : (
                          <p className="text-muted small">Not allowed</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-3">
  <div>
    Page {currentPage} of {totalPages}
  </div>

  <div className="btn-group">
    <button
      className="btn btn-outline-secondary btn-sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
    >
      Previous
    </button>

    <button
      className="btn btn-outline-secondary btn-sm"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
    >
      Next
    </button>
  </div>
</div>
      </div>
    </>
  );
};

export default UserBookings;
