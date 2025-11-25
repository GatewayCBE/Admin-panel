import React, { useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

interface TurfReportProps {
  turfs: any[]; // receives from parent
}

const TurfReport: React.FC<TurfReportProps> = ({ turfs }) => {
  const [selectedTurf, setSelectedTurf] = useState<string>("");

  // Chart options
  const options: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
    },
  };

  // Data for pie chart (all turfs)
  const turfChartData = useMemo(() => ({
    labels: turfs.map((t) => t.turf_name || `Turf ID: ${t.id}`),
    datasets: [
      {
        label: "Revenue",
        data: turfs.map((t) => t.total_revenue ?? 0),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  }), [turfs]);

  const selectedData = turfs.find((t) => t.turf_id === selectedTurf);

  return (
    <div className="container">
      <h4 className="fw-bold mb-4">🏟 Turf Performance Report</h4>

      {/* Turf Selector */}
      <div className="card p-3 mb-4 shadow-sm border-0">
        <label className="fw-semibold">Select Turf</label>
        <select
          className="form-select"
          value={selectedTurf}
          onChange={(e) => setSelectedTurf(e.target.value)}
        >
          <option value="">-- All Turfs --</option>
          {turfs.map((t) => (
            <option key={t.turf_id} value={t.turf_id}>
              {t.turf_name || `Turf ${t.turf_id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Summary for selected turf */}
      {selectedData ? (
        <div className="card p-4 mb-4 shadow-sm border-0">
          <h5 className="fw-semibold text-primary mb-2">
            {selectedData.turf_name}
          </h5>
          <p><strong>Total Bookings:</strong> {selectedData.total_bookings}</p>
          <p><strong>Total Revenue:</strong> ₹{selectedData.total_revenue}</p>
        </div>
      ) : (
        <p className="text-muted">No turf selected. Showing overall data.</p>
      )}

      {/* All Turf Revenue Chart */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <h5 className="fw-semibold text-center mb-3">Revenue Per Turf</h5>
        <div style={{ height: 350 }}>
          <Pie data={turfChartData as any} options={options as any} />
        </div>
      </div>

      {/* If a turf is selected, show detailed chart */}
      {selectedData && (
        <div className="card p-4 shadow-sm border-0 mb-4">
          <h6 className="fw-semibold text-center">Bookings vs Revenue</h6>
          <div style={{ height: 300 }}>
            <Bar
              data={{
                labels: ["Bookings", "Revenue (₹)"],
                datasets: [
                  {
                    label: "Bookings",
                    data: [selectedData.total_bookings],
                    backgroundColor: "#36A2EB",
                  },
                  {
                    label: "Revenue",
                    data: [selectedData.total_revenue],
                    backgroundColor: "#FF9F40",
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TurfReport;
