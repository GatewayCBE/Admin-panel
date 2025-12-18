// src/pages/admin/Analytics/reports/MonthlyReport.tsx

import React, { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

interface MonthlyReportProps {
  daily: any[];
}

/* ─────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
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

const MonthlyReport: React.FC<MonthlyReportProps> = ({ daily }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  /* ─────────────────────────────────────────────
     GROUP DAILY → MONTHLY
  ───────────────────────────────────────────── */
  const monthlyData = useMemo(() => {
    const result: Record<
      string,
      { revenue: number; bookings: number; days: any[] }
    > = {};

    daily.forEach((d) => {
      if (!d?.id) return;

      const [dd, mm, yyyy] = d.id.split("-");
      if (!mm || !yyyy) return;

      const key = `${mm}-${yyyy}`; // Dec-2025

      if (!result[key]) {
        result[key] = { revenue: 0, bookings: 0, days: [] };
      }

      result[key].revenue += d.total_revenue ?? 0;
      result[key].bookings += d.total_bookings ?? 0;
      result[key].days.push(d);
    });

    return result;
  }, [daily]);

  const month = selectedMonth ? monthlyData[selectedMonth] : null;

  /* ─────────────────────────────────────────────
     DAY / NIGHT AGGREGATE
  ───────────────────────────────────────────── */
  const dayNight = useMemo(() => {
    let dayB = 0,
      nightB = 0,
      dayR = 0,
      nightR = 0;

    month?.days.forEach((d: any) => {
      dayB += d?.time_split?.day?.bookings ?? 0;
      nightB += d?.time_split?.night?.bookings ?? 0;
      dayR += d?.time_split?.day?.revenue ?? 0;
      nightR += d?.time_split?.night?.revenue ?? 0;
    });

    return { dayB, nightB, dayR, nightR };
  }, [month]);

  /* ─────────────────────────────────────────────
     TURF AGGREGATE
  ───────────────────────────────────────────── */
  const turfSummary = useMemo(() => {
    const map: Record<string, any> = {};

    month?.days.forEach((d: any) => {
      Object.entries(d.turfs || {}).forEach(([_, t]: any) => {
        const key = t.turf_name || "Unknown Turf";
        if (!map[key]) {
          map[key] = { revenue: 0, bookings: 0 };
        }
        map[key].revenue += t.revenue ?? 0;
        map[key].bookings += t.bookings ?? 0;
      });
    });

    return Object.entries(map).sort(
      (a: any, b: any) => b[1].revenue - a[1].revenue
    );
  }, [month]);

  return (
    <div className="px-2">
      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1">📅 Monthly Report</h4>
        <small className="text-muted">
          Revenue & booking performance by month
        </small>
      </div>

      {/* MONTH SELECTOR */}
      <div className="card shadow-sm p-3 mb-4">
        <label className="fw-semibold mb-1">Select Month</label>
        <select
          className="form-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">-- Choose Month --</option>
          {Object.keys(monthlyData).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {!month && (
        <p className="text-center text-muted">
          Please select a month to view analytics
        </p>
      )}

      {month && (
        <>
          {/* KPI CARDS */}
          <div className="row g-3 mb-4">
            {[
              ["Total Bookings", month.bookings],
              [
                "Total Revenue",
                `₹${month.revenue.toLocaleString("en-IN")}`,
              ],
              ["Day Bookings", dayNight.dayB],
              ["Night Bookings", dayNight.nightB],
            ].map(([label, value], i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="card shadow-sm p-3 text-center h-100">
                  <small className="text-muted">{label}</small>
                  <h4 className="fw-bold mt-1">{value}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* MONTHLY COMPARISON */}
          <div className="row g-4 mb-4">
  {/* BOOKINGS */}
  <div className="col-lg-6">
    <div className="card shadow-sm p-3 h-100">
      <h6 className="fw-semibold text-center mb-2">
        📦 Monthly Bookings — {selectedMonth}
      </h6>
      <div style={{ height: 280 }}>
        <Bar
          key={`monthly-bookings-${selectedMonth}`}
          data={{
            labels: ["Bookings"],
            datasets: [
              {
                data: [month.bookings],
                backgroundColor: "#0d6efd",
              },
            ],
          }}
          options={{
            ...chartOptions,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
    </div>
  </div>

  {/* REVENUE */}
  <div className="col-lg-6">
    <div className="card shadow-sm p-3 h-100">
      <h6 className="fw-semibold text-center mb-2">
        💰 Monthly Revenue — {selectedMonth}
      </h6>
      <div style={{ height: 280 }}>
        <Bar
          key={`monthly-revenue-${selectedMonth}`}
          data={{
            labels: ["Revenue"],
            datasets: [
              {
                data: [month.revenue],
                backgroundColor: "#198754",
              },
            ],
          }}
          options={{
            ...chartOptions,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
    </div>
  </div>
</div>

          {/* DAY / NIGHT SPLIT */}
          <div className="card shadow-sm p-3 mb-4">
            <h6 className="fw-semibold mb-3">🌞 Day vs 🌙 Night</h6>
            <div className="row text-center">
              <div className="col-md-6">
                <h5>{dayNight.dayB}</h5>
                <small className="text-muted">
                  Day Bookings — ₹{dayNight.dayR}
                </small>
              </div>
              <div className="col-md-6">
                <h5>{dayNight.nightB}</h5>
                <small className="text-muted">
                  Night Bookings — ₹{dayNight.nightR}
                </small>
              </div>
            </div>
          </div>

          {/* TURF PERFORMANCE */}
          <div className="card shadow-sm p-3">
            <h6 className="fw-semibold mb-3">🏟 Turf Performance</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Turf</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {turfSummary.map(([name, t]: any, i) => (
                    <tr key={i}>
                      <td>{name}</td>
                      <td>{t.bookings}</td>
                      <td>
                        ₹{t.revenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {turfSummary.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        No turf data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyReport;
