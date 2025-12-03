// src/pages/admin/Analytics/UserReport.tsx

import React, { useEffect, useState, useMemo } from "react";
import { getDailyAnalytics, getUserAnalytics } from "../../../../services/firestoreService";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, ArcElement, LinearScale, BarElement, Tooltip, Legend, Title);

interface UserReportProps {
  users: any[]; // receives from parent
}

const UserReport: React.FC<UserReportProps> = ({users}) => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [daily, users] = await Promise.all([
          getDailyAnalytics(),
          getUserAnalytics(),
        ]);
        setDailyData(daily);
        setUserData(users);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Get monthly aggregated data
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<string, { revenue: number; bookings: number }> = {};

    dailyData.forEach((day: any) => {
      const date = new Date(day.date);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { revenue: 0, bookings: 0 };
      }

      monthlyMap[monthKey].revenue += day.total_revenue ?? 0;
      monthlyMap[monthKey].bookings += day.total_bookings ?? 0;
    });

    return Object.entries(monthlyMap).map(([month, stats]) => ({
      month,
      ...stats,
    }));
  }, [dailyData]);

  // Chart data for monthly analytics
  const chartData = {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlyData.map((item) => item.revenue),
        backgroundColor: "#36A2EB",
      },
      {
        label: "Bookings",
        data: monthlyData.map((item) => item.bookings),
        backgroundColor: "#FFCE56",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: { y: { beginAtZero: true } },
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
        <p>Loading user analytics...</p>
      </div>
    );
  }

  return (
    <div>

      <div className="container mt-4">
        <h2 className="fw-bold mb-3">User Report Analytics</h2>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "monthly" ? "active" : ""}`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link disabled">Weekly (coming)</button>
          </li>
          <li className="nav-item">
            <button className="nav-link disabled">Weekday / Weekend</button>
          </li>
          <li className="nav-item">
            <button className="nav-link disabled">Day vs Night</button>
          </li>
        </ul>

        {activeTab === "monthly" && (
          <div className="card shadow-sm p-4">
            <h5 className="fw-semibold mb-3">Monthly User Analytics</h5>

            <div style={{ height: 350 }}>
              <Bar data={chartData} options={chartOptions as any} />
            </div>

            <table className="table table-striped table-bordered mt-4">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Bookings</th>
                  <th>Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, i) => (
                  <tr key={i}>
                    <td>{item.month}</td>
                    <td>{item.bookings}</td>
                    <td>₹{item.revenue.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReport;
