
import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

interface OverviewReportProps {
  global: any;
  daily: any[];
  turfs: any[];
  users: any[];
}

/* ─────────────────────────────────────────────
   MINI SPARKLINE COMPONENT
────────────────────────────────────────────── */
const Sparkline = ({
  data,
  color,
}: {
  data: number[];
  color: string;
}) => {
  return (
    <div style={{ height: 60 }}>
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: color,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        }}
      />
    </div>
  );
};

const OverviewReport: React.FC<OverviewReportProps> = ({
  global,
  daily,
  turfs,
  users,
}) => {
  const revenueTrend = daily.map((d) => d.total_revenue ?? 0);
  const bookingTrend = daily.map((d) => d.total_bookings ?? 0);

  return (
    <div className="container-fluid px-2">
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1">📊 Platform Overview</h4>
        <small className="text-muted">
          High-level business performance snapshot
        </small>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        {/* Revenue */}
        <div className="col-lg-3 col-sm-6">
          <div className="card shadow-sm p-3 h-100">
            <small className="text-muted">Total Revenue</small>
            <h4 className="fw-bold mt-1">
              ₹{global?.total_revenue?.toLocaleString("en-IN")}
            </h4>
            <Sparkline data={revenueTrend} color="#198754" />
          </div>
        </div>

        {/* Bookings */}
        <div className="col-lg-3 col-sm-6">
          <div className="card shadow-sm p-3 h-100">
            <small className="text-muted">Total Bookings</small>
            <h4 className="fw-bold mt-1">
              {global?.total_bookings}
            </h4>
            <Sparkline data={bookingTrend} color="#0d6efd" />
          </div>
        </div>

        {/* Turfs */}
        <div className="col-lg-3 col-sm-6">
          <div className="card shadow-sm p-3 h-100 text-center">
            <small className="text-muted">Active Turfs</small>
            <h4 className="fw-bold mt-2">{turfs.length}</h4>
            <small className="text-muted">Registered</small>
          </div>
        </div>

        {/* Users */}
        <div className="col-lg-3 col-sm-6">
          <div className="card shadow-sm p-3 h-100 text-center">
            <small className="text-muted">Active Users</small>
            <h4 className="fw-bold mt-2">{users.length}</h4>
            <small className="text-muted">Customers</small>
          </div>
        </div>
      </div>

      {/* TOP TURFS */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-semibold mb-2">🏟️ Top Performing Turfs</h6>
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-light">
              <tr>
                <th>Turf</th>
                <th>Revenue</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {turfs.slice(0, 5).map((turf, i) => (
                <tr key={i}>
                  <td>{turf.turf_name}</td>
                  <td>
                    ₹{(turf.total_revenue ?? 0).toLocaleString("en-IN")}
                  </td>
                  <td>{turf.total_bookings ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP USERS */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-semibold mb-2">👤 Top Users</h6>
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Total Spent</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((user, i) => (
                <tr key={i}>
                  <td>{user.user_name}</td>
                  <td>
                    ₹{(user.total_spent ?? 0).toLocaleString("en-IN")}
                  </td>
                  <td>{user.total_bookings ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewReport;

