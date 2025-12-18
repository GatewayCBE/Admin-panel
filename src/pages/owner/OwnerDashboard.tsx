// src/pages/owner/OwnerDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  getTurfsByOwner,
  getAllBookings,
} from "../../services/firestoreService";

type Turf = {
  id: string;
  turf_name?: string;
  location?: string;
};

type Booking = {
  turf_name?: string;
  booking_username?: string;
  court?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  paid_amount?: number;
  payment_status?: string;
  date?: string;
  owner_id?: string;
};

const OwnerDashboard: React.FC = () => {
  const ownerId = localStorage.getItem("user_id");
  const ownerName = localStorage.getItem("user_name");

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ─────────────────────────────────────────────
     LOAD OWNER DASHBOARD DATA
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!ownerId) return;

    const loadDashboard = async () => {
      setLoading(true);

      // 1️⃣ Fetch turfs owned by this owner
      const ownerTurfs = await getTurfsByOwner(ownerId);
      setTurfs(ownerTurfs);

      // 2️⃣ Fetch ALL bookings (via Cloud Function)
      const allBookings = await getAllBookings();

      // 3️⃣ Filter bookings belonging to this owner
      const ownerBookings = allBookings.filter(
        (b: Booking) => b.owner_id === ownerId
      );

      // 4️⃣ Filter TODAY bookings
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).replace(/ /g, "-"); // "14-Dec-2025"

      const todayOnly = ownerBookings.filter(
        (b: Booking) => b.date === todayStr
      );

      setTodayBookings(todayOnly);

      // 5️⃣ Calculate today earnings
      const earnings = todayOnly.reduce(
        (sum: number, b: Booking) => sum + (Number(b.paid_amount) || 0),
        0
      );
      setTodayEarnings(earnings);

      setLoading(false);
    };

    loadDashboard();
  }, [ownerId]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <h2 className="mb-4">
        Welcome, {ownerName} 👋
      </h2>

      {/* KPI CARDS */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h6>Total Turfs</h6>
              <h3>{turfs.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h6>Today’s Bookings</h6>
              <h3>{todayBookings.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h6>Today’s Earnings</h6>
              <h3>₹{todayEarnings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h6>Status</h6>
              <h3 className="text-success">Active</h3>
            </div>
          </div>
        </div>
      </div>

      {/* MY TURFS */}
      <div className="card shadow-sm mb-4">
        <div className="card-header fw-bold">My Turfs</div>
        <div className="card-body">
          {turfs.length === 0 ? (
            <p className="text-muted">No turfs added yet.</p>
          ) : (
            <ul className="list-group">
              {turfs.map((turf) => (
                <li key={turf.id} className="list-group-item">
                  <strong>{turf.turf_name || turf.id}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* TODAY BOOKINGS */}
      <div className="card shadow-sm">
        <div className="card-header fw-bold">Today’s Bookings</div>
        <div className="card-body p-0">
          {todayBookings.length === 0 ? (
            <p className="p-3 text-muted">No bookings today.</p>
          ) : (
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Turf</th>
                  <th>User</th>
                  <th>Court</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((b, i) => (
                  <tr key={i}>
                    <td>{b.turf_name}</td>
                    <td>{b.booking_username || "-"}</td>
                    <td>{b.court}</td>
                    <td>
                      {b.slot_start_time} - {b.slot_end_time}
                    </td>
                    <td>₹{b.paid_amount}</td>
                    <td>
                      <span className="badge bg-success">
                        {b.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
