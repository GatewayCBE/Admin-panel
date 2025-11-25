// src/pages/admin/Analytics/reports/OverviewReport.tsx

import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  Title,
  ArcElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

// 🔹 Define props type
interface OverviewReportProps {
  global: any;
  daily: any[];
  turfs: any[];
  users: any[];
}

const OverviewReport: React.FC<OverviewReportProps> = ({ global, daily, turfs, users }) => {
  // Chart data (Revenue Trend)
  const revenueTrendData = {
    labels: daily.map((item) => item.id),
    datasets: [
      {
        label: "Revenue (₹)",
        data: daily.map((item) => item.total_revenue),
        borderColor: "#36A2EB",
        tension: 0.3,
      },
    ],
  };

  // Chart data (Bookings Trend)
  const bookingsTrendData = {
    labels: daily.map((item) => item.id),
    datasets: [
      {
        label: "Bookings",
        data: daily.map((item) => item.total_bookings),
        backgroundColor: "#FFCE56",
      },
    ],
  };

  return (
    <div>
      <div className="container-fluid px-3">
        <h2 className="fw-bold mb-3">📊 Overview Report</h2>

        {/* KPIs */}
        <div className="row g-3 mb-3">
          {[
            ["Total Revenue", `₹${global?.total_revenue?.toLocaleString("en-IN")}`, "All-time"],
            ["Total Bookings", global?.total_bookings, "Completed"],
            ["Active Turfs", turfs.length, "Registered"],
            ["Active Users", users.length, "Customers"],
          ].map(([title, value, subtitle], i) => (
            <div key={i} className="col-lg-3 col-sm-6">
              <div className="card shadow-sm p-3 text-center h-100">
                <small className="text-muted">{title}</small>
                <h3 className="fw-bold mb-1">{value}</h3>
                <small className="text-muted">{subtitle}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="card shadow-sm p-3 mb-3">
          <h5 className="fw-semibold mb-2">📈 Revenue Trend (Daily)</h5>
          <div style={{ height: "300px", maxWidth: "95%", margin: "0 auto" }}>
            <Line data={revenueTrendData} />
          </div>
        </div>

        {/* Bookings Trend */}
        <div className="card shadow-sm p-3 mb-3">
          <h6 className="fw-semibold mb-2">📦 Bookings Trend (Daily)</h6>
          <div style={{ height: "300px", maxWidth: "95%", margin: "0 auto" }}>
            <Bar data={bookingsTrendData} />
          </div>
        </div>

        {/* Top Turfs */}
        <div className="card shadow-sm p-3 mb-3">
          <h5 className="fw-semibold mb-2">🏟️ Top Turfs</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Turf Name</th>
                <th>Total Revenue</th>
                <th>Total Bookings</th>
              </tr>
            </thead>
            <tbody>
              {turfs
                .slice(0, 5)
                .map((turf, idx) => (
                  <tr key={idx}>
                    <td>{turf.turf_name}</td>
                    <td>₹{(turf.total_revenue ?? 0).toLocaleString("en-IN")}</td>
                    <td>{turf.total_bookings ?? 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Top Users */}
        <div className="card shadow-sm p-3 mb-4">
          <h5 className="fw-semibold mb-2">👤 Top Users</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Total Spent</th>
                <th>Total Bookings</th>
              </tr>
            </thead>
            <tbody>
              {users
                .slice(0, 5)
                .map((user, idx) => (
                  <tr key={idx}>
                    <td>{user.user_name}</td>
                    <td>₹{(user.total_spent ?? 0).toLocaleString("en-IN")}</td>
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
