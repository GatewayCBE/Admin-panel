// // src/pages/admin/Analytics/reports/OverviewReport.tsx

// import React from "react";
// import {
//   Chart as ChartJS,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   PointElement,
//   Title,
//   ArcElement,
// } from "chart.js";
// import { Bar, Line } from "react-chartjs-2";

// ChartJS.register(
//   ArcElement,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Tooltip,
//   Legend,
//   Title
// );

// interface OverviewReportProps {
//   global: any;
//   daily: any[];
//   turfs: any[];
//   users: any[];
// }

// /* ─────────────────────────────────────────────
//    COMMON CHART OPTIONS (IMPORTANT)
// ────────────────────────────────────────────── */
// const baseChartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: { position: "top" as const },
//   },
// };

// const OverviewReport: React.FC<OverviewReportProps> = ({
//   global,
//   daily,
//   turfs,
//   users,
// }) => {
//   /* ───────── Revenue Trend ───────── */
//   const revenueTrendData = {
//     labels: daily.map((d) => d.id),
//     datasets: [
//       {
//         label: "Revenue (₹)",
//         data: daily.map((d) => d.total_revenue),
//         borderColor: "#198754",
//         backgroundColor: "rgba(25,135,84,0.1)",
//         tension: 0.35,
//         fill: true,
//         pointRadius: 4,
//       },
//     ],
//   };

//   /* ───────── Bookings Trend ───────── */
//   const bookingsTrendData = {
//     labels: daily.map((d) => d.id),
//     datasets: [
//       {
//         label: "Bookings",
//         data: daily.map((d) => d.total_bookings),
//         backgroundColor: "#FFC107",
//       },
//     ],
//   };

//   const bookingsOptions = {
//     ...baseChartOptions,
//     scales: {
//       y: {
//         beginAtZero: true,
//         suggestedMax: 10, // 🔑 fixes empty-looking chart
//         ticks: { stepSize: 1 },
//       },
//     },
//   };

//   return (
//     <div className="container-fluid px-3">
//       {/* Header */}
//       <div className="mb-3">
//         <h2 className="fw-bold mb-1">📊 Overview Report</h2>
//         <small className="text-muted">
//           Platform-wide performance snapshot
//         </small>
//       </div>

//       {/* KPI CARDS */}
//       <div className="row g-3 mb-4">
//         {[
//           ["Total Revenue", `₹${global?.total_revenue?.toLocaleString("en-IN")}`, "All-time"],
//           ["Total Bookings", global?.total_bookings, "Completed"],
//           ["Active Turfs", turfs.length, "Registered"],
//           ["Active Users", users.length, "Customers"],
//         ].map(([title, value, subtitle], i) => (
//           <div key={i} className="col-lg-3 col-md-6">
//             <div className="card shadow-sm text-center h-100 p-3">
//               <small className="text-muted">{title}</small>
//               <h3 className="fw-bold my-1">{value}</h3>
//               <small className="text-muted">{subtitle}</small>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* CHARTS ROW */}
//       <div className="row g-3 mb-4">
//         {/* Revenue Chart */}
//         <div className="col-lg-8">
//           <div className="card shadow-sm h-100 p-3">
//             <h6 className="fw-semibold mb-2">📈 Revenue Trend (Daily)</h6>
//             <div style={{ height: 320 }}>
//               <Line data={revenueTrendData} options={baseChartOptions} />
//             </div>
//           </div>
//         </div>

//         {/* Bookings Chart */}
//         <div className="col-lg-4">
//           <div className="card shadow-sm h-100 p-3">
//             <h6 className="fw-semibold mb-2">📦 Bookings Trend</h6>
//             <div style={{ height: 320 }}>
//               <Bar data={bookingsTrendData} options={bookingsOptions} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* TOP TURFS */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <h6 className="fw-semibold mb-3">🏟️ Top Turfs</h6>
//           <table className="table table-sm align-middle mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Turf</th>
//                 <th>Revenue</th>
//                 <th>Bookings</th>
//               </tr>
//             </thead>
//             <tbody>
//               {turfs.slice(0, 5).map((turf, idx) => (
//                 <tr key={idx}>
//                   <td>{turf.turf_name}</td>
//                   <td>₹{(turf.total_revenue ?? 0).toLocaleString("en-IN")}</td>
//                   <td>{turf.total_bookings ?? 0}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* TOP USERS */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <h6 className="fw-semibold mb-3">👤 Top Users</h6>
//           <table className="table table-sm align-middle mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>User</th>
//                 <th>Total Spent</th>
//                 <th>Bookings</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.slice(0, 5).map((user, idx) => (
//                 <tr key={idx}>
//                   <td>{user.user_name}</td>
//                   <td>₹{(user.total_spent ?? 0).toLocaleString("en-IN")}</td>
//                   <td>{user.total_bookings ?? 0}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OverviewReport;

// src/pages/admin/Analytics/reports/OverviewReport.tsx

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

