import React, { useEffect, useState } from "react";
import { getTurfsByOwner } from "../../../services/firestoreService";
import { getBookingsByTurfAndDate, markBookingFullyPaid } from "../../../services/firestoreService";

interface SlotBooking {
  id: string;
  turf_id: string;
  date: string;
  sport: string;
  court: string;
  slot_time: string;
  booking_username: string;
  booking_user_mobile: string;
  paid_amount: number;
  unpaid_amount: number;
  payment_status: string;
}

const ViewBookings: React.FC = () => {
  const ownerId = localStorage.getItem("user_id") || "";

  const [turfs, setTurfs] = useState<any[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<any>(null);

  // For Firestore
  const formatFirestoreDate = (date: Date) =>
    date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");

  // For input[type=date]
  const formatInputDate = (date: Date) => date.toISOString().split("T")[0];

  // State for input control
  const [bookingDateInput, setBookingDateInput] = useState<string>(
    formatInputDate(new Date())
  );

  // Firestore formatted date
  const bookingDate = formatFirestoreDate(new Date(bookingDateInput));

  const [bookings, setBookings] = useState<SlotBooking[]>([]);
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

  // Load bookings when turf or date changes
  useEffect(() => {
    if (!selectedTurf?.turf_id || !bookingDate) return;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching bookings for turf:", selectedTurf.turf_id, "Date:", bookingDate);

        const data = await getBookingsByTurfAndDate(selectedTurf.turf_id, bookingDate);

        console.log("Bookings fetched:", data);
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [selectedTurf?.turf_id, bookingDate]);

  const handleMarkPaid = async (booking: SlotBooking) => {
    if (!window.confirm("Mark this booking as fully paid?")) return;

    try {
      setLoading(true);
      await markBookingFullyPaid(booking);

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                paid_amount: b.paid_amount + b.unpaid_amount,
                unpaid_amount: 0,
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

  const totalPaid = bookings.reduce((sum, b) => sum + b.paid_amount, 0);
  const totalUnpaid = bookings.reduce((sum, b) => sum + b.unpaid_amount, 0);

  return (
    <div className="container mt-5 pt-5">
      <h3 className="text-center text-success fw-bold mb-4">View Bookings</h3>

      {/* Turf Selector */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Select Turf</label>
        <select
          className="form-select border-success"
          value={selectedTurf?.turf_id || ""}
          onChange={(e) => {
            const turf = turfs.find((t) => t.turf_id === e.target.value);
            setSelectedTurf(turf);
            setBookings([]); // Clear previous bookings
          }}
          disabled={loading || turfs.length === 0}
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
          value={bookingDateInput}
          min={new Date().toISOString().split("T")[0]}
          max={maxDate.toISOString().split("T")[0]}
          onChange={(e) => setBookingDateInput(e.target.value)}
          disabled={loading}
        />
        <small className="text-muted">
          Showing bookings for: {formatDate(bookingDateInput)}
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
      {!loading && !error && bookings.length === 0 && selectedTurf && (
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
            There are no bookings for {selectedTurf.turf_name} on {formatDate(bookingDateInput)}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && bookings.length > 0 && (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <small className="text-muted">Total Bookings</small>
                  <h3 className="text-primary mb-0">{bookings.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <small className="text-muted">Total Paid</small>
                  <h3 className="text-success mb-0">₹{totalPaid}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <small className="text-muted">Total Balance</small>
                  <h3 className="text-danger mb-0">₹{totalUnpaid}</h3>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Booking Cards */}
      {!loading &&
        bookings.map((booking) => (
          <div key={`${booking.sport}-${booking.court}-${booking.id}`} className="card shadow-sm mb-3 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-1 fw-bold">{booking.booking_username}</h6>
                  <small className="text-muted">
                    <i className="bi bi-telephone me-1"></i>
                    {booking.booking_user_mobile}
                  </small>
                </div>
                <span
                  className={`badge ${
                    booking.payment_status === "paid"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}
                >
                  {booking.payment_status === "paid" ? "PAID" : "ADVANCE"}
                </span>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <small className="text-muted d-block">Sport</small>
                  <span className="fw-semibold">{booking.sport}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Court</small>
                  <span className="fw-semibold">{booking.court}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Slot Time</small>
                  <span className="fw-semibold">{booking.slot_time}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Date</small>
                  <span className="fw-semibold">{booking.date}</span>
                </div>
              </div>

              <div className="row text-center bg-light rounded-3 p-3">
                <div className="col-6">
                  <small className="text-muted d-block">Paid Amount</small>
                  <h5 className="text-success mb-0">₹{booking.paid_amount}</h5>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Balance</small>
                  <h5 className="text-danger mb-0">₹{booking.unpaid_amount}</h5>
                </div>
              </div>

              {booking.unpaid_amount > 0 && (
                <button
                  className="btn btn-success w-100 mt-3"
                  onClick={() => handleMarkPaid(booking)}
                  disabled={loading}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Mark as Fully Paid
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ViewBookings;