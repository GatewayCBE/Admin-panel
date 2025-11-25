// src/pages/admin/TurfBookingsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getAllBookings } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";

const TurfBookingsPage: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const allBookings = await getAllBookings();
      const turfBookings = allBookings.filter((b) => b.turfId === turfId);
      setRawBookings(turfBookings);
      setLoading(false);
    })();
  }, [turfId]);

  const parseDate = (str: string): Date | null => {
    const match = str.match(/^(\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/i);
    if (!match) return null;
    const dateStr = `${match[2]} ${match[1]}, ${match[3]}`;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const toMidnight = (d: Date): Date => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const displayedBookings = useMemo(() => {
    let list = rawBookings;

    const from = fromDate ? toMidnight(new Date(fromDate)) : null;
    const to = toDate ? toMidnight(new Date(toDate)) : null;
    const effectiveTo = to || from; // ← crucial line

    if (from || to) {
      list = list.filter((b) => {
        const bd = parseDate(b.date);
        if (!bd) return false;
        const dateMidnight = toMidnight(bd);

        if (from && dateMidnight < from) return false;
        if (effectiveTo && dateMidnight > effectiveTo) return false;
        return true;
      });
    }

    return [...list].sort((a, b) => {
      const dateA = parseDate(a.date) || new Date();
      const dateB = parseDate(b.date) || new Date();
      const diff = dateB.getTime() - dateA.getTime();
      if (diff !== 0) return diff;
      return b.slot_start_time.localeCompare(a.slot_start_time);
    });
  }, [rawBookings, fromDate, toDate]);

  const isPaid = (status?: string) => status?.toLowerCase().includes("success");

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-70">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <AdminNavbar />
      <h2 className="fw-bold mb-2">Booked Slots - {turfId}</h2>
      <p className="text-muted mb-4">
        Total bookings shown: <strong>{displayedBookings.length}</strong>
        {displayedBookings.length !== rawBookings.length && ` (filtered from ${rawBookings.length})`}
      </p>

      <div className="card border-0 shadow-sm p-4 mb-4 bg-light">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-semibold">From Date</label>
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="col-md-5">
            <label className="form-label fw-semibold">To Date</label>
            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setFromDate(""); setToDate(""); }}>
              Clear
            </button>
          </div>
        </div>
        <small className="text-muted mt-2 d-block">
          Use the calendar picker. Leave both fields empty to see all bookings.
        </small>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">
            {fromDate || toDate ? "No bookings found in this date range" : "No bookings yet"}
          </h5>
        </div>
      ) : (
        <div className="row g-4">
          {displayedBookings.map((booking) => (
            // UNIQUE KEY FIX
            <div key={`${booking.booking_id}-${booking.slot_start_time}-${booking.date}`} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card shadow-sm border-0 h-100 hover-lift">
                <div
                  className="card-header text-white d-flex justify-content-between align-items-center"
                  style={{
                    background: isPaid(booking.payment_status)
                      ? "linear-gradient(135deg, #16a34a, #22c55e)"
                      : "linear-gradient(135deg, #ca8a04, #eab308)",
                  }}
                >
                  <h6 className="mb-0 fw-bold">Booked On: {booking.date}</h6>
                  <span className="badge bg-white text-dark fw-bold">
                    {isPaid(booking.payment_status) ? "Paid" : "Pending"}
                  </span>
                </div>

                <div className="card-body">
                  <p className="mb-1"><strong>User:</strong> {booking.booking_username}</p>
                  <p className="mb-1"><strong>Sport:</strong> {booking.sport}</p>
                  <p className="mb-1"><strong>Court:</strong> {booking.court}</p>
                  <p className="mb-3 fs-4 fw-bold text-primary">{booking.slot_start_time}</p>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-success fs-5">
                      ₹{Number(booking.paid_amount || 0).toLocaleString("en-IN")}
                    </span>
                    <small className="text-muted">ID: {booking.booking_id.slice(-8)}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style >{`
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important; }
      `}</style>
    </div>
  );
};

export default TurfBookingsPage;