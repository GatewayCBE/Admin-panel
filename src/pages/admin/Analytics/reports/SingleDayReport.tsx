// src/pages/admin/Analytics/reports/SingleDayReport.tsx

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

interface SingleDayReportProps {
  daily: any[];
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
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

      {!dayData && (
        <div className="text-center text-muted mt-5">
          📌 Please select a date to view analytics.
        </div>
      )}

      {dayData && (
        <>
          {/* KPI CARDS */}
          <div className="row g-3 mb-4">
            {[
              ["Total Bookings", dayData.total_bookings ?? 0],
              [
                "Total Revenue",
                `₹${(dayData.total_revenue ?? 0).toLocaleString("en-IN")}`,
              ],
              ["Day Bookings", dayData?.time_split?.day?.bookings ?? 0],
              ["Night Bookings", dayData?.time_split?.night?.bookings ?? 0],
            ].map(([label, value], i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="card shadow-sm p-3 text-center h-100">
                  <small className="text-muted">{label}</small>
                  <h4 className="fw-bold mt-1">{value}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="row g-4">
            {/* BOOKINGS */}
            <div className="col-lg-6">
              <div className="card shadow-sm p-3 h-100">
                <h6 className="fw-semibold text-center mb-2">
                  📦 Bookings — {selectedDate}
                </h6>
                <div style={{ height: 260 }}>
                  <Bar
                    key={`bookings-${selectedDate}`}
                    data={{
                      labels: ["Day", "Night"],
                      datasets: [
                        {
                          data: [
                            dayData?.time_split?.day?.bookings ?? 0,
                            dayData?.time_split?.night?.bookings ?? 0,
                          ],
                          backgroundColor: "#0d6efd",
                        },
                      ],
                    }}
                    options={baseOptions}
                  />
                </div>
              </div>
            </div>

            {/* REVENUE */}
            <div className="col-lg-6">
              <div className="card shadow-sm p-3 h-100">
                <h6 className="fw-semibold text-center mb-2">
                  💰 Revenue — {selectedDate}
                </h6>
                <div style={{ height: 260 }}>
                  <Bar
                    key={`revenue-${selectedDate}`}
                    data={{
                      labels: ["Day", "Night"],
                      datasets: [
                        {
                          data: [
                            dayData?.time_split?.day?.revenue ?? 0,
                            dayData?.time_split?.night?.revenue ?? 0,
                          ],
                          backgroundColor: "#198754",
                        },
                      ],
                    }}
                    options={baseOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SingleDayReport;
