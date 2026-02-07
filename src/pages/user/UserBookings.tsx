import React, { useEffect, useState } from "react";
import {
  getBookingsByUserMobile,
  UserBookingHistory,
} from "../../services/firestoreService";
import { parseDate } from "../../utils/dateUtils";
import { format } from "date-fns";

const UserBookingHistoryPage: React.FC = () => {
  const userMobile = localStorage.getItem("user_mobile_number") || "";
  const [bookings, setBookings] = useState<UserBookingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      const data = await getBookingsByUserMobile(userMobile);
      console.log('User Bookings history', data);
      
      setBookings(data);
      setLoading(false);
    };
    loadBookings();
  }, [userMobile]);

  // Parse any time format (24-hour or 12-hour) and convert to 12-hour display with range
  const getSlotRange = (slotTime: string): string => {
    // Handle 24-hour format (e.g., "22:00", "09:30")
    const match24 = slotTime.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = parseInt(match24[2], 10);
      
      const startTime = formatToAmPm(hours, minutes);
      const endTime = formatToAmPm((hours + 1) % 24, minutes);
      
      return `${startTime} – ${endTime}`;
    }
    
    // Handle 12-hour format (e.g., "8:00 PM", "10:30 AM")
    const match12 = slotTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = parseInt(match12[2], 10);
      const period = match12[3].toUpperCase();
      
      // Convert to 24-hour for calculation
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      
      const startTime = formatToAmPm(hours, minutes);
      const endTime = formatToAmPm((hours + 1) % 24, minutes);
      
      return `${startTime} – ${endTime}`;
    }
    
    // Fallback: return as-is if format is unrecognized
    return slotTime;
  };

  // Format hours (0-23) and minutes to 12-hour AM/PM format
  const formatToAmPm = (hours: number, minutes: number = 0): string => {
    const ampm = hours >= 12 ? "PM" : "AM";
    let h = hours % 12;
    if (h === 0) h = 12;
    return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-center text-muted mt-5">
        No bookings found
      </p>
    );
  }

  return (
    <div className="container py-5 mt-5">
      <h3 className="text-center text-success fw-bold">My Booking History</h3>
      {bookings.map((b) => (
        <div
          key={b.id}
          className="card mb-4 border-0 shadow-sm rounded-4"
        >
          {/* HEADER */}
          <div className="d-flex justify-content-between px-3 pt-3">
            <small className="text-muted">
              ID: {b.bookingId}
            </small>

            <span
              className={`badge rounded-pill px-3 ${
                b.paymentStatus === "PAID"
                  ? "bg-success"
                  : "bg-warning text-dark"
              }`}
            >
              {b.paymentStatus}
            </span>
          </div>

          {/* BODY */}
          <div className="card-body">
            <h5 className="fw-bold text-success mb-1">
              {b.turfName}
            </h5>

            <p className="mb-2 text-muted">
              👤 {b.userName}
            </p>

            {/* DATE + SLOT COUNT */}
            <div className="d-flex justify-content-between text-muted mb-3">
              <span>
                📅{" "}
                {(() => {
                  const d = parseDate(b.selectedDate);
                  return d ? format(d, "dd MMM yyyy") : b.selectedDate;
                })()}
              </span>
              <span>Slots: {b.slotCount}</span>
            </div>

            {/* BOOKED SLOT CHIPS WITH TIME RANGES */}
            <div className="p-3 bg-light rounded-3 mb-3">
              <strong className="text-primary">⏱ Booked Slots</strong>

              <div className="mt-2 d-flex flex-wrap gap-2">
                {b.slotList.map((slot, i) => (
                  <span 
                    key={i} 
                    className="badge rounded-pill border px-3 py-2 text-success bg-white"
                  >
                    {getSlotRange(slot)}
                  </span>
                ))}
              </div>
            </div>

            {/* AMOUNT + BOOKING TYPE */}
            <div className="d-flex justify-content-between align-items-end mt-3">
              <div>
                <small className="text-muted">Amount Paid</small>
                <h4 className="fw-bold text-success mb-0">
                  ₹{b.paidAmount}
                </h4>

                {b.unpaidAmount > 0 && (
                  <small className="text-warning">
                    Balance: ₹{b.unpaidAmount}
                  </small>
                )}
              </div>

              <div className="text-end">
                <small className="text-muted d-block">Booking Type</small>
                <span
                  className={`badge rounded-pill px-3 py-2 mt-1 ${
                    b.bookingType === "FULL"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}
                >
                  {b.bookingType}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserBookingHistoryPage;