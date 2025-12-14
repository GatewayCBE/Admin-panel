// src/pages/admin/Analytics/reports/SingleDayReport.tsx

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

interface SingleDayReportProps {
  daily: any[];
}

/* ─────────────────────────────────────────────
   SHARED CHART OPTIONS
────────────────────────────────────────────── */
const chartOptions = {
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

const SingleDayReport: React.FC<SingleDayReportProps> = ({ daily }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const dayData = daily.find((d) => d.id === selectedDate);

  return (
    <div className="px-2">
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1">📅 Single Day Report</h4>
        <small className="text-muted">
          Detailed performance for a selected date
        </small>
      </div>

      {/* DATE SELECTOR */}
      <div className="card shadow-sm p-3 mb-4">
        <label className="fw-semibold mb-2">Select Date</label>
        <select
          className="form-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">-- Choose a date --</option>
          {daily.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id}
            </option>
          ))}
        </select>
      </div>

      {/* EMPTY STATE */}
      {!dayData && (
        <div className="text-center text-muted mt-5">
          📌 Please select a date to view analytics.
        </div>
      )}

      {/* REPORT CONTENT */}
      {dayData && (
        <>
          {/* KPI SUMMARY */}
          <div className="row g-3 mb-4">
            {[
              ["Total Bookings", dayData.total_bookings ?? 0],
              [
                "Total Revenue",
                `₹${(dayData.total_revenue ?? 0).toLocaleString("en-IN")}`,
              ],
              [
                "Day Bookings",
                dayData?.time_split?.day?.bookings ?? 0,
              ],
              [
                "Night Bookings",
                dayData?.time_split?.night?.bookings ?? 0,
              ],
            ].map(([label, value], i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="card shadow-sm p-3 text-center h-100">
                  <small className="text-muted">{label}</small>
                  <h4 className="fw-bold mt-1">{value}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* DAY vs NIGHT CHART */}
          <div className="card shadow-sm p-3 mb-4">
            <h6 className="fw-semibold text-center mb-2">
              🌞🌙 Day vs Night Performance — {selectedDate}
            </h6>

            <div style={{ height: 320 }}>
              <Bar
                data={{
                  labels: ["Day", "Night"],
                  datasets: [
                    {
                      label: "Bookings",
                      data: [
                        dayData?.time_split?.day?.bookings ?? 0,
                        dayData?.time_split?.night?.bookings ?? 0,
                      ],
                      backgroundColor: "#0d6efd",
                    },
                    {
                      label: "Revenue (₹)",
                      data: [
                        dayData?.time_split?.day?.revenue ?? 0,
                        dayData?.time_split?.night?.revenue ?? 0,
                      ],
                      backgroundColor: "#198754",
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SingleDayReport;
