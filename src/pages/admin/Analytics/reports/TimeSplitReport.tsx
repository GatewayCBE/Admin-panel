import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

interface TimeSplitReportProps {
  daily: any[];
}

const TimeSplitReport: React.FC<TimeSplitReportProps> = ({ daily }) => {
  const [selectedDate, setSelectedDate] = useState("all");

  if (!daily || daily.length === 0) {
    return <p className="text-muted text-center">No time-split data available.</p>;
  }

  // 🔹 Filter data based on selection
  const filteredData =
    selectedDate === "all" ? daily : daily.filter((d) => d.id === selectedDate);

  // Totals
  let totalDayBookings = 0,
    totalDayRevenue = 0,
    totalNightBookings = 0,
    totalNightRevenue = 0,
    totalWeekdayBookings = 0,
    totalWeekdayRevenue = 0,
    totalWeekendBookings = 0,
    totalWeekendRevenue = 0;

  const isWeekend = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    const date = new Date(`${month} ${day}, ${year}`);
    return date.getDay() === 6 || date.getDay() === 0;
  };

  filteredData.forEach((d) => {
    const dayBookings = d?.time_split?.day?.bookings ?? 0;
    const dayRevenue = d?.time_split?.day?.revenue ?? 0;
    const nightBookings = d?.time_split?.night?.bookings ?? 0;
    const nightRevenue = d?.time_split?.night?.revenue ?? 0;

    totalDayBookings += dayBookings;
    totalDayRevenue += dayRevenue;
    totalNightBookings += nightBookings;
    totalNightRevenue += nightRevenue;

    if (isWeekend(d.id)) {
      totalWeekendBookings += d.total_bookings ?? 0;
      totalWeekendRevenue += d.total_revenue ?? 0;
    } else {
      totalWeekdayBookings += d.total_bookings ?? 0;
      totalWeekdayRevenue += d.total_revenue ?? 0;
    }
  });

  const dayNightData = {
    labels: ["Day", "Night"],
    datasets: [
      { label: "Bookings", data: [totalDayBookings, totalNightBookings] },
      { label: "Revenue (₹)", data: [totalDayRevenue, totalNightRevenue] },
    ],
  };

  const weekData = {
    labels: ["Weekday", "Weekend"],
    datasets: [
      { label: "Bookings", data: [totalWeekdayBookings, totalWeekendBookings] },
      { label: "Revenue (₹)", data: [totalWeekdayRevenue, totalWeekendRevenue] },
    ],
  };

  const options = { responsive: true, plugins: { legend: { position: "top" } } };

  return (
    <div className="container">

      {/* 🔹 Date filter dropdown */}
      <div className="mb-3 text-end">
        <select
          className="form-select w-auto d-inline"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="all">All Dates</option>
          {daily.map((d) => (
            <option key={d.id} value={d.id}>{d.id}</option>
          ))}
        </select>
      </div>

      {/* 📊 Day vs Night */}
      <div className="card shadow-sm p-4 mb-4">
        <h5 className="fw-semibold text-center">Day vs Night Analysis</h5>
        <div style={{ height: 300 }}>
          <Bar data={dayNightData as any} options={options as any} />
        </div>
        <p className="mt-3 text-center">
          <strong>Day:</strong> {totalDayBookings} bookings | ₹{totalDayRevenue} Revenue<br />
          <strong>Night:</strong> {totalNightBookings} bookings | ₹{totalNightRevenue} Revenue
        </p>
      </div>

      {/* 📋 Tabular Breakdown */}
      <div className="card shadow-sm p-4">
        <h6 className="fw-semibold mb-3">📌 Detailed Breakdown ({selectedDate === "all" ? "All Dates" : selectedDate})</h6>
        <table className="table table-bordered">
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
  );
};

export default TimeSplitReport;
