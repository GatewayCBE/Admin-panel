// src/pages/admin/Analytics/reports/UserReport.tsx

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

interface UserReportProps {
  users: any[];
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

const UserReport: React.FC<UserReportProps> = ({ users }) => {
  /* ─────────────────────────────────────────────
     SORT USERS BY TOTAL SPENT
  ───────────────────────────────────────────── */
  const sortedUsers = useMemo(() => {
    return [...users].sort(
      (a, b) => (b.total_spent ?? 0) - (a.total_spent ?? 0)
    );
  }, [users]);

  /* ─────────────────────────────────────────────
     KPIs
  ───────────────────────────────────────────── */
  const totalUsers = users.length;
  const totalRevenue = users.reduce(
    (sum, u) => sum + (u.total_spent ?? 0),
    0
  );
  const totalBookings = users.reduce(
    (sum, u) => sum + (u.total_bookings ?? 0),
    0
  );
  const avgSpendPerUser =
    totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;

  /* ─────────────────────────────────────────────
     BAR CHART DATA
  ───────────────────────────────────────────── */
  const topUsers = sortedUsers.slice(0, 10);

  const chartData = {
    labels: topUsers.map((u) => u.user_name || u.user_id),
    datasets: [
      {
        label: "Total Spent (₹)",
        data: topUsers.map((u) => u.total_spent ?? 0),
        backgroundColor: "#198754",
      },
    ],
  };

  return (
    <div className="px-2">
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1">👤 User Analytics Report</h4>
        <small className="text-muted">
          User spending & booking behavior insights
        </small>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        {[
          ["Total Users", totalUsers],
          ["Total Bookings", totalBookings],
          [
            "Total Revenue",
            `₹${totalRevenue.toLocaleString("en-IN")}`,
          ],
          ["Avg Spend / User", `₹${avgSpendPerUser}`],
        ].map(([label, value], i) => (
          <div key={i} className="col-lg-3 col-sm-6">
            <div className="card shadow-sm p-3 text-center h-100">
              <small className="text-muted">{label}</small>
              <h4 className="fw-bold mt-1">{value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* TOP USERS CHART */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-semibold mb-2 text-center">
          🏆 Top 10 Users by Spending
        </h6>
        <div style={{ height: 360 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* USER RANKING TABLE */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-semibold mb-3">📋 User Rankings</h6>

        <div className="table-responsive">
          <table className="table table-sm table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Total Bookings</th>
                <th>Total Spent</th>
                <th>Avg / Booking</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u, idx) => (
                <tr key={u.user_id || idx}>
                  <td>{idx + 1}</td>
                  <td>{u.user_name}</td>
                  <td>{u.total_bookings ?? 0}</td>
                  <td>
                    ₹{(u.total_spent ?? 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    ₹
                    {u.total_bookings
                      ? Math.round(u.total_spent / u.total_bookings)
                      : 0}
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No user analytics data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserReport;
