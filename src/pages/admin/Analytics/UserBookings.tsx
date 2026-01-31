import React, { useState, useEffect } from "react";
import {
  getUserBookings,
  cancelBooking,
  canCancelBooking,
} from "../../../services/firestoreService";
import { auth } from "../../../firebase";
import { format } from "date-fns"; // optional – better date formatting
import { useAuth } from "../Turf/useAuth";

const UserBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
        // Use the new admin-specific function
        const data = await getUserBookings();
        setBookings(data);
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
    setBookings(prev => prev.filter(b => b.id !== bookingId));
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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50" />
        <h5>No bookings found</h5>
        <p>Book your first turf slot today!</p>
      </div>
    );
  }

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

  // Helper: Get turf name
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

  // Helper: Get sport
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

  // Helper: Get time range
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

  // Helper: Get total amount
  const getTotal = (b: any) => {
    return b.total_amount ?? b.totalAmount ?? b.total ?? b.amount ?? 0;
  };

  // Helper: Get status
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

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold text-success">My Bookings</h2>

      <div className="row g-4">
        {bookings.map((booking) => {
          const canCancel =
            canCancelBooking(booking) && booking.payment_status !== "CANCELLED";
          {
            !getDate(booking) && (
              <small className="text-warning">No date field</small>
            );
          }
          {
            !getTurfName(booking) && (
              <small className="text-warning">No turf name</small>
            );
          }
          {
            !getTimeDisplay(booking) ||
              (getTimeDisplay(booking) === "—" && (
                <small className="text-warning">No time fields</small>
              ));
          }

          return (
            <div key={booking.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-light">
                  <h6 className="mb-0 text-capitalize">
                    Turf: <strong>{getTurfName(booking)}</strong>
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <strong>Date:</strong> {formatDate(getDate(booking))}
                  </div>
                  <div className="mb-2">
                    <strong>Sport:</strong> {getSport(booking)}
                  </div>
                  <div className="mb-2">
                    <strong>Court:</strong>{" "}
                    {booking.court || booking.Court || "court 1"}
                  </div>
                  <div className="mb-2">
                    <strong>Time:</strong> {getTimeDisplay(booking)}
                  </div>
                  <div className="mb-2">
                    <strong>Amount:</strong> ₹{getTotal(booking)}
                    {booking.unpaid_amount > 0 && (
                      <small className="text-danger ms-2">
                        (₹{booking.unpaid_amount} pending)
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(getStatus(booking))}
                  </div>

                  {canCancel && (
                    <button
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Booking"
                      )}
                    </button>
                  )}

                  {!canCancel && booking.payment_status !== "CANCELLED" && (
                    <small className="text-muted d-block text-center mt-2">
                      Cancellation not allowed (past start time or already
                      cancelled)
                    </small>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserBookings;
