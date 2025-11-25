import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

interface MonthlyReportProps {
  daily: any[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ daily }) => {
  const [selectedMonth, setSelectedMonth] = useState("");

  // 1️⃣ Group daily data by month (YYYY-MM)
  const monthlyData = useMemo(() => {
    const result: Record<string, { revenue: number; bookings: number; days: any[] }> = {};

    daily.forEach((entry) => {
      if (!entry?.id) return;
      const parts = entry.id.split("-");
      if (parts.length !== 3) return;

      const monthKey = `${parts[1]}-${parts[2]}`; // e.g., Jan-2025

      if (!result[monthKey]) {
        result[monthKey] = { revenue: 0, bookings: 0, days: [] };
      }

      result[monthKey].revenue += entry.total_revenue ?? 0;
      result[monthKey].bookings += entry.total_bookings ?? 0;
      result[monthKey].days.push(entry);
    });

    return result;
  }, [daily]);

  const selectedMonthData = selectedMonth ? monthlyData[selectedMonth] : null;

  return (
    <div className="container">
      {/* 📌 Month Selector */}
      <div className="card p-3 mb-4 shadow-sm border-0">
        <label className="fw-semibold">Select Month</label>
        <select
          className="form-select mt-2"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">-- Choose Month --</option>
          {Object.keys(monthlyData).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* ❗If no month selected */}
      {!selectedMonthData && <p className="text-center text-muted">Please select a month.</p>}

      {selectedMonthData && (
        <>
          {/* 📊 Summary */}
          <div className="card p-4 mb-4 shadow-sm border-0">
            <h5 className="fw-semibold text-center mb-3">
              📆 Monthly Report — {selectedMonth}
            </h5>
            <p><strong>Total Bookings:</strong> {selectedMonthData.bookings}</p>
            <p><strong>Total Revenue:</strong> ₹{selectedMonthData.revenue}</p>
          </div>

          {/* 📉 Revenue & Bookings Chart */}
          <div className="card p-4 mb-4 shadow-sm border-0">
            <h6 className="text-center fw-semibold">Monthly Performance</h6>
            <div style={{ height: 320 }}>
              <Bar
                data={{
                  labels: ["Bookings", "Revenue"],
                  datasets: [
                    {
                      label: "Bookings",
                      data: [selectedMonthData.bookings],
                      backgroundColor: "#36A2EB",
                    },
                    {
                      label: "Revenue (₹)",
                      data: [selectedMonthData.revenue],
                      backgroundColor: "#FF9F40",
                    },
                  ],
                }}
                options={{ responsive: true }}
              />
            </div>
          </div>

          {/* 🔍 Top Performing Turf */}
          <div className="card p-4 mb-4 shadow-sm border-0">
            <h6 className="fw-semibold mb-3">🏟 Turf Performance</h6>
            {selectedMonthData.days.length > 0 ? (
              selectedMonthData.days.map((day, index) => (
                day?.turfs &&
                Object.entries(day.turfs).map(([turfId, data]: any) => (
                  <p key={`${turfId}_${index}`}>
                    <strong>{data.turf_name || turfId}:</strong>{" "}
                    {data.bookings} bookings — ₹{data.revenue}
                  </p>
                ))
              ))
            ) : (
              <p className="text-muted">No turf data available.</p>
            )}
          </div>

          {/* 📌 Day/Night Split (optional) */}
          <div className="card p-4 mb-4 shadow-sm border-0">
            <h6 className="fw-semibold">🌞 Day / 🌙 Night Analysis (Monthly Aggregate)</h6>

            {(() => {
              let dayRevenue = 0,
                nightRevenue = 0,
                dayBookings = 0,
                nightBookings = 0;

              selectedMonthData.days.forEach((d: any) => {
                dayRevenue += d?.time_split?.day?.revenue ?? 0;
                nightRevenue += d?.time_split?.night?.revenue ?? 0;
                dayBookings += d?.time_split?.day?.bookings ?? 0;
                nightBookings += d?.time_split?.night?.bookings ?? 0;
              });

              return (
                <>
                  <p><strong>Day:</strong> {dayBookings} bookings — ₹{dayRevenue}</p>
                  <p><strong>Night:</strong> {nightBookings} bookings — ₹{nightRevenue}</p>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyReport;
