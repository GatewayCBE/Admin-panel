// src/pages/admin/Analytics/RecentBookingsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { getAllBookings } from "../../../services/firestoreService";
import AdminNavbar from "./AdminNavbar";

type BookingRow = {
  booking_id: string;
  booking_username?: string;
  turf_name?: string;
  turfName?: string;
  sport?: string;
  court?: string;
  date?: string;
  slot_start_time?: string;
  time?: string;
  paid_amount?: number;
  unpaid_amount?: number;

  // ✅ NEW NORMALIZED STATUS
  booking_status: "paid" | "pending" | "cancelled";

  // optional but useful
  cancelled?: boolean;
  payment_initiated_time?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const RecentBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getAllBookings();
        if (mounted) setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.booking_status !== statusFilter) {
        return false;
      }

      if (!q) return true;

      return (
        (b.booking_username || "").toLowerCase().includes(q) ||
        (b.booking_id || "").toLowerCase().includes(q) ||
        (b.turf_name || "").toLowerCase().includes(q) ||
        (b.sport || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, pageSize]);

  return (
    <div className="admin-page-container">
      <AdminNavbar />
      <div className="container-fluid py-5 px-4 mt-5">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div className="d-flex align-items-center gap-4">
            <button
              className="btn btn-outline-secondary d-lg-none rounded-pill px-4"
              onClick={() => setMobileSidebarOpen(true)}
            >
              Menu
            </button>
            <div>
              <h1 className="h3 mb-1 fw-bold text-dark">Bookings</h1>
              <p className="text-muted mb-0">
                Real-time admin view across all turfs
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="d-flex gap-3 align-items-center">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-lg rounded-pill ps-5 shadow-sm border-0"
                placeholder="Search by user, ID, turf, sport, date, amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 460, height: 54 }}
              />
              {/* Magnifying Glass Icon — stays fixed, never overlaps */}
              <span className="position-absolute top-50 start-0 translate-middle-y ps-4 text-success">
                <i className="bi bi-search"></i>
              </span>
            </div>

            <select
              className="form-select form-select-lg rounded-pill shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="form-select form-select-lg rounded-pill shadow-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ width: 130 }}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} rows
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Card */}
        <div className="card border-0 rounded-4 overflow-hidden shadow-card">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: "3.5rem", height: "3.5rem" }}
                ></div>
                <p className="mt-4 text-muted fs-5">
                  Loading latest bookings...
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead
                      className="bg-gradient text-white"
                      style={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                      }}
                    >
                      <tr>
                        <th className="ps-4 py-4 fw-semibold">Booking ID</th>
                        <th className="py-4 fw-semibold">User</th>
                        <th className="py-4 fw-semibold">Turf</th>
                        <th className="py-4 fw-semibold">Sport / Court</th>
                        <th className="py-4 fw-semibold">Date</th>
                        <th className="py-4 fw-semibold">Time</th>
                        <th className="text-end py-4 fw-semibold pe-4">
                          Paid (₹)
                        </th>
                        <th className="text-end py-4 fw-semibold pe-4">
                          Pending (₹)
                        </th>
                        <th className="text-center py-4 fw-semibold pe-4">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {pageData.map((b, i) => (
                        <tr
                          key={`${b.booking_id}-${i}`}
                          className="border-bottom"
                        >
                          <td
                            className="ps-4 py-4 fw-medium text-primary"
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.92rem",
                            }}
                          >
                            {b.booking_id}
                          </td>
                          <td className="py-4 fw-medium">
                            {b.booking_username || "Guest"}
                          </td>
                          <td className="py-4 fw-semibold text-dark">
                            {b.turf_name || b.turfName}
                          </td>
                          <td className="py-4 text-muted">
                            {b.sport} / {b.court}
                          </td>
                          <td className="py-4">{b.date}</td>
                          <td className="py-4 fw-medium">
                            {b.slot_start_time || b.time}
                          </td>
                          <td className="text-end py-4 fw-bold text-success pe-4">
                            ₹
                            {Number(b.paid_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="text-end py-4 text-danger pe-4">
                            ₹
                            {Number(b.unpaid_amount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td className="text-center pe-4 py-4">
                            {b.booking_status === "paid" && (
                              <span className="badge px-4 py-2 fs-6 fw-semibold rounded-pill bg-success text-white">
                                Paid
                              </span>
                            )}

                            {b.booking_status === "pending" && (
                              <span className="badge px-4 py-2 fs-6 fw-semibold rounded-pill bg-warning text-dark">
                                Pending
                              </span>
                            )}

                            {b.booking_status === "cancelled" && (
                              <span className="badge px-4 py-2 fs-6 fw-semibold rounded-pill bg-danger text-white">
                                Cancelled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-5">
                    <div className="text-muted fs-4 mb-3">
                      No bookings found
                    </div>
                    <p className="text-muted">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center px-4 py-4 bg-light border-top">
                  <div className="text-muted fw-medium">
                    Showing <strong>{pageData.length}</strong> of{" "}
                    <strong>{filtered.length}</strong> bookings
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      className="btn btn-outline-primary rounded-pill px-4"
                      disabled={page <= 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </button>
                    <span className="fw-bold text-primary">
                      Page {page + 1} of {pageCount}
                    </span>
                    <button
                      className="btn btn-primary rounded-pill px-4"
                      disabled={page >= pageCount - 1}
                      onClick={() =>
                        setPage((p) => Math.min(pageCount - 1, p + 1))
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentBookingsPage;
