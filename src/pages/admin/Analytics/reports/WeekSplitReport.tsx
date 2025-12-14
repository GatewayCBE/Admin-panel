// src/pages/admin/Analytics/reports/WeekSplitReport.tsx

import React, { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface WeekSplitReportProps {
  daily: any[];
}

/* ─────────────────────────────────────────────
   SHARED HELPERS
────────────────────────────────────────────── */
const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
  return new Date(`${month} ${day}, ${year}`);
};

const isWeekend = (dateStr: string) => {
  const d = parseDate(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const WeekSplitReport: React.FC<WeekSplitReportProps> = ({ daily }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  /* ─────────────────────────────────────────────
     FILTER DATA
  ───────────────────────────────────────────── */
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return daily;

    return daily.filter((d) => {
      const current = parseDate(d.id);
      return current >= startDate && current <= endDate;
    });
  }, [daily, startDate, endDate]);

  /* ─────────────────────────────────────────────
     AGGREGATIONS
  ───────────────────────────────────────────── */
  let weekdayBookings = 0;
  let weekdayRevenue = 0;
  let weekendBookings = 0;
  let weekendRevenue = 0;

  filteredData.forEach((d) => {
    if (isWeekend(d.id)) {
      weekendBookings += d.total_bookings ?? 0;
      weekendRevenue += d.total_revenue ?? 0;
    } else {
      weekdayBookings += d.total_bookings ?? 0;
      weekdayRevenue += d.total_revenue ?? 0;
    }
  });

  const weekData = {
    labels: ["Weekday", "Weekend"],
    datasets: [
      {
        label: "Bookings",
        data: [weekdayBookings, weekendBookings],
        backgroundColor: "#0d6efd",
      },
      {
        label: "Revenue (₹)",
        data: [weekdayRevenue, weekendRevenue],
        backgroundColor: "#198754",
      },
    ],
  };

  return (
    <div className="px-2">
      {/* HEADER */}
      <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">📆 Weekday vs Weekend</h4>
          <small className="text-muted">
            Compare booking & revenue performance
          </small>
        </div>

        {/* DATE FILTER */}
        <div className="d-flex gap-2">
          <DatePicker
            selected={startDate}
            onChange={(d) => setStartDate(d)}
            placeholderText="From"
            className="form-control"
            dateFormat="dd-MMM-yyyy"
          />
          <DatePicker
            selected={endDate}
            onChange={(d) => setEndDate(d)}
            placeholderText="To"
            className="form-control"
            dateFormat="dd-MMM-yyyy"
          />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        {[
          ["Weekday Bookings", weekdayBookings],
          [
            "Weekday Revenue",
            `₹${weekdayRevenue.toLocaleString("en-IN")}`,
          ],
          ["Weekend Bookings", weekendBookings],
          [
            "Weekend Revenue",
            `₹${weekendRevenue.toLocaleString("en-IN")}`,
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

      {/* CHART */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="fw-semibold text-center mb-2">
          📊 Weekday vs Weekend Comparison
        </h6>
        <div style={{ height: 320 }}>
          <Bar data={weekData} options={chartOptions} />
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-semibold mb-3">📋 Daily Breakdown</h6>

        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.id}</td>
                  <td>
                    <span
                      className={`badge ${
                        isWeekend(d.id)
                          ? "bg-warning text-dark"
                          : "bg-primary"
                      }`}
                    >
                      {isWeekend(d.id) ? "Weekend" : "Weekday"}
                    </span>
                  </td>
                  <td>{d.total_bookings ?? 0}</td>
                  <td>
                    ₹{(d.total_revenue ?? 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No data for selected range
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

export default WeekSplitReport;
