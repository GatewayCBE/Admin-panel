// src/pages/admin/Analytics/reports/UserReport.tsx

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

/* ─────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */
interface UserReportProps {
  users: any[];
}

/* ─────────────────────────────────────────────
   CHART OPTIONS (HORIZONTAL BAR)
────────────────────────────────────────────── */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { beginAtZero: true },
  },
};

/* ─────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────── */
const UserReport: React.FC<UserReportProps> = ({ users }) => {
  /* ─────────────────────────────────────────────
     NORMALIZE USERS (REMOVE DUPLICATES)
  ───────────────────────────────────────────── */
  const normalizedUsers = useMemo(() => {
    const map: Record<string, any> = {};

    users.forEach((u) => {
      const key = u.user_id || u.user_name || "unknown";

      if (!map[key]) {
        map[key] = {
          user_id: key,
          user_name: u.user_name || "Unknown User",
          total_spent: 0,
          total_bookings: 0,
        };
      }

      map[key].total_spent += u.total_spent ?? 0;
      map[key].total_bookings += u.total_bookings ?? 0;
    });

    return Object.values(map);
  }, [users]);

  /* ─────────────────────────────────────────────
     SORT USERS BY SPENDING
  ───────────────────────────────────────────── */
  const sortedUsers = useMemo(() => {
    return [...normalizedUsers].sort(
      (a, b) => b.total_spent - a.total_spent
    );
  }, [normalizedUsers]);

  /* ─────────────────────────────────────────────
     KPIs
  ───────────────────────────────────────────── */
  const totalUsers = normalizedUsers.length;

  const totalRevenue = normalizedUsers.reduce(
    (sum, u) => sum + u.total_spent,
    0
  );

  const totalBookings = normalizedUsers.reduce(
    (sum, u) => sum + u.total_bookings,
    0
  );

  const avgSpendPerUser =
    totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;

  const repeatUsers = normalizedUsers.filter(
    (u) => u.total_bookings > 1
  ).length;

  const repeatRate =
    totalUsers > 0 ? Math.round((repeatUsers / totalUsers) * 100) : 0;

  /* ─────────────────────────────────────────────
     TOP USERS CHART
  ───────────────────────────────────────────── */
  const topUsers = sortedUsers.slice(0, 10);

  const chartData = {
    labels: topUsers.map((u) =>
      u.user_name.length > 12 ? u.user_name.slice(0, 12) + "…" : u.user_name
    ),
    datasets: [
      {
        label: "Total Spent (₹)",
        data: topUsers.map((u) => u.total_spent),
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
          ["Total Revenue", `₹${totalRevenue.toLocaleString("en-IN")}`],
          ["Avg Spend / User", `₹${avgSpendPerUser}`],
          ["Repeat Users", `${repeatRate}%`],
        ].map(([label, value], i) => (
          <div key={i} className="col-lg-3 col-md-6">
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

      {/* USER TABLE */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-semibold mb-3">
          📋 Complete User Performance
        </h6>

        <div className="table-responsive">
          <table className="table table-sm table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Bookings</th>
                <th>Total Spent</th>
                <th>Avg / Booking</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u, idx) => (
                <tr
                  key={u.user_id}
                  className={u.total_spent > 5000 ? "table-success" : ""}
                >
                  <td>{idx + 1}</td>
                  <td>
                    {u.total_bookings > 5 && (
                      <span className="badge bg-success me-1">
                        Frequent
                      </span>
                    )}
                    {u.user_name}
                  </td>
                  <td>{u.total_bookings}</td>
                  <td>
                    ₹{u.total_spent.toLocaleString("en-IN")}
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
                    No user analytics available
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
