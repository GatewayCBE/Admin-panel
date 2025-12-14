// src/pages/admin/Analytics/reports/TimeSplitReport.tsx

import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

interface TimeSplitReportProps {
  daily: any[];
}

/* ─────────────────────────────────────────────
   SHARED CHART OPTIONS
────────────────────────────────────────────── */
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
};

const TimeSplitReport: React.FC<TimeSplitReportProps> = ({ daily }) => {
  const [selectedDate, setSelectedDate] = useState<string>("all");

  /* ─────────────────────────────────────────────
     FILTER DATA
  ────────────────────────────────────────────── */
  const filteredData = useMemo(() => {
    return selectedDate === "all"
      ? daily
      : daily.filter((d) => d.id === selectedDate);
  }, [daily, selectedDate]);

  /* ─────────────────────────────────────────────
     AGGREGATIONS
  ────────────────────────────────────────────── */
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, d) => {
        acc.dayBookings += d?.time_split?.day?.bookings ?? 0;
        acc.dayRevenue += d?.time_split?.day?.revenue ?? 0;
        acc.nightBookings += d?.time_split?.night?.bookings ?? 0;
        acc.nightRevenue += d?.time_split?.night?.revenue ?? 0;
        acc.totalBookings += d?.total_bookings ?? 0;
        acc.totalRevenue += d?.total_revenue ?? 0;
        return acc;
      },
      {
        dayBookings: 0,
        dayRevenue: 0,
        nightBookings: 0,
        nightRevenue: 0,
        totalBookings: 0,
        totalRevenue: 0,
      }
    );
  }, [filteredData]);

    if (!daily || daily.length === 0) {
    return <p className="text-muted text-center">No time-split data available.</p>;
  }

  /* ─────────────────────────────────────────────
     CHART DATA
  ────────────────────────────────────────────── */
  const dayNightChartData = {
    labels: ["Day", "Night"],
    datasets: [
      {
        label: "Bookings",
        data: [totals.dayBookings, totals.nightBookings],
        backgroundColor: "#0d6efd",
      },
      {
        label: "Revenue (₹)",
        data: [totals.dayRevenue, totals.nightRevenue],
        backgroundColor: "#198754",
      },
    ],
  };

  return (
    <div className="px-2">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">🌞🌙 Time Split Report</h4>
          <small className="text-muted">
            Day vs Night performance analysis
          </small>
        </div>

        {/* DATE FILTER */}
        <select
          className="form-select w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="all">All Dates</option>
          {daily.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id}
            </option>
          ))}
        </select>
      </div>

      {/* KPI SUMMARY */}
      <div className="row g-3 mb-4">
        {[
          ["Day Bookings", totals.dayBookings],
          ["Night Bookings", totals.nightBookings],
          ["Day Revenue", `₹${totals.dayRevenue.toLocaleString("en-IN")}`],
          ["Night Revenue", `₹${totals.nightRevenue.toLocaleString("en-IN")}`],
        ].map(([label, value], i) => (
          <div key={i} className="col-lg-3 col-md-6">
            <div className="card shadow-sm text-center p-3 h-100">
              <small className="text-muted">{label}</small>
              <h4 className="fw-bold mt-1">{value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* DAY vs NIGHT CHART */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-semibold mb-2 text-center">
          📊 Day vs Night Comparison
        </h6>
        <div style={{ height: 320 }}>
          <Bar data={dayNightChartData} options={baseChartOptions} />
        </div>
      </div>

      {/* DETAILED TABLE */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">
            📋 Detailed Breakdown —{" "}
            {selectedDate === "all" ? "All Dates" : selectedDate}
          </h6>

          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Day Bookings</th>
                  <th>Day Revenue</th>
                  <th>Night Bookings</th>
                  <th>Night Revenue</th>
                  <th>Total Bookings</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.time_split?.day?.bookings ?? 0}</td>
                    <td>₹{d.time_split?.day?.revenue ?? 0}</td>
                    <td>{d.time_split?.night?.bookings ?? 0}</td>
                    <td>₹{d.time_split?.night?.revenue ?? 0}</td>
                    <td>{d.total_bookings ?? 0}</td>
                    <td>₹{d.total_revenue ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSplitReport;
