import React, { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../Analytics/AdminSidebar"; // now expects props
import {
  getGlobalAnalytics,
  getDailyAnalytics,
  getTurfAnalytics,
  getUserAnalytics,
} from "../../../services/firestoreService";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  ChartDataLabels
);

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

/** Conversions */
const toAnalyticsDateFormat = (isoDate: string) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const parseAnalyticsDate = (s?: string) => {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!m) return null;
  const months: Record<string, number> = {
    Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
    Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
  };
  return new Date(Number(m[3]), months[m[2]], Number(m[1]));
};

const AnalyticsPanel: React.FC = () => {
  const [global, setGlobal] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [turfs, setTurfs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* MOBILE SIDEBAR STATE */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [g, d, t, u] = await Promise.all([
          getGlobalAnalytics(),
          getDailyAnalytics(),
          getTurfAnalytics(),
          getUserAnalytics(),
        ]);

        if (!mounted) return;

        setGlobal(g);

        const sortedDaily = Array.isArray(d)
          ? [...d].sort((a, b) => {
              const ad = parseAnalyticsDate(a.id);
              const bd = parseAnalyticsDate(b.id);
              if (!ad || !bd) return 0;
              return ad.getTime() - bd.getTime();
            })
          : d;

        setDaily(sortedDaily ?? []);
        setTurfs(Array.isArray(t) ? t : []);
        setUsers(Array.isArray(u) ? u : []);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* Filtering logic */
  const startKey = useMemo(() => (fromDate ? toAnalyticsDateFormat(fromDate) : ""), [fromDate]);
  const endKey = useMemo(() => (toDate ? toAnalyticsDateFormat(toDate) : ""), [toDate]);

  const filteredDaily = useMemo(() => {
    if (!startKey || !endKey) return daily;
    const start = parseAnalyticsDate(startKey);
    const end = parseAnalyticsDate(endKey);
    if (!start || !end) return daily;

    return daily.filter((d) => {
      const pd = parseAnalyticsDate(d.id);
      return pd && pd >= start && pd <= end;
    });
  }, [daily, startKey, endKey]);

  const filteredTurfs = useMemo(() => {
    if (!startKey || !endKey) return turfs;

    const start = parseAnalyticsDate(startKey);
    const end = parseAnalyticsDate(endKey);
    if (!start || !end) return turfs;

    return turfs.filter((t) => {
      const lu = t.last_updated;
      if (!lu) return false;

      const d = new Date(lu?.seconds ? lu.seconds * 1000 : lu);
      if (isNaN(d.getTime())) return true;

      const only = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return only >= start && only <= end;
    });
  }, [turfs, startKey, endKey]);

  const filteredUsers = useMemo(() => {
    if (!startKey || !endKey) return users;

    const start = parseAnalyticsDate(startKey);
    const end = parseAnalyticsDate(endKey);
    if (!start || !end) return users;

    return users.filter((u) => {
      const last = u.last_booking || u.last_booking_date || u.last_updated;

      if (typeof last === "string" && /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(last)) {
        const pd = parseAnalyticsDate(last);
        return pd && pd >= start && pd <= end;
      }

      const d = new Date(last);
      if (isNaN(d.getTime())) return false;

      const only = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return only >= start && only <= end;
    });
  }, [users, startKey, endKey]);

  const totalRevenue = Number(global?.total_revenue ?? 0);
  const totalBookings = Number(global?.total_bookings ?? 0);
  const activeTurfs = filteredTurfs.length || turfs.length;
  const activeUsers = filteredUsers.length || users.length;

  /* Chart Data */
  const dailyRevenueData = {
    labels: filteredDaily.map((d) => d.id),
    datasets: [
      {
        label: "Revenue (₹)",
        data: filteredDaily.map((d) => d.total_revenue ?? 0),
        backgroundColor: "#36A2EB",
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  };

  const dailyBookingsData = {
    labels: filteredDaily.map((d) => d.id),
    datasets: [
      {
        label: "Bookings",
        data: filteredDaily.map((d) => d.total_bookings ?? 0),
        backgroundColor: COLORS.slice(0, filteredDaily.length),
      },
    ],
  };

  const dailyBookingsTotal = filteredDaily.reduce(
    (s, d) => s + (d.total_bookings ?? 0),
    0
  );

  const turfRevenueTotal = turfs.reduce(
    (s, t) => s + (t.total_revenue ?? 0),
    0
  );

  const turfData = {
    labels: turfs.map((t) => t.turf_name || `Turf ${t.id}`),
    datasets: [
      {
        label: "Revenue",
        data: turfs.map((t) => t.total_revenue ?? 0),
        backgroundColor: COLORS,
      },
    ],
  };

  const topUsers = [...users]
    .sort((a, b) => (b.total_bookings ?? 0) - (a.total_bookings ?? 0))
    .slice(0, 8);

  const userData = {
    labels: topUsers.map((u) => u.user_name || "Unknown"),
    datasets: [
      {
        label: "Bookings",
        data: topUsers.map((u) => u.total_bookings ?? 0),
        backgroundColor: "#FFCE56",
      },
    ],
  };

  /* Chart options */
  const baseOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      datalabels: {
        color: "#fff",
        font: { size: 11, weight: "bold" },
        formatter: (v: any) =>
          typeof v === "number" && v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : v,
      },
    },
  };

  const barOptions = {
    ...(baseOptions as any),
    scales: {
      x: { grid: { display: false }, ticks: { color: "#555" } },
      y: { beginAtZero: true, ticks: { color: "#555" } },
    },
  };

  const horizontalUserOptions = {
    ...(baseOptions as any),
    indexAxis: "y",
    plugins: {
      ...(baseOptions.plugins as any),
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "right",
        color: "#111",
        font: { size: 12, weight: "bold" },
      },
    },
  };

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: "60vh" }}>
        <AdminSidebar isOpen={false} closeSidebar={() => {}} />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-secondary"></div>
            <p className="mt-2">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- JSX ---------- */
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        closeSidebar={() => setMobileSidebarOpen(false)}
      />

      <main
        className="flex-grow-1"
      >
        {/* Remove left margin on mobile */}
        <style>{`
          @media (max-width: 991px) {
            main { margin-left: 0 !important; }
          }
        `}</style>

        <div className="container-fluid py-4">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
              {/* Hamburger (mobile only) */}
              <button
                className="btn btn-light shadow-sm d-lg-none"
                onClick={() => setMobileSidebarOpen(true)}
              >
                ☰
              </button>

              <div>
                <h2 className="h4 mb-0 fw-bold">Analytics Dashboard</h2>
                <small className="text-muted">
                  Overview of revenue, bookings & usage
                </small>
              </div>
            </div>

            {/* Filters */}
            <form className="d-flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="form-label small mb-1">From</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label small mb-1">To</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-end">
                <button
                  className="btn btn-sm btn-primary me-2"
                  type="button"
                  onClick={() => {
                    if (!fromDate || !toDate) {
                      alert("Please select both dates.");
                    }
                  }}
                >
                  Filter
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* KPIs */}
          <div className="row g-3 mb-4">
            {[
              ["Total Revenue", `₹${totalRevenue.toLocaleString("en-IN")}`, "All-time"],
              ["Total Bookings", totalBookings, `${filteredDaily.length} days`],
              ["Active Turfs", activeTurfs, "Filtered"],
              ["Active Users", activeUsers, "Filtered"],
            ].map(([title, value, sub], i) => (
              <div className="col-xl-3 col-md-6" key={i}>
                <div className="card shadow-sm rounded-4 p-3 h-100 border-0">
                  <small className="text-muted">{title}</small>
                  <h3 className="mt-2 mb-0 fw-bold">{value}</h3>
                  <small className="text-muted">{sub}</small>
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="row g-4">
            {/* Revenue */}
            <div className="col-lg-6">
              <div className="card shadow-sm rounded-4 p-4 h-100 border-0">
                <h5 className="fw-semibold text-center mb-3">Daily Revenue</h5>
                <div style={{ height: 340 }}>
                  <Bar data={dailyRevenueData as any} options={barOptions as any} />
                </div>
              </div>
            </div>

            {/* Bookings */}
            <div className="col-lg-6">
              <div className="card shadow-sm rounded-4 p-4 h-100 border-0">
                <h5 className="fw-semibold text-center mb-3">Daily Bookings</h5>
                <div style={{ height: 340 }}>
                  <Bar data={dailyBookingsData as any} options={barOptions as any} />
                </div>
                <div className="text-center mt-3 small text-muted">
                  Total: {dailyBookingsTotal} bookings
                </div>
              </div>
            </div>

            {/* Turf pie */}
            <div className="col-lg-6">
              <div className="card shadow-sm rounded-4 p-4 h-100 border-0">
                <h5 className="fw-semibold text-center mb-3">Turf Performance</h5>
                <div style={{ height: 320, position: "relative" }}>
                  <Pie data={turfData as any} options={baseOptions as any} />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      fontWeight: 700,
                    }}
                  >
                    Total: ₹{turfRevenueTotal.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Users */}
            <div className="col-lg-6">
              <div className="card shadow-sm rounded-4 p-4 h-100 border-0">
                <h5 className="fw-semibold text-center mb-3">Top Users by Bookings</h5>
                <div style={{ height: 320 }}>
                  <Bar data={userData as any} options={horizontalUserOptions as any} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPanel;
