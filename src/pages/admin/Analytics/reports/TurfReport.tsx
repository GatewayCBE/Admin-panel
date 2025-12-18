// src/pages/admin/Analytics/reports/TurfReport.tsx

import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

interface TurfReportProps {
  turfs: any[];
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

const TurfReport: React.FC<TurfReportProps> = ({ turfs }) => {
  const [selectedTurfId, setSelectedTurfId] = useState<string>("");

  const selectedTurf = turfs.find((t) => t.turf_id === selectedTurfId);

  /* ─────────────────────────────────────────────
     SORT TURFS BY REVENUE
  ───────────────────────────────────────────── */
  const sortedTurfs = useMemo(() => {
    return [...turfs].sort(
      (a, b) => (b.total_revenue ?? 0) - (a.total_revenue ?? 0)
    );
  }, [turfs]);

  /* ─────────────────────────────────────────────
     BAR CHART DATA (ALL TURFS)
  ───────────────────────────────────────────── */
  const turfComparisonData = {
    labels: sortedTurfs.map((t) => t.turf_name || t.turf_id),
    datasets: [
      {
        label: "Revenue (₹)",
        data: sortedTurfs.map((t) => t.total_revenue ?? 0),
        backgroundColor: "#0d6efd",
      },
    ],
  };

  return (
    <div className="px-2">
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1">🏟 Turf Performance Report</h4>
        <small className="text-muted">
          Revenue & booking performance across all turfs
        </small>
      </div>

      {/* TURF SELECTOR */}
      <div className="card shadow-sm p-3 mb-4">
        <label className="fw-semibold mb-1">Select Turf</label>
        <select
          className="form-select"
          value={selectedTurfId}
          onChange={(e) => setSelectedTurfId(e.target.value)}
        >
          <option value="">All Turfs (Overview)</option>
          {turfs.map((t) => (
            <option key={t.turf_id} value={t.turf_id}>
              {t.turf_name}
            </option>
          ))}
        </select>
      </div>

      {/* SELECTED TURF KPIs */}
      {selectedTurf && (
        <div className="row g-3 mb-4">
          {[
            ["Total Bookings", selectedTurf.total_bookings ?? 0],
            [
              "Total Revenue",
              `₹${(selectedTurf.total_revenue ?? 0).toLocaleString("en-IN")}`,
            ],
            ["Avg Revenue / Booking",
              selectedTurf.total_bookings
                ? `₹${Math.round(
                    selectedTurf.total_revenue / selectedTurf.total_bookings
                  )}`
                : "₹0"],
          ].map(([label, value], i) => (
            <div key={i} className="col-md-4">
              <div className="card shadow-sm p-3 text-center h-100">
                <small className="text-muted">{label}</small>
                <h4 className="fw-bold mt-1">{value}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALL TURFS COMPARISON */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-semibold mb-2 text-center">
          📊 Revenue Comparison (All Turfs)
        </h6>
        <div style={{ height: 360 }}>
          <Bar data={turfComparisonData} options={chartOptions} />
        </div>
      </div>

      {/* TURF RANKING TABLE */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-semibold mb-3">🏆 Turf Rankings</h6>

        <div className="table-responsive">
          <table className="table table-sm table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Turf Name</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sortedTurfs.map((t, idx) => (
                <tr
                  key={t.turf_id}
                  className={
                    t.turf_id === selectedTurfId ? "table-primary" : ""
                  }
                >
                  <td>{idx + 1}</td>
                  <td>{t.turf_name}</td>
                  <td>{t.total_bookings ?? 0}</td>
                  <td>
                    ₹{(t.total_revenue ?? 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              {sortedTurfs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No turf data available
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

export default TurfReport;
