import React, { useEffect, useState } from "react";
import { getTurfsByOwner, groupBookings } from "../../../services/firestoreService";
import { getBookingsByTurfAndDate, markBookingFullyPaid } from "../../../services/firestoreService";
import badmintonImg from "../../../assets/badminton.png";
import cricketImg from "../../../assets/boxcricket_football.png";
import pickleImg from "../../../assets/PickleImg.png";

export interface SlotBooking {
  id: string;
  turfId: string;
  date: string;
  bookedSportsName: string;
  court: string;
  slots?: string[];
  slotStartTime?: string;
  slotEndTime?: string;
  bookingUsername: string;
  bookingUserMobile: string;
  paidAmount: number;
  unpaidAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  totalAmount: number;
  paymentStatus: string;
  createdBy?: string;
  docIds?: string[];
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
    if (!selectedTurf?.turf_id) return;

    const loadBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const raw = await getBookingsByTurfAndDate(
          selectedTurf.turf_id,
          bookingDate
        );

        console.log("📦 Raw bookings:", raw);
        // ✅ FILTER CANCELLED BOOKINGS HERE
const active = raw.filter((b: any) => {
  const status = (b.paymentStatus || "").toUpperCase();
  return status !== "CANCELLED" && !b.cancelledAt;
});

        const grouped = groupBookings(raw);
        console.table(
  grouped.map(b => ({
    id: b.id,
    sport: b.bookedSportsName,
    totalPaid: b.totalPaid,
    totalUnpaid: b.totalUnpaid,
    totalAmount: b.totalAmount
  }))
);
        
        setBookings(grouped);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [selectedTurf, bookingDate]);

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
                totalPaid: b.totalAmount,
                totalUnpaid: 0,
                paymentStatus: "paid",
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

  // Get sport image based on sport name
  const getSportImage = (sportName?: string): string => {
  if (!sportName) {
    return "https://via.placeholder.com/60x60/67a521/ffffff?text=Sport";
  }

  const sport = sportName.toLowerCase().trim();

  if (sport.includes("cricket") || sport.includes("box")) {
    return cricketImg;
  }
  if (sport.includes("football")) {
    return cricketImg;
  }
  if (sport.includes("badminton")) {
    return badmintonImg;
  }
  if (sport.includes("pickle")) {
    return pickleImg;
  }

  return "https://via.placeholder.com/60x60/67a521/ffffff?text=Sport";
};

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ Calculate totals from grouped bookings (already calculated correctly)
  const totalPaid = bookings.reduce(
  (sum, b) => sum + Number(b.totalPaid || 0),
  0
);

const totalUnpaid = bookings.reduce(
  (sum, b) => sum + Number(b.totalUnpaid || 0),
  0
);

  return (
    <>
      <style>{`
        .view-bookings-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 5rem 0 2rem 0;
        }

        @media (max-width: 768px) {
          .view-bookings-container {
            padding: 4rem 0 1rem 0;
          }
        }

        .bookings-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (min-width: 768px) {
          .bookings-wrapper {
            padding: 0 2rem;
          }
        }

        .bookings-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .bookings-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #198754;
          margin-bottom: 0.5rem;
        }

        .form-group-custom {
          margin-bottom: 1.5rem;
        }

        .form-label-custom {
          display: block;
          font-weight: 600;
          font-size: 0.95rem;
          color: #212529;
          margin-bottom: 0.5rem;
        }

        .form-select-custom,
        .form-input-custom {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #198754;
          border-radius: 0.75rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-select-custom:focus,
        .form-input-custom:focus {
          outline: none;
          border-color: #157347;
          box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1);
        }

        .form-select-custom:disabled,
        .form-input-custom:disabled {
          background: #e9ecef;
          cursor: not-allowed;
        }

        .form-hint {
          font-size: 0.875rem;
          color: #6c757d;
          margin-top: 0.5rem;
          display: block;
        }

        .loading-container {
          text-align: center;
          padding: 3rem 1rem;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #198754;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #6c757d;
          font-size: 1rem;
        }

        .alert-custom {
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          border: none;
        }

        .alert-danger {
          background: #f8d7da;
          color: #842029;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          opacity: 0.5;
        }

        .empty-state-title {
          font-size: 1.5rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .empty-state-text {
          color: #adb5bd;
          font-size: 1rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 576px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .summary-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          text-align: center;
          transition: transform 0.2s ease;
        }

        .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .summary-label {
          font-size: 0.875rem;
          color: #6c757d;
          display: block;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-value {
          font-size: clamp(1.75rem, 4vw, 2rem);
          font-weight: 700;
          margin: 0;
        }

        .summary-value.primary {
          color: #0d6efd;
        }

        .summary-value.success {
          color: #198754;
        }

        .summary-value.danger {
          color: #dc3545;
        }

        .booking-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease;
        }

        .booking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        @media (max-width: 576px) {
          .booking-card {
            padding: 1rem;
          }
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        @media (max-width: 576px) {
          .booking-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .booking-user-section {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex: 1;
        }

        .profile-icon-wrapper {
          width: 50px;
          height: 50px;
          min-width: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(25, 135, 84, 0.3);
        }

        @media (max-width: 576px) {
          .profile-icon-wrapper {
            width: 45px;
            height: 45px;
            min-width: 45px;
            font-size: 1.25rem;
          }
        }

        .booking-user-info {
          flex: 1;
          min-width: 0;
        }

        .booking-user-info h6 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #212529;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 576px) {
          .booking-user-info h6 {
            font-size: 1rem;
          }
        }

        .booking-mobile {
          font-size: 0.875rem;
          color: #6c757d;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .booking-status-badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .badge-paid {
          background: #d1e7dd;
          color: #0f5132;
        }

        .badge-advance {
          background: #f7eb7a;
          color: #eb3c10;
        }
          .badge-cancelled {
  background: #e9ecef;
  color: #495057;
}

        .sport-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .sport-image {
          width: 60px;
          height: 60px;
          min-width: 60px;
          object-fit: contain;
          border-radius: 0.5rem;
          background: white;
          padding: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 576px) {
          .sport-image {
            width: 50px;
            height: 50px;
            min-width: 50px;
          }
        }

        .sport-details {
          flex: 1;
          min-width: 0;
        }

        .sport-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #212529;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 576px) {
          .sport-name {
            font-size: 1rem;
          }
        }

        .court-name {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .booking-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 576px) {
          .booking-details {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #212529;
        }

        .slots-section {
          margin-bottom: 1.5rem;
        }

        .slots-label {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.75rem;
          display: block;
        }

        .slots-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .slot-badge {
          background: #e7f5ec;
          color: #198754;
          border: 1px solid #198754;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @media (max-width: 576px) {
          .slot-badge {
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
          }
        }

        .payment-summary {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 576px) {
          .payment-summary {
            padding: 1rem;
          }
        }

        .payment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          text-align: center;
        }

        @media (max-width: 576px) {
          .payment-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .payment-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .payment-label {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .payment-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        @media (max-width: 576px) {
          .payment-value {
            font-size: 1.25rem;
          }
        }

        .payment-value.total {
          color: black;
        }

        .payment-value.paid {
          color: #198754;
        }

        .payment-value.balance {
          color: #dc3545;
        }

        .mark-paid-button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .mark-paid-button:hover {
          background: linear-gradient(135deg, #157347 0%, #146c43 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
        }

        .mark-paid-button:active {
          transform: translateY(0);
        }

        .mark-paid-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 576px) {
          .booking-card {
            border-radius: 0.75rem;
          }
          
          .summary-card {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="view-bookings-container">
        <div className="bookings-wrapper">
          <div className="bookings-header">
            <h1 className="bookings-title">View Bookings</h1>
          </div>

          <div className="form-group-custom">
            <label className="form-label-custom">Select Turf</label>
            <select
              className="form-select-custom"
              value={selectedTurf?.turf_id || ""}
              onChange={(e) => {
                const turf = turfs.find((t) => t.turf_id === e.target.value);
                setSelectedTurf(turf);
                setBookings([]);
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

          <div className="form-group-custom">
            <label className="form-label-custom">Select Date</label>
            <input
              type="date"
              className="form-input-custom"
              value={bookingDateInput}
              onChange={(e) => setBookingDateInput(e.target.value)}
              disabled={loading}
            />
            <small className="form-hint">
              Showing bookings for: {formatDate(bookingDateInput)}
            </small>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading bookings...</p>
            </div>
          )}

          {error && (
            <div className="alert-custom alert-danger">
              {error}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && selectedTurf && (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z" />
              </svg>
              <h3 className="empty-state-title">No bookings found</h3>
              <p className="empty-state-text">
                There are no bookings for {selectedTurf.turf_name} on {formatDate(bookingDateInput)}
              </p>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-label">Total Bookings</span>
                <h3 className="summary-value">{bookings.length}</h3>
              </div>
              <div className="summary-card">
                <span className="summary-label">Total Paid</span>
                <h3 className="summary-value success">₹{totalPaid}</h3>
              </div>
              <div className="summary-card">
                <span className="summary-label">Total Balance</span>
                <h3 className="summary-value danger">₹{totalUnpaid}</h3>
              </div>
            </div>
          )}

          {!loading &&
            bookings.map((booking, index) => {
              // ✅ Use values directly from grouped booking - NO CALCULATION
              const paidAmount = booking.totalPaid;
              const balanceAmount = booking.totalUnpaid;
              const totalAmount = booking.totalAmount;

              const firstLetter = booking.bookingUsername?.charAt(0).toUpperCase() || "U";
              const sportImage = getSportImage(booking.bookedSportsName ?? "Unknown Sport");

              return (
                <div key={`${booking.id}-${index}`} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-user-section">
                      <div className="profile-icon-wrapper">
                        {firstLetter}
                      </div>
                      <div className="booking-user-info">
                        <h6>{booking.bookingUsername}</h6>
                        <div className="booking-mobile">
                          <span>{booking.bookingUserMobile}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`booking-status-badge ${
                        booking.paymentStatus === "paid"
                          ? "badge-paid"
                          : "badge-advance"
                      }`}
                    >
                      {booking.paymentStatus === "paid" ? "PAID" : "ADVANCE"}
                      {booking.createdBy && ` (${booking.createdBy})`}
                    </span>
                  </div>

                  <div className="sport-section">
                    <img
                      src={sportImage}
                      alt={booking.bookedSportsName}
                      className="sport-image"
                    />
                    <div className="sport-details">
                      <div className="sport-name">
                        {booking.bookedSportsName || "Unknown Sport"}
                      </div>
                      <div className="court-name">
                        Court: {booking.court}
                      </div>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{booking.date}</span>
                    </div>
                  </div>

                  {booking.slots && booking.slots.length > 0 && (
                    <div className="slots-section">
                      <span className="slots-label">Booked Slots ({booking.slots.length})</span>
                      <div className="slots-container">
                        {booking.slots.map((slot: string, i: number) => (
                          <span key={i} className="slot-badge">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="payment-summary">
                    <div className="payment-grid">
                      <div className="payment-item">
  <span className="payment-label">Total</span>
  <span className="payment-value total">₹{Number(totalAmount || 0)}</span>
</div>
<div className="payment-item">
  <span className="payment-label">Paid</span>
  <span className="payment-value paid">₹{Number(paidAmount || 0)}</span>
</div>
<div className="payment-item">
  <span className="payment-label">Balance</span>
  <span className="payment-value balance">₹{Number(balanceAmount || 0)}</span>
</div>
                    </div>
                  </div>

                  {balanceAmount > 0 && (
                    <button
                      className="mark-paid-button"
                      onClick={() => handleMarkPaid(booking)}
                      disabled={loading}
                    >
                      <span>💳</span>
                      <span>Mark as Fully Paid</span>
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default ViewBookings;