import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";

interface WeekSplitReportProps {
  daily: any[];
}

const WeekSplitReport: React.FC<WeekSplitReportProps> = ({ daily }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const isWeekend = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    const date = new Date(`${month} ${day}, ${year}`);
    return date.getDay() === 6 || date.getDay() === 0;
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${month} ${day}, ${year}`);
  };

  // Filter based on selected date range
  const filteredData = daily.filter((d) => {
    if (!startDate || !endDate) return true; // If no range selected
    const currentDate = parseDate(d.id);
    return currentDate >= startDate && currentDate <= endDate;
  });

  let totalWeekdayBookings = 0;
  let totalWeekdayRevenue = 0;
  let totalWeekendBookings = 0;
  let totalWeekendRevenue = 0;

  filteredData.forEach((d) => {
    if (isWeekend(d.id)) {
      totalWeekendBookings += d.total_bookings ?? 0;
      totalWeekendRevenue += d.total_revenue ?? 0;
    } else {
      totalWeekdayBookings += d.total_bookings ?? 0;
      totalWeekdayRevenue += d.total_revenue ?? 0;
    }
  });

  const weekData = {
    labels: ["Weekday", "Weekend"],
    datasets: [
      {
        label: "Bookings",
        data: [totalWeekdayBookings, totalWeekendBookings],
        backgroundColor: ["#42A5F5", "#AB47BC"],
      },
      {
        label: "Revenue (₹)",
        data: [totalWeekdayRevenue, totalWeekendRevenue],
        backgroundColor: ["#90CAF9", "#CE93D8"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: false } },
  };

  return (
    <div className="container">

      {/* Header & Date Filter */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-semibold">Weekday vs Weekend Analysis</h5>

        <div className="d-flex gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="From Date"
            className="form-control"
            dateFormat="dd-MMM-yyyy"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="To Date"
            className="form-control"
            dateFormat="dd-MMM-yyyy"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="card shadow-sm p-4 mb-4 border-0">
        <div style={{ height: 300 }}>
          <Bar data={weekData as any} options={options as any} />
        </div>
        <div className="mt-3">
          <p><strong>Weekday:</strong> {totalWeekdayBookings} bookings | ₹{totalWeekdayRevenue}</p>
          <p><strong>Weekend:</strong> {totalWeekendBookings} bookings | ₹{totalWeekendRevenue}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm p-4 border-0">
        <h6 className="fw-semibold mb-3">📌 Detailed Breakdown</h6>
        <table className="table table-bordered table-hover table-sm">
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
                <td>{isWeekend(d.id) ? "Weekend" : "Weekday"}</td>
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

export default WeekSplitReport;
