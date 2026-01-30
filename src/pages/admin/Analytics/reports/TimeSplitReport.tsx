// src/pages/admin/Analytics/reports/TimeSplitReport.tsx

import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

interface TimeSplitReportProps {
  daily: any[];
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 12,
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: {
          size: 12,
        },
      },
    },
  },
};

const TimeSplitReport: React.FC<TimeSplitReportProps> = ({ daily }) => {
  const [selectedDate, setSelectedDate] = useState("all");

  /* FILTER DATA */
  const filteredData = useMemo(() => {
    return selectedDate === "all"
      ? daily
      : daily.filter((d) => d.id === selectedDate);
  }, [daily, selectedDate]);

  /* AGGREGATION */
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, d) => {
        acc.dayBookings += d?.time_split?.day?.bookings ?? 0;
        acc.nightBookings += d?.time_split?.night?.bookings ?? 0;
        acc.dayRevenue += d?.time_split?.day?.revenue ?? 0;
        acc.nightRevenue += d?.time_split?.night?.revenue ?? 0;
        acc.totalBookings += d?.total_bookings ?? 0;
        acc.totalRevenue += d?.total_revenue ?? 0;
        return acc;
      },
      {
        dayBookings: 0,
        nightBookings: 0,
        dayRevenue: 0,
        nightRevenue: 0,
        totalBookings: 0,
        totalRevenue: 0,
      }
    );
  }, [filteredData]);

  if (!daily || daily.length === 0) {
    return (
      <p className="text-muted text-center py-4">
        No time-split data available.
      </p>
    );
  }

  return (
    <div className="container-fluid px-2 px-sm-3 px-lg-4">
      {/* HEADER */}
      <div className="row align-items-center mb-3 g-2">
        <div className="col-12 col-md-8">
          <h4 className="fw-bold mb-1 fs-5 fs-md-4">
            🌞🌙 Time Split Report
          </h4>
          <small className="text-muted">
            Day vs Night performance analysis
          </small>
        </div>

        <div className="col-12 col-md-4">
          <select
            className="form-select form-select-sm form-select-md"
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
      </div>

      {/* KPI CARDS */}
      <div className="row g-2 g-md-3 mb-4">
        {[
          ["Day Bookings", totals.dayBookings],
          ["Night Bookings", totals.nightBookings],
          ["Day Revenue", `₹${totals.dayRevenue.toLocaleString("en-IN")}`],
          ["Night Revenue", `₹${totals.nightRevenue.toLocaleString("en-IN")}`],
        ].map(([label, value], i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="card shadow-sm h-100 text-center p-2 p-md-3">
              <small className="text-muted d-block">
                {label}
              </small>
              <div className="fw-bold fs-6 fs-md-4 mt-1">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="row g-3 mb-4">
        {/* BOOKINGS */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm p-2 p-md-3">
            <h6 className="fw-semibold text-center mb-2">
              📦 Bookings — Day vs Night
            </h6>
            <div style={{ height: "220px" }}>
              <Bar
                data={{
                  labels: ["Day", "Night"],
                  datasets: [
                    {
                      data: [
                        totals.dayBookings,
                        totals.nightBookings,
                      ],
                      backgroundColor: "#0d6efd",
                      barThickness: 40,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* REVENUE */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm p-2 p-md-3">
            <h6 className="fw-semibold text-center mb-2">
              💰 Revenue — Day vs Night
            </h6>
            <div style={{ height: "220px" }}>
              <Bar
                data={{
                  labels: ["Day", "Night"],
                  datasets: [
                    {
                      data: [
                        totals.dayRevenue,
                        totals.nightRevenue,
                      ],
                      backgroundColor: "#198754",
                      barThickness: 40,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body p-2 p-md-3">
          <h6 className="fw-semibold mb-2">
            📋 Detailed Breakdown —{" "}
            {selectedDate === "all" ? "All Dates" : selectedDate}
          </h6>

          <div className="table-responsive">
            <table className="table table-sm table-bordered mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Day B</th>
                  <th>Day ₹</th>
                  <th>Night B</th>
                  <th>Night ₹</th>
                  <th>Total B</th>
                  <th>Total ₹</th>
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
