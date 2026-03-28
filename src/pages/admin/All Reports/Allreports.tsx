import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

interface AllReportsProps {
  bookings: any[];
}

type FilterPeriod = "day" | "week" | "month" | "custom";
type ReportType = "all" | "turf" | "user" | "owner" | "bookingDate" | "slotDate" | "turfId";

const AllReports: React.FC<AllReportsProps> = ({ bookings }) => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("day");
  const [reportType, setReportType] = useState<ReportType>("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [selectedTurf, setSelectedTurf] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [bookingIdSearch, setBookingIdSearch] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterPeriod,
    selectedDate,
    startDate,
    endDate,
    reportType,
    selectedOwner,
    selectedTurf,
    selectedUser,
    bookingIdSearch,
  ]);

  // Helper: Check if slot is day (6AM-6PM) or night
  const isNightSlot = (time: string): boolean => {
    const hour = parseInt(time.split(":")[0]);
    return hour < 6 || hour >= 18;
  };

  // Helper: Parse date from DD-MMM-YYYY format
  const parseBookingDate = (dateStr: string): Date => {
    try {
      const [day, month, year] = dateStr.split("-");
      const monthMap: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      return new Date(parseInt(year), monthMap[month] || 0, parseInt(day));
    } catch {
      return new Date(0); // far past date for sorting safety
    }
  };

  // Get unique owners, turfs, users ...
  const owners = useMemo(() => {
    const ownerMap = new Map();
    bookings.forEach((b) => {
      if (b.ownerId && !ownerMap.has(b.ownerId)) {
        const ownerName = b.ownerName || `Owner ${b.ownerId.split("_")[1] || b.ownerId}`;
        ownerMap.set(b.ownerId, ownerName);
      }
    });
    return Array.from(ownerMap.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const ownerTurfs = useMemo(() => {
    if (reportType !== "owner" || selectedOwner === "all") return [];
    const turfMap = new Map();
    bookings
      .filter((b) => b.ownerId === selectedOwner)
      .forEach((b) => {
        if (b.turfId && !turfMap.has(b.turfId)) {
          turfMap.set(b.turfId, b.turfName || b.turfId);
        }
      });
    return Array.from(turfMap.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings, selectedOwner, reportType]);

  const turfs = useMemo(() => {
    const turfMap = new Map();
    bookings.forEach((b) => {
      if (b.turfId && !turfMap.has(b.turfId)) {
        turfMap.set(b.turfId, b.turfName || b.turfId);
      }
    });
    return Array.from(turfMap.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const users = useMemo(() => {
    const userMap = new Map();
    bookings.forEach((b) => {
      if (b.userId && !userMap.has(b.userId)) {
        userMap.set(b.userId, b.userName || b.userId);
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    return bookings.filter((booking) => {
      if (!booking.selectedDate) return false;

      const bookingDate = parseBookingDate(booking.selectedDate);

      // Date range filter
      if (filterPeriod === "day") {
        const selected = new Date(selectedDate);
        if (bookingDate.toDateString() !== selected.toDateString()) return false;
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (bookingDate < start || bookingDate > end) return false;
      }

      // Report type filters
      if (reportType === "owner") {
        if (selectedOwner !== "all" && booking.ownerId !== selectedOwner) return false;
        if (selectedTurf !== "all" && booking.turfId !== selectedTurf) return false;
      } else if (reportType === "turf") {
        if (selectedTurf !== "all" && booking.turfId !== selectedTurf) return false;
      } else if (reportType === "user") {
        if (selectedUser !== "all" && booking.userId !== selectedUser) return false;
      } else if (reportType === "bookingDate") {
        if (!booking.createdAt) return false;
        // Note: assuming createdAt is timestamp object with seconds
        const createdDate = booking.createdAt?.seconds
          ? new Date(booking.createdAt.seconds * 1000)
          : new Date();
        if (filterPeriod === "day") {
          const selected = new Date(selectedDate);
          if (createdDate.toDateString() !== selected.toDateString()) return false;
        } else {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (createdDate < start || createdDate > end) return false;
        }
      }

      return true;
    });
  }, [
    bookings,
    filterPeriod,
    selectedDate,
    startDate,
    endDate,
    reportType,
    selectedOwner,
    selectedTurf,
    selectedUser,
  ]);

  // Sorted — newest slot date first
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      const dateA = a.selectedDate ? parseBookingDate(a.selectedDate) : new Date(0);
      const dateB = b.selectedDate ? parseBookingDate(b.selectedDate) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredBookings]);

  // Paginated data for All tab
  const paginatedAllBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedBookings, currentPage]);

  const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);

  // Day & Night (sorted but not paginated yet)
  const dayBookings = useMemo(() => {
    return sortedBookings.filter((b) =>
      b.slots?.some((slot: string) => !isNightSlot(slot))
    );
  }, [sortedBookings]);

  const nightBookings = useMemo(() => {
    return sortedBookings.filter((b) =>
      b.slots?.some((slot: string) => isNightSlot(slot))
    );
  }, [sortedBookings]);

  // ────────────────────────────────────────────────────────────────
  //  Metrics, charts, export functions remain mostly unchanged
  // ────────────────────────────────────────────────────────────────

  const calculateMetrics = (bookingList: any[]) => {
    const totalRevenue = bookingList.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalPaid = bookingList.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalBalance = bookingList.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

    const statusBreakdown = bookingList.reduce((acc, b) => {
      const status = b.bookingStatus || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBookings: bookingList.length,
      totalRevenue,
      totalPaid,
      totalBalance,
      statusBreakdown,
    };
  };

  const allMetrics = calculateMetrics(sortedBookings);
  const dayMetrics = calculateMetrics(dayBookings);
  const nightMetrics = calculateMetrics(nightBookings);

  // Trend data (using filtered & sorted lists)
  const trendData = useMemo(() => {
    const dateMap = new Map<string, { dayRevenue: number; nightRevenue: number; dayCount: number; nightCount: number }>();

    sortedBookings.forEach((booking) => {
      const date = booking.selectedDate;
      if (!date) return;
      const current = dateMap.get(date) || { dayRevenue: 0, nightRevenue: 0, dayCount: 0, nightCount: 0 };

      const isNight = booking.slots?.some((s: string) => isNightSlot(s)) ?? false;
      if (isNight) {
        dateMap.set(date, {
          ...current,
          nightRevenue: current.nightRevenue + (booking.totalAmount || 0),
          nightCount: current.nightCount + 1,
        });
      } else {
        dateMap.set(date, {
          ...current,
          dayRevenue: current.dayRevenue + (booking.totalAmount || 0),
          dayCount: current.dayCount + 1,
        });
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort((a, b) =>
      parseBookingDate(b).getTime() - parseBookingDate(a).getTime()
    );

    return {
      labels: sortedDates,
      dayRevenue: sortedDates.map(d => dateMap.get(d)?.dayRevenue || 0),
      nightRevenue: sortedDates.map(d => dateMap.get(d)?.nightRevenue || 0),
      dayCount: sortedDates.map(d => dateMap.get(d)?.dayCount || 0),
      nightCount: sortedDates.map(d => dateMap.get(d)?.nightCount || 0),
    };
  }, [sortedBookings]);

  // Export CSV (example - can be extended)
  const exportToCSV = (list: any[], filename: string) => {
    const headers = [
      "Booking ID", "Slot Date", "Venue", "Time", "Type", "Total", "Paid", "Balance", "Status"
    ];

    const rows = list.map(b => [
      b.bookingId || "",
      b.selectedDate || "",
      b.turfName || "",
      `${b.slotStartTime || ""}-${b.slotEndTime || ""}`,
      b.slots?.some(isNightSlot) ? "Night" : "Day",
      b.totalAmount || 0,
      b.paidAmount || 0,
      b.balanceAmount || 0,
      b.bookingStatus || "",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid px-3 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-success">Advanced Booking Reports</h2>
      </div>

      {/* Filters Section */}
      <div className="card shadow-lg mb-4" style={{ 
        borderRadius: "20px",
        border: "none",
        background: "rgba(255, 255, 255, 0.95)"
      }}>
        <div className="card-body p-4">
          <div className="row g-3">
            {/* Period Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">Time Period</label>
              <select
                className="form-select"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                style={{ borderRadius: "10px" }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Day: Single Date Selector */}
            {filterPeriod === "day" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ borderRadius: "10px" }}
                />
              </div>
            )}

            {/* Week: Start and End Date */}
            {filterPeriod === "week" && (
              <>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Week Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Week End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </>
            )}

            {/* Month: Start and End Date */}
            {filterPeriod === "month" && (
              <>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Month Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Month End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </>
            )}

            {/* Custom: Start and End Date */}
            {filterPeriod === "custom" && (
              <>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Custom Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Custom End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </div>
              </>
            )}

            {/* Report Type */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as ReportType);
                  setSelectedOwner("all");
                  setSelectedTurf("all");
                  setSelectedUser("all");
                }}
                style={{ borderRadius: "10px" }}
              >
                <option value="all">All Bookings</option>
                <option value="turf">By Turf</option>
                <option value="user">By User</option>
                <option value="owner">By Owner</option>
                <option value="bookingDate">By Booking Date</option>
                <option value="slotDate">By Slot Date</option>
                <option value="turfId">By Turf ID</option>
              </select>
            </div>

            {/* Owner Selector */}
            {reportType === "owner" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select Owner</label>
                <select
                  className="form-select"
                  value={selectedOwner}
                  onChange={(e) => {
                    setSelectedOwner(e.target.value);
                    setSelectedTurf("all");
                  }}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">All Owners</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Turf Selector for Owner */}
            {reportType === "owner" && selectedOwner !== "all" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select Turf</label>
                <select
                  className="form-select"
                  value={selectedTurf}
                  onChange={(e) => setSelectedTurf(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">All Turfs</option>
                  {ownerTurfs.map((turf) => (
                    <option key={turf.id} value={turf.id}>
                      {turf.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Turf Selector for By Turf */}
            {reportType === "turf" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select Turf</label>
                <select
                  className="form-select"
                  value={selectedTurf}
                  onChange={(e) => setSelectedTurf(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">All Turfs</option>
                  {turfs.map((turf) => (
                    <option key={turf.id} value={turf.id}>
                      {turf.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Selector */}
            {reportType === "user" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select User</label>
                <select
                  className="form-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Turf Selector for By Turf ID */}
            {reportType === "turfId" && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select Turf</label>
                <select
                  className="form-select"
                  value={selectedTurf}
                  onChange={(e) => setSelectedTurf(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">All Turfs</option>
                  {turfs.map((turf) => (
                    <option key={turf.id} value={turf.id}>
                      {turf.name} ({turf.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date Range Display */}
          {filterPeriod !== "day" && (
            <div className="alert alert-info mt-3 mb-0" role="alert">
              <strong>📅 Selected Date Range:</strong> {startDate} to {endDate}
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-4 mb-4">
        {/* All Bookings */}
        <div className="col-lg-4">
          <div className="card shadow-lg h-100" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(135deg, #7dee73 0%, #0c8816 100%)"
          }}>
            <div className="card-body p-4 text-white">
              <h5 className="mb-3">📊 All Bookings</h5>
              <h2 className="fw-bold">{allMetrics.totalBookings}</h2>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Revenue:</span>
                  <span className="fw-bold">₹{allMetrics.totalRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Paid:</span>
                  <span className="fw-bold">₹{allMetrics.totalPaid.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                className="btn btn-light btn-sm mt-3 w-100"
                onClick={() => exportToCSV(filteredBookings, "all-bookings")}
              >
                📥 Export All
              </button>
            </div>
          </div>
        </div>

        {/* Day Bookings */}
        <div className="col-lg-4">
          <div className="card shadow-lg h-100" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(135deg,  #7dee73 0%, #0c8816 100%)"
          }}>
            <div className="card-body p-4 text-white">
              <h5 className="mb-3">☀️ Day Bookings</h5>
              <h2 className="fw-bold">{dayMetrics.totalBookings}</h2>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Revenue:</span>
                  <span className="fw-bold">₹{dayMetrics.totalRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Paid:</span>
                  <span className="fw-bold">₹{dayMetrics.totalPaid.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                className="btn btn-light btn-sm mt-3 w-100"
                onClick={() => exportToCSV(dayBookings, "day-bookings")}
              >
                📥 Export Day
              </button>
            </div>
          </div>
        </div>

        {/* Night Bookings */}
        <div className="col-lg-4">
          <div className="card shadow-lg h-100" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(135deg, #7dee73 0%, #0c8816 100%)"
          }}>
            <div className="card-body p-4 text-white">
              <h5 className="mb-3">🌙 Night Bookings</h5>
              <h2 className="fw-bold">{nightMetrics.totalBookings}</h2>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Revenue:</span>
                  <span className="fw-bold">₹{nightMetrics.totalRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Paid:</span>
                  <span className="fw-bold">₹{nightMetrics.totalPaid.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                className="btn btn-light btn-sm mt-3 w-100"
                onClick={() => exportToCSV(nightBookings, "night-bookings")}
              >
                📥 Export Night
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Revenue Comparison Chart */}
        <div className="col-lg-6">
          <div className="card shadow-lg" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">📈 Day vs Night Revenue Trend</h5>
              {trendData.labels.length > 0 ? (
                <Bar
                  data={{
                    labels: trendData.labels,
                    datasets: [
                      {
                        label: "Day Revenue",
                        data: trendData.dayRevenue,
                        backgroundColor: "rgba(255, 193, 7, 0.7)",
                        borderColor: "#ffc107",
                        borderWidth: 1,
                      },
                      {
                        label: "Night Revenue",
                        data: trendData.nightRevenue,
                        backgroundColor: "rgba(13, 110, 253, 0.7)",
                        borderColor: "#0d6efd",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Revenue (₹)",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <p className="text-center text-muted">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Count Comparison */}
        <div className="col-lg-6">
          <div className="card shadow-lg" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">📊 Day vs Night Bookings Count</h5>
              {trendData.labels.length > 0 ? (
                <Line
                  data={{
                    labels: trendData.labels,
                    datasets: [
                      {
                        label: "Day Bookings",
                        data: trendData.dayCount,
                        borderColor: "#ffc107",
                        backgroundColor: "rgba(255, 193, 7, 0.1)",
                        tension: 0.4,
                      },
                      {
                        label: "Night Bookings",
                        data: trendData.nightCount,
                        borderColor: "#0d6efd",
                        backgroundColor: "rgba(13, 110, 253, 0.1)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of Bookings",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <p className="text-center text-muted">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card shadow-lg" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">All Bookings Status</h5>
              {Object.keys(allMetrics.statusBreakdown).length > 0 ? (
                <Doughnut
                  data={{
                    labels: Object.keys(allMetrics.statusBreakdown),
                    datasets: [
                      {
                        data: Object.values(allMetrics.statusBreakdown),
                        backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              ) : (
                <p className="text-center text-muted">No data</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-lg" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Day Bookings Status</h5>
              {Object.keys(dayMetrics.statusBreakdown).length > 0 ? (
                <Doughnut
                  data={{
                    labels: Object.keys(dayMetrics.statusBreakdown),
                    datasets: [
                      {
                        data: Object.values(dayMetrics.statusBreakdown),
                        backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              ) : (
                <p className="text-center text-muted">No data</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-lg" style={{ 
            borderRadius: "20px",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Night Bookings Status</h5>
              {Object.keys(nightMetrics.statusBreakdown).length > 0 ? (
                <Doughnut
                  data={{
                    labels: Object.keys(nightMetrics.statusBreakdown),
                    datasets: [
                      {
                        data: Object.values(nightMetrics.statusBreakdown),
                        backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              ) : (
                <p className="text-center text-muted">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="card shadow-lg">
        <div className="card-body">

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Booking ID..."
              value={bookingIdSearch}
              onChange={(e) => setBookingIdSearch(e.target.value)}
            />
          </div>

          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#all">
                All ({sortedBookings.length})
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" data-bs-toggle="tab" data-bs-target="#day">
                Day ({dayBookings.length})
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" data-bs-toggle="tab" data-bs-target="#night">
                Night ({nightBookings.length})
              </button>
            </li>
          </ul>

          <div className="tab-content">
            <div className="tab-pane fade show active" id="all">
              <BookingTable
                bookings={
                  bookingIdSearch
                    ? sortedBookings.filter(b =>
                        (b.bookingId || "").toLowerCase().includes(bookingIdSearch.toLowerCase())
                      )
                    : paginatedAllBookings
                }
                isNightSlot={isNightSlot}
              />

              {/* Pagination */}
              {sortedBookings.length > 0 && !bookingIdSearch && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages} ({sortedBookings.length} total)
                  </span>

                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="tab-pane fade" id="day">
              <BookingTable bookings={dayBookings} isNightSlot={isNightSlot} />
            </div>

            <div className="tab-pane fade" id="night">
              <BookingTable bookings={nightBookings} isNightSlot={isNightSlot} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// BookingTable component (unchanged from your last version)
const BookingTable: React.FC<{ bookings: any[]; isNightSlot: (time: string) => boolean }> = ({
  bookings,
  isNightSlot,
}) => {
  if (bookings.length === 0) {
    return <p className="text-center text-muted py-5">No bookings found</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <tr>
            <th>Booking ID</th>
            <th>Date of Booking</th>
            <th>Slot Date</th>
            <th>Slot Time</th>
            <th>Venue Name</th>
            <th>Venue ID</th>
            <th>Total Amount</th>
            <th>Paid Amount</th>
            <th>Balance</th>
            <th>Payment Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => {
            const formatTime = (time?: string) => (time ? time.padStart(5, "0") : "N/A");

            const bookingDate = booking.createdAt
              ? new Date(booking.createdAt?.seconds * 1000).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            const paymentDate = bookingDate; // fallback - improve if you have real payment date

            const venueIdShort = booking.turfId|| "N/A";

            return (
              <tr key={booking.bookingId || index}>
                <td><small className="font-monospace">{booking.bookingId || "N/A"}</small></td>
                <td>{bookingDate}</td>
                <td>{booking.selectedDate || "N/A"}</td>
                <td>
                  <small>
                    {formatTime(booking.slotStartTime)}
                    {booking.slotEndTime && booking.slotEndTime !== booking.slotStartTime
                      ? ` - ${formatTime(booking.slotEndTime)}`
                      : ""}
                  </small>
                </td>
                <td>{booking.turfName || "N/A"}</td>
                <td><small>{venueIdShort}</small></td>
                <td className="fw-semibold">₹{booking.totalAmount || 0}</td>
                <td className="text-success fw-semibold">₹{booking.paidAmount || 0}</td>
                <td className="text-danger fw-semibold">₹{booking.balanceAmount || 0}</td>
                <td>{paymentDate}</td>
                <td>
                  <span
                    className={`badge ${
                      booking.bookingStatus === "CONFIRMED" ? "bg-success" :
                      booking.bookingStatus === "PENDING" ? "bg-warning" :
                      booking.bookingStatus === "CANCELLED" ? "bg-danger" :
                      "bg-secondary"
                    }`}
                  >
                    {booking.bookingStatus || "UNKNOWN"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AllReports;