import React, { useState, useEffect, useMemo } from "react";
import {
  getUserBookings,
  cancelBooking,
  canCancelBooking,
} from "../../../services/firestoreService";
import { auth } from "../../../firebase";
import { format } from "date-fns";
import { useAuth } from "../Turf/useAuth";
import { Modal, Button, Badge, Spinner, Toast } from "react-bootstrap";

const UserBookings: React.FC = () => {
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Search & date filter
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal & toast
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");

  const { user, loading: authLoading, isAdmin, claims } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (authLoading) return;
      if (!isAdmin) {
        setError("Admin access required to view all bookings");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getUserBookings();
        setRawBookings(data);
      } catch (err: any) {
        console.error("Failed to load user bookings:", err);
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [authLoading, isAdmin]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr || "—";
    }
  };

  const parseDate = (str: string): Date | null => {
    if (!str) return null;
    // Try ISO string first (YYYY-MM-DD)
    const iso = new Date(str);
    if (!isNaN(iso.getTime())) return iso;
    // Try dd-Mon-yyyy
    const match = str.match(/^(\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/i);
    if (match) {
      const parsed = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const toMidnight = (d: Date): Date => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const getDate = (b: any): string =>
    [b.date, b.selectedDate, b.selecteddated, b.bookingDate, b.selected_date]
      .find((v) => v && typeof v === "string" && v.trim()) || "—";

  const getTurfName = (b: any): string =>
    [b.turf_name, b.turfName, b.turf, b.turfName_, b.venueName]
      .find((v) => v && typeof v === "string" && v.trim()) || "Unknown Turf";

  const getSport = (b: any): string =>
    [b.booked_sports_name, b.bookedSportsName, b.sport, b.sportsName, b.booked_sport]
      .find((v) => v && typeof v === "string" && v.trim()) || "—";

  const getTimeDisplay = (b: any): string => {
    const start =
      [b.slot_start_time, b.slotStartTime, b.slotStart, b.startTime, b.slot_start]
        .find((v) => v && typeof v === "string" && v.trim()) || "—";
    const end =
      [b.slot_end_time, b.slotEndTime, b.slotEnd, b.endTime, b.slot_end]
        .find((v) => v && typeof v === "string" && v.trim()) || "";
    if (start === "—" && end === "") return "—";
    return end ? `${start} – ${end}` : start;
  };

  const displaySlot = (b: any): string => {
    const time = [b.displaySlots]
    return time ? time[0] : b.displaySlots;
  }

  const getTotal = (b: any) =>
    b.total_amount ?? b.totalAmount ?? b.total ?? b.amount ?? 0;

  const getRawStatus = (b: any): string => {
    const s = (
      b.payment_status || b.paymentStatus || b.status || b.bookingStatus || ""
    ).toLowerCase();
    if (s.includes("success") || s === "paid" || s === "confirmed") return "PAID";
    if (s.includes("partial")) return "PARTIAL";
    if (s.includes("cancel")) return "CANCELLED";
    if (s.includes("pending")) return "PENDING";
    return s.toUpperCase() || "UNKNOWN";
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <Badge bg="success" className="px-2 py-1">✓ PAID</Badge>;
      case "PARTIAL":
        return <Badge bg="info" className="px-2 py-1">PARTIAL</Badge>;
      case "CANCELLED":
        return <Badge bg="secondary" className="px-2 py-1">✕ CANCELLED</Badge>;
      case "PENDING":
        return <Badge bg="warning" text="dark" className="px-2 py-1">⚠ PENDING</Badge>;
      default:
        return <Badge bg="secondary" className="px-2 py-1">{status || "—"}</Badge>;
    }
  };

  // ── Filtered / sorted bookings ────────────────────────────────────────────

  const filteredBookings = useMemo(() => {
    let list = rawBookings;

    // Date range filter
    const from = fromDate ? toMidnight(new Date(fromDate)) : null;
    const to = toDate ? toMidnight(new Date(toDate)) : null;
    const effectiveTo = to || from;
    if (from || to) {
      list = list.filter((b) => {
        const bd = parseDate(getDate(b));
        if (!bd) return false;
        const d = toMidnight(bd);
        if (from && d < from) return false;
        if (effectiveTo && d > effectiveTo) return false;
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          getTurfName(b).toLowerCase().includes(q) ||
          getSport(b).toLowerCase().includes(q) ||
          String(b.id).toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return [...list].sort((a, b) => {
      const da = parseDate(getDate(a)) || new Date(0);
      const db = parseDate(getDate(b)) || new Date(0);
      return db.getTime() - da.getTime();
    });
  }, [rawBookings, fromDate, toDate, searchQuery]);

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredBookings.slice(start, start + rowsPerPage);
  }, [filteredBookings, currentPage]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCancel = async (booking: any) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setCancellingId(booking.id);
      await cancelBooking(booking.id);
      setRawBookings((prev) => prev.filter((b) => b.id !== booking.id));
      setToastMessage("Booking cancelled successfully");
      setToastVariant("success");
      setShowToast(true);
    } catch (err: any) {
      setToastMessage(err.message || "Failed to cancel booking");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const exportCSV = () => {
    const headers = ["Booking ID", "Turf", "Sport", "Court", "Date", "Time", "Amount", "Status"];
    const rows = filteredBookings.map((b) => [
      b.id,
      getTurfName(b),
      getSport(b),
      b.court || "court 1",
      formatDate(getDate(b)),
      // getTimeDisplay(b),
      displaySlot(b),
      getTotal(b),
      getRawStatus(b),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "user_bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ height: "70vh" }}
        >
          <Spinner
            animation="border"
            variant="success"
            style={{ width: "2.5rem", height: "2.5rem" }}
          />
          <p className="mt-3 text-muted">Loading user bookings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center m-4">{error}</div>;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid px-3 py-4 mt-5">

        {/* ── Page Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
          <div>
            <h2 className="fw-bold text-success mb-1">User Bookings</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
              All bookings made directly by users
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge bg-success bg-opacity-10 text-success border border-success fs-6 px-3 py-2"
              style={{ fontWeight: 600 }}
            >
              {filteredBookings.length} Bookings
            </span>
            <Button variant="success" size="sm" onClick={exportCSV}>
              ⬇ Download Report
            </Button>
          </div>
        </div>

        {/* ── Filter Card ── */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3 px-4">
            <p className="fw-semibold text-success mb-3" style={{ fontSize: "0.82rem" }}>
              🔽 FILTER BY DATE RANGE &amp; SEARCH
            </p>
            <div className="row g-3 align-items-end">
              {/* From Date */}
              <div className="col-md-3">
                <label className="form-label text-muted" style={{ fontSize: "0.82rem" }}>
                  From Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {/* To Date */}
              <div className="col-md-3">
                <label className="form-label text-muted" style={{ fontSize: "0.82rem" }}>
                  To Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {/* Search */}
              <div className="col-md-4">
                <label className="form-label text-muted" style={{ fontSize: "0.82rem" }}>
                  Search
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">🔍</span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by turf, sport or booking ID…"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchQuery("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {rawBookings.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50" />
            <h5>No bookings found</h5>
          </div>
        )}

        {/* ── No Results from Filter/Search ── */}
        {rawBookings.length > 0 && filteredBookings.length === 0 && (
          <div className="card border-0 shadow-sm text-center py-5 text-muted">
            <p className="fs-5 mb-1">No bookings match your filters</p>
            <p style={{ fontSize: "0.9rem" }}>Try adjusting the date range or search query.</p>
          </div>
        )}

        {/* ── Table Card ── */}
        {filteredBookings.length > 0 && (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                style={{ fontSize: "0.85rem" }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#d4edda",
                      borderBottom: "2px solid #c3e6cb",
                    }}
                  >
                    <th className="px-3 py-3">Booked On</th>
                    <th className="px-2 py-3">Booking ID</th>
                    <th className="px-2 py-3">Turf</th>
                    <th className="px-2 py-3">Sport</th>
                    <th className="px-2 py-3">Play Date</th>
                    <th className="px-2 py-3">Time Slot</th>
                    <th className="px-2 py-3">Amount</th>
                    <th className="px-2 py-3">Paid Amount</th>
                    <th className="px-2 py-3 text-center">Status</th>
                    <th className="px-2 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedBookings.map((booking) => {
                    const canCancel =
                      canCancelBooking(booking) &&
                      getRawStatus(booking) !== "CANCELLED";

                    return (
                      <tr key={booking.id}>
                        {/* Booked On */}
                        <td className="px-3">
                          {booking.createdAt
                            ? formatDate(
                                typeof booking.createdAt === "object"
                                  ? booking.createdAt.toDate?.().toISOString() ?? ""
                                  : booking.createdAt
                              )
                            : "—"}
                        </td>

                        {/* Booking ID */}
                        <td className="px-2" style={{ overflow: "hidden" }}>
                          <code
                            className="d-block bg-light rounded"
                            style={{
                              fontSize: "0.72rem",
                              color: "#444",
                              padding: "3px 6px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "200px",
                            }}
                            title={booking.id}
                          >
                            {booking.id || "—"}
                          </code>
                        </td>

                        {/* Turf */}
                        <td className="px-2 fw-semibold">{getTurfName(booking)}</td>

                        {/* Sport */}
                        <td className="px-2">
                          <Badge
                            bg="success"
                            className="px-2 py-1 text-capitalize"
                            style={{ fontSize: "0.78rem" }}
                          >
                            {getSport(booking)}
                          </Badge>
                        </td>

                        {/* Play Date */}
                        <td className="px-2">{formatDate(getDate(booking))}</td>

                        {/* Time Slot */}
                        <td className="px-2">{displaySlot(booking)}</td>

                        {/* Amount */}
                        <td className="px-2 fw-semibold">
                          ₹{getTotal(booking)}
                          {booking.unpaid_amount > 0 && (
                            <small className="text-danger d-block">
                              ₹{booking.unpaid_amount} pending
                            </small>
                          )}
                        </td>

                        {/* Paid Amount */}
                        <td className="px-2 fw-semibold">
                          ₹{booking.paidAmount || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-2 text-center">
                          {getStatusBadge(getRawStatus(booking))}
                        </td>

                        

                        {/* Actions */}
                        <td className="px-2 text-center" style={{ whiteSpace: "nowrap" }}>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-1"
                            style={{ fontSize: "0.74rem", padding: "3px 9px" }}
                            onClick={() => handleViewDetails(booking)}
                          >
                            View
                          </Button>
                          {canCancel ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              style={{ fontSize: "0.74rem", padding: "3px 9px" }}
                              onClick={() => handleCancel(booking)}
                              disabled={cancellingId === booking.id}
                            >
                              {cancellingId === booking.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" />
                                  Cancelling
                                </>
                              ) : (
                                "Cancel"
                              )}
                            </Button>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "0.74rem" }}>
                              Not allowed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="card-footer bg-white border-top d-flex align-items-center justify-content-between py-2 px-4">
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                Showing{" "}
                <strong>
                  {(currentPage - 1) * rowsPerPage + 1}–
                  {Math.min(currentPage * rowsPerPage, filteredBookings.length)}
                </strong>{" "}
                of <strong>{filteredBookings.length}</strong> booking
                {filteredBookings.length !== 1 ? "s" : ""}
              </span>

              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ‹ Previous
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  {currentPage} / {totalPages}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Details Modal ── */}
      {selectedBooking && (
        <Modal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setSelectedBooking(null);
          }}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="border-bottom">
            <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
              <span>📄</span> Booking Details
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="px-4 py-4">
            {/* Top Info Row */}
            <div className="row mb-3 g-3">
              <div className="col-md-4">
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  Turf
                </p>
                <p className="fw-bold text-success mb-0" style={{ fontSize: "1.05rem" }}>
                  {getTurfName(selectedBooking)}
                </p>
              </div>
              <div className="col-md-4 text-md-center">
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  Booking ID
                </p>
                <code
                  className="bg-light px-2 py-1 rounded"
                  style={{ fontSize: "0.78rem", color: "#444", wordBreak: "break-all" }}
                >
                  {selectedBooking.id}
                </code>
              </div>
              <div className="col-md-4 text-md-end">
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  Status
                </p>
                {getStatusBadge(getRawStatus(selectedBooking))}
              </div>
            </div>

            <hr className="my-3" />

            {/* Details Grid */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div className="bg-light rounded p-3 h-100">
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                  >
                    🏆 Sport
                  </p>
                  <p className="fw-semibold mb-0 text-capitalize">{getSport(selectedBooking)}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded p-3 h-100">
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                  >
                    ⬛ Court
                  </p>
                  <p className="fw-semibold mb-0">{selectedBooking.court || "court 1"}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded p-3 h-100">
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                  >
                    📅 Date
                  </p>
                  <p className="fw-semibold mb-0">{formatDate(getDate(selectedBooking))}</p>
                </div>
              </div>
            </div>

            {/* Slot row */}
            <div
              className="d-flex align-items-center justify-content-between rounded p-3 mb-3"
              style={{ background: "#f0faf5" }}
            >
              <div>
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  🕐 Time Slot
                </p>
                <Badge bg="success" className="px-3 py-2" style={{ fontSize: "0.88rem" }}>
                  {displaySlot(selectedBooking)}
                </Badge>
              </div>
              <div>
                <p
                  className="text-muted mb-1 text-end"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>User Name</p>
                    {selectedBooking.user_name || selectedBooking.userName || "—"}
              </div>
              <div>
                <p
                  className="text-muted mb-1 text-end"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>User Phone Number</p>
                    {selectedBooking.user_phone || selectedBooking.userPhone || "—"}
              </div>
              <div>
                <p
                  className="text-muted mb-1 text-end"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>User Email</p>
                    {selectedBooking.user_email || selectedBooking.userEmail || "—"}
              </div>
            </div>

            {/* Amount Summary */}
            <div className="row g-0 border rounded overflow-hidden">
              <div className="col-4 text-center p-3 border-end">
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  Total
                </p>
                <p className="fw-bold mb-0 fs-5">
                  ₹{Number(getTotal(selectedBooking)).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="col-4 text-center p-3 border-end">
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  Paid
                </p>
                <p className="fw-bold mb-0 fs-5 text-success">
                  ₹
                  {Number(
                    selectedBooking.paid_amount || selectedBooking.paidAmount || getTotal(selectedBooking)
                  ).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="col-4 text-center p-3">
                <p
                  className="text-muted mb-1"
                  style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}
                >
                  Balance
                </p>
                <p className="fw-bold mb-0 fs-5 text-danger">
                  ₹
                  {Number(
                    selectedBooking.unpaid_amount || selectedBooking.unpaidAmount || selectedBooking.balanceAmount || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-top bg-light">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setSelectedBooking(null);
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Toast Notification ── */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={5000}
        autohide
        bg={toastVariant}
        className="position-fixed bottom-0 end-0 m-3"
        style={{ zIndex: 9999 }}
      >
        <Toast.Body className="text-white fw-semibold">{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default UserBookings;