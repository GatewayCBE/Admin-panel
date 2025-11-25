import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

interface SingleDayReportProps {
  daily: any[];
}

const SingleDayReport: React.FC<SingleDayReportProps> = ({ daily }) => {
  const [selectedDate, setSelectedDate] = useState("");

  // Find the selected date's data
  const dayData = daily.find((d) => d.id === selectedDate);

  return (
    <div className="container">
      {/* 🔍 Date Selector */}
      <div className="card p-3 mb-4 shadow-sm border-0">
        <label className="fw-semibold">Select Date</label>
        <select
          className="form-select mt-2"
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

      {/* ❗ If no date selected */}
      {!dayData && <p className="text-center text-muted">Please select a date to view analytics.</p>}

      {/* 📊 Report Section */}
      {dayData && (
        <div>
          {/* Overall Stats */}
          <div className="card shadow-sm p-4 mb-4 border-0">
            <h5 className="fw-semibold text-center mb-3">📆 Report for {selectedDate}</h5>
            <p><strong>Total Bookings:</strong> {dayData.total_bookings}</p>
            <p><strong>Total Revenue:</strong> ₹{dayData.total_revenue}</p>
          </div>

          {/* Day vs Night Chart */}
          <div className="card shadow-sm p-4 mb-4 border-0">
            <h6 className="fw-semibold text-center">Day vs Night Performance</h6>

            <div style={{ height: 300 }}>
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
                      backgroundColor: ["#4CAF50", "#FF7043"],
                    },
                    {
                      label: "Revenue (₹)",
                      data: [
                        dayData?.time_split?.day?.revenue ?? 0,
                        dayData?.time_split?.night?.revenue ?? 0,
                      ],
                      backgroundColor: ["#81C784", "#FF8A65"],
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: "top" } } }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDayReport;
