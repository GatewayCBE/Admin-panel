import React, { useEffect, useState } from "react";
import { getTurfsByOwner } from "../../../services/firestoreService";
import { getBookingsByTurfAndDate } from "../../../services/firestoreService";
import { groupBookings } from "../../../services/firestoreService";
import { markBookingFullyPaid } from "../../../services/firestoreService";

const ViewBookings: React.FC = () => {
  const ownerId = localStorage.getItem("user_id") || "";

  const [turfs, setTurfs] = useState<any[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Load turfs
  useEffect(() => {
    const loadTurfs = async () => {
      try {
        setLoading(true);
        const data = await getTurfsByOwner(ownerId);
        console.log("Loaded turfs:", data);
        setTurfs(data);
        if (data.length) setSelectedTurf(data[0]);
      } catch (err) {
        console.error("Error loading turfs:", err);
        setError("Failed to load turfs");
      } finally {
        setLoading(false);
      }
    };
    loadTurfs();
  }, [ownerId]);

  // Load bookings
  useEffect(() => {
    if (!selectedTurf || !bookingDate) return;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("Fetching bookings for:", {
          turfId: selectedTurf.turf_id,
          date: bookingDate
        });

        const slotDocs = await getBookingsByTurfAndDate(
          selectedTurf.turf_id,
          bookingDate
        );

        console.log("Fetched slot documents:", slotDocs);

        if (slotDocs.length === 0) {
          setBookings([]);
          console.log("No bookings found");
        } else {
          const grouped = groupBookings(slotDocs);
          console.log("Grouped bookings:", grouped);
          setBookings(grouped);
        }
      } catch (err) {
        console.error("Error loading bookings:", err);
        setError("Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [selectedTurf, bookingDate]);

  const handleMarkPaid = async (booking: any) => {
    try {
      setLoading(true);
      await markBookingFullyPaid(booking);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                paid_amount: b.total_amount,
                remaining_amount: 0,
                payment_status: "paid",
              }
            : b
        )
      );

      alert("Booking marked as fully paid successfully!");
    } catch (err) {
      console.error("Error marking as paid:", err);
      alert("Failed to mark booking as paid");
    } finally {
      setLoading(false);
    }
  };

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mt-5 pt-5">
      <h3 className="text-center text-success fw-bold mb-4">View Bookings</h3>

      {/* Turf Selector */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Select Turf</label>
        <select
          className="form-select border-success"
          value={selectedTurf?.turf_id || ""}
          onChange={(e) =>
            setSelectedTurf(turfs.find((t) => t.turf_id === e.target.value))
          }
          disabled={loading}
        >
          {turfs.length === 0 && <option>No turfs available</option>}
          {turfs.map((turf) => (
            <option key={turf.turf_id} value={turf.turf_id}>
              {turf.turf_name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label className="form-label fw-semibold">Select Date</label>
        <input
          type="date"
          className="form-control border-success"
          value={bookingDate}
          min={new Date().toISOString().split("T")[0]}
          max={maxDate.toISOString().split("T")[0]}
          onChange={(e) => setBookingDate(e.target.value)}
          disabled={loading}
        />
        <small className="text-muted">
          Showing bookings for: {formatDate(bookingDate)}
        </small>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* No Bookings State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <svg
              width="64"
              height="64"
              fill="currentColor"
              className="text-muted"
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z" />
            </svg>
          </div>
          <h5 className="text-muted">No bookings found</h5>
          <p className="text-muted">
            There are no bookings for {formatDate(bookingDate)}
          </p>
        </div>
      )}

      {/* Bookings Count */}
      {!loading && bookings.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted mb-0">
            <strong>{bookings.length}</strong> booking{bookings.length > 1 ? "s" : ""} found
          </p>
        </div>
      )}

      {/* Booking Cards */}
      {!loading &&
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="card shadow-sm mb-4 border-0 rounded-4"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="text-muted mb-1">
                    Booking #{booking.id.slice(-8)}
                  </h6>
                  <span className="badge bg-info text-dark">
                    {booking.sport} - {booking.court}
                  </span>
                </div>
                <span
                  className={`badge ${
                    booking.payment_status === "paid"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  } fs-6 px-3 py-2`}
                >
                  {booking.payment_status === "paid" ? "✓ PAID" : "⏳ ADVANCE"}
                </span>
              </div>

              <h5 className="fw-bold mt-2">{booking.booking_user_name}</h5>
              <p className="text-muted mb-1">
                📱 {booking.booking_user_mobile}
              </p>
              <p className="text-muted mb-3">
                📅 {formatDate(booking.date)}
              </p>

              <h6 className="fw-bold mb-2">Booked Time Slots:</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {booking.booked_slots.map((slot: string, i: number) => (
                  <span
                    key={i}
                    className="badge bg-light text-success border border-success px-3 py-2"
                    style={{ fontSize: "14px" }}
                  >
                    🕐 {slot}
                  </span>
                ))}
              </div>

              {/* Amount Section */}
              <div className="row text-center bg-light rounded-3 p-3 mb-3">
                <div className="col-4">
                  <small className="text-muted">Total Amount</small>
                  <h5 className="mb-0 fw-bold">₹{booking.total_amount}</h5>
                </div>
                <div className="col-4">
                  <small className="text-muted">Paid</small>
                  <h5 className="mb-0 fw-bold text-success">
                    ₹{booking.paid_amount}
                  </h5>
                </div>
                <div className="col-4">
                  <small className="text-muted">Balance</small>
                  <h5 className="mb-0 fw-bold text-danger">
                    ₹{booking.remaining_amount}
                  </h5>
                </div>
              </div>

              {/* Mark as Paid Button */}
              {booking.remaining_amount > 0 && (
                <button
                  className="btn btn-success w-100 py-2 fw-semibold"
                  onClick={() => handleMarkPaid(booking)}
                  disabled={loading}
                >
                  💳 Mark as Fully Paid (₹{booking.remaining_amount})
                </button>
              )}

              {booking.payment_status === "paid" && (
                <div className="alert alert-success mb-0 text-center" role="alert">
                  ✓ Fully Paid
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ViewBookings;