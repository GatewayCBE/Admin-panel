// src/pages/admin/Analytics/RecentBookingsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import AdminSidebar from "../Analytics/AdminSidebar";
import { getAllBookings } from "../../../services/firestoreService";

type BookingRow = {
  booking_id: string;
  booking_username?: string;
  turfName?: string;
  turf_name?: string;
  sport?: string;
  court?: string;
  date?: string;
  slot_start_time?: string;
  time?: string;
  paid_amount?: number;
  unpaid_amount?: number;
  payment_status?: string;
  payment_initiated_time?: string;
  [key: string]: any;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const parseStringTimestampToDate = (s?: string) => {
  if (!s) return null;
  const t = s.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (s?: string) => {
  const d = parseStringTimestampToDate(s);
  if (!d) return s || "-";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

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
        // fetch 200 latest across turfs/days; we'll paginate client-side
        getAllBookings().then(setBookings);
      } catch (err) {
        console.error("Failed to fetch recent bookings:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all") {
        const st = (b.payment_status || "").toLowerCase();
        if (statusFilter === "paid" && !st.includes("pay") && st !== "paymentsuccess") return false;
        if (statusFilter === "pending" && st.includes("pay")) return false;
      }
      if (!q) return true;
      return (
        (b.booking_username || "").toLowerCase().includes(q) ||
        (b.booking_id || "").toLowerCase().includes(q) ||
        (b.turfName || b.turf_name || "").toLowerCase().includes(q) ||
        (b.sport || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    // reset page when filters change
    setPage(0);
  }, [search, statusFilter, pageSize]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <AdminSidebar isOpen={mobileSidebarOpen} closeSidebar={() => setMobileSidebarOpen(false)} />

      <main className="flex-grow-1">
        {/* Remove left margin on mobile */}
        <style>{`
          @media (max-width: 991px) {
            main { margin-left: 0 !important; }
          }
        `}</style>
        <div className="container-fluid py-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light shadow-sm d-lg-none" 
              onClick={() => setMobileSidebarOpen(true)}
              >
                ☰
            </button>
              <div>
                <h2 className="h4 mb-0 fw-bold">Recent Bookings</h2>
                <small className="text-muted">Admin view — latest bookings across all turfs</small>
              </div>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <input className="form-control form-control-sm" placeholder="Search by user / id / turf / sport" style={{ width: 340 }} value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>

              <select className="form-select form-select-sm" style={{ width: 90 }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="card shadow-sm rounded-4 border-0">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <div className="mt-2">Loading recent bookings...</div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: 160 }}>Booking ID</th>
                          <th>User</th>
                          <th>Turf</th>
                          <th>Sport / Court</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th className="text-end">Paid (₹)</th>
                          <th className="text-end">Pending (₹)</th>
                          <th style={{ width: 130 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((b, i) => (
                          <tr key={`${b.booking_id}-${i}`}>
                            <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {b.booking_id || "-"}
                            </td>
                            <td>{b.booking_username || "Unknown"}</td>
                            <td>{b.turfName || b.turf_name || "-"}</td>
                            <td>{(b.sport || "-") + " / " + (b.court || "-")}</td>
                            <td>{b.date || "-"}</td>
                            <td>{b.slot_start_time || b.time || "-"}</td>
                            <td className="text-end">₹{Number(b.paid_amount ?? 0).toLocaleString("en-IN")}</td>
                            <td className="text-end">₹{Number(b.unpaid_amount ?? 0).toLocaleString("en-IN")}</td>
                            <td>
                              <span className={`badge ${
                                (b.payment_status || "").toString().toLowerCase().includes("pay") ||
                                (b.payment_status || "").toString().toLowerCase() === "paymentsuccess"
                                ? "bg-success"
                                : "bg-warning text-dark"
                              }`}>
                                {b.payment_status || "unknown"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filtered.length === 0 && (
                    <div className="text-center text-muted py-4">No bookings match your filters.</div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted small">Showing {pageData.length} of {filtered.length}</div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-secondary" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
                      <span className="small text-muted">Page {page + 1} of {pageCount}</span>
                      <button className="btn btn-sm btn-outline-secondary" disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default RecentBookingsPage;