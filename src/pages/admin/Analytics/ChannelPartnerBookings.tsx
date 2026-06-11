// src/pages/admin/ChannelPartnerBookings.tsx
import React, { useEffect, useState, useMemo } from "react";
import { getChannelPartnerBookings, cancelBooking } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";
import { Modal, Button, Badge, Spinner, Toast } from "react-bootstrap";

const ChannelPartnerBookings: React.FC = () => {
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const rowsPerPage = 50;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const result = await getChannelPartnerBookings({ pageSize: rowsPerPage });
        setRawBookings(result.bookings);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to load channel bookings:", err);
        setToastMessage("Failed to load bookings");
        setToastVariant("danger");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || !lastDoc || loadingMore) return;

    try {
      setLoadingMore(true);
      const result = await getChannelPartnerBookings({
        pageSize: rowsPerPage,
        cursor: lastDoc,
      });
      setRawBookings((prev) => [...prev, ...result.bookings]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load more channel bookings:", err);
      setToastMessage("Failed to load more bookings");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const parseDate = (str: string): Date | null => {
    if (!str) return null;
    const match = str.match(/^(\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/i);
    if (!match) return null;
    const dateStr = `${match[2]} ${match[1]}, ${match[3]}`;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const toMidnight = (d: Date): Date => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  /**
   * Resolves the display time slot string from a booking object.
   * Handles all known field name variants stored in Firestore.
   */
  const getTimeSlot = (booking: any): string => {
    // 1. Prefer explicit start + end pair — check all known field name variants
    const start =
      booking.slot_start_time ||
      booking.slotStartTime ||
      booking.start_time ||
      booking.startTime ||
      "";

    const end =
      booking.slot_end_time ||
      booking.slotEndTime ||
      booking.end_time ||
      booking.endTime ||
      "";

    if (start && end) return `${start} – ${end}`;

    // 2. Pre-combined string fields
    if (booking.allSlotsString && booking.allSlotsString.trim()) return booking.allSlotsString.trim();
    if (booking.timeSlot && booking.timeSlot.trim()) return booking.timeSlot.trim();
    if (booking.slot && booking.slot.trim()) return booking.slot.trim();
    if (booking.time && booking.time.trim()) return booking.time.trim();

    // 3. Array of slots → join them
    if (Array.isArray(booking.slots) && booking.slots.length > 0) {
      return booking.slots.join(", ");
    }

    return "—";
  };

  const displayedBookings = useMemo(() => {
    let list = rawBookings;
    const from = fromDate ? toMidnight(new Date(fromDate)) : null;
    const to = toDate ? toMidnight(new Date(toDate)) : null;
    const effectiveTo = to || from;

    if (from || to) {
      list = list.filter((b) => {
        const bd = parseDate(b.date || b.selectedDate || "");
        if (!bd) return false;
        const dateMidnight = toMidnight(bd);
        if (from && dateMidnight < from) return false;
        if (effectiveTo && dateMidnight > effectiveTo) return false;
        return true;
      });
    }

    return [...list].sort((a, b) => {
      const dateA = parseDate(a.date || a.selectedDate || "") || new Date(0);
      const dateB = parseDate(b.date || b.selectedDate || "") || new Date(0);
      const diff = dateB.getTime() - dateA.getTime();
      if (diff !== 0) return diff;
      return (a.slot_start_time || a.slotStartTime || "").localeCompare(
        b.slot_start_time || b.slotStartTime || ""
      );
    });
  }, [rawBookings, fromDate, toDate]);

  const handleCancel = async (booking: any) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(booking.id);
      setRawBookings((prev) => prev.filter((b) => b.id !== booking.id));
      setToastMessage("Booking cancelled successfully");
      setToastVariant("success");
      setShowToast(true);
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.message || "Failed to cancel booking");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <Badge bg="success" className="px-2 py-1">✓ PAID</Badge>;
      case "UNPAID":
        return <Badge bg="warning" text="dark" className="px-2 py-1">⚠ UNPAID</Badge>;
      case "CANCELLED":
        return <Badge bg="secondary" className="px-2 py-1">✕ CANCELLED</Badge>;
      default:
        return <Badge bg="info" className="px-2 py-1">{status || "—"}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminNavbar />
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "70vh" }}>
          <Spinner animation="border" variant="success" style={{ width: "2.5rem", height: "2.5rem" }} />
          <p className="mt-3 text-muted">Loading channel partner bookings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminNavbar />

      {/* ── Main container: px-3 prevents horizontal overflow ── */}
      <div className="container-fluid px-3 py-4 mt-5">

        {/* ── Page Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
          <div>
            <h2 className="fw-bold text-success mb-1">Channel Partner Bookings</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
              All bookings made through channel partners
            </p>
          </div>
          <span
            className="badge bg-success bg-opacity-10 text-success border border-success fs-6 px-3 py-2"
            style={{ fontWeight: 600 }}
          >
            {displayedBookings.length} Bookings
          </span>
        </div>

        {/* ── Date Filter Card ── */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3 px-4">
            <p
              className="fw-semibold text-success mb-3"
              style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.6px" }}
            >
              🔽 Filter by Date Range
            </p>
            <div className="row g-3 align-items-end">
              <div className="col-md-4 col-sm-6">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                  From Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="col-md-4 col-sm-6">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.8rem" }}>
                  To Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="col-md-2 col-sm-4">
                <button
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={() => { setFromDate(""); setToDate(""); }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table or Empty State ── */}
        {displayedBookings.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div style={{ fontSize: "3rem" }}>📋</div>
              <h5 className="fw-semibold text-muted mt-3 mb-1">No bookings found</h5>
              <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
                Try adjusting the date range or check back later.
              </p>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm" style={{ overflow: "hidden" }}>
            <div className="card-body p-0">
              {/*
                overflow-x: auto on the wrapper + table-layout: fixed + width: 100%
                keeps the table inside the card without breaking the page layout.
              */}
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table
                  className="table table-hover table-bordered align-middle mb-0"
                  style={{ fontSize: "0.855rem", tableLayout: "fixed", width: "100%", minWidth: "1050px" }}
                >
                  <colgroup>
                    <col style={{ width: "90px" }} />   {/* Booked On */}
                    <col style={{ width: "130px" }} />  {/* Channel Partner */}
                    <col style={{ width: "120px" }} />  {/* Turf */}
                    <col style={{ width: "90px" }} />   {/* Sport */}
                    <col style={{ width: "70px" }} />   {/* Court */}
                    <col style={{ width: "90px" }} />   {/* Play Date */}
                    <col style={{ width: "130px" }} />  {/* Time Slot */}
                    <col style={{ width: "80px" }} />   {/* Amount */}
                    <col style={{ width: "90px" }} />   {/* Status */}
                    <col style={{ width: "165px" }} />  {/* Booking ID */}
                    <col style={{ width: "130px" }} />  {/* Actions */}
                  </colgroup>

                  <thead className="table-success">
                    <tr>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Booked On</th>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Channel Partner</th>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Turf</th>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Sport</th>
                      <th className="px-2 py-3 fw-semibold text-center" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Court</th>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Play Date</th>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Time Slot</th>
                      <th className="px-2 py-3 fw-semibold text-end" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Amount</th>
                      <th className="px-2 py-3 fw-semibold text-center" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Status</th>
                      <th className="px-2 py-3 fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Booking ID</th>
                      <th className="px-2 py-3 fw-semibold text-center" style={{ fontSize: "0.72rem", letterSpacing: "0.4px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedBookings.map((booking) => (
                      <tr key={booking.id}>

                        {/* Booked On */}
                        <td className="px-2 text-muted" style={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {booking.createdAt
                            ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Channel Partner */}
                        <td className="px-2" style={{ overflow: "hidden" }}>
                          <div className="fw-semibold text-truncate" style={{ fontSize: "0.85rem" }}>
                            {booking.bookingUsername || "—"}
                          </div>
                          {booking.bookingUserMobile && (
                            <div className="text-muted text-truncate" style={{ fontSize: "0.74rem" }}>
                              {booking.bookingUserMobile}
                            </div>
                          )}
                        </td>

                        {/* Turf */}
                        <td className="px-2" style={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {booking.turfName || "—"}
                        </td>

                        {/* Sport */}
                        <td className="px-2">
                          <Badge
                            pill
                            bg="success"
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              padding: "4px 8px",
                              textTransform: "capitalize",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {booking.bookedSportsName || booking.sport || "—"}
                          </Badge>
                        </td>

                        {/* Court */}
                        <td className="px-2 text-center text-muted" style={{ fontSize: "0.82rem" }}>
                          {booking.court || "—"}
                        </td>

                        {/* Play Date */}
                        <td className="px-2 text-muted" style={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {booking.date || booking.selectedDate || "—"}
                        </td>

                        {/* Time Slot — uses getTimeSlot() to handle ALL field name variants */}
                        <td className="px-2" style={{ fontSize: "0.8rem", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {getTimeSlot(booking)}
                        </td>

                        {/* Amount */}
                        <td className="px-2 text-end fw-semibold" style={{ fontSize: "0.82rem", fontVariantNumeric: "tabular-nums" as any }}>
                          ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="px-2 text-center">
                          {getStatusBadge(booking.paymentStatus)}
                        </td>

                        {/* Booking ID — no extra padding, full ID, ellipsis on overflow */}
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
                              maxWidth: "100%",
                              display: "block",
                            }}
                            title={booking.booking_id || booking.id || ""}
                          >
                            {booking.booking_id || booking.id || "—"}
                          </code>
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
                          {booking.paymentStatus !== "CANCELLED" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              style={{ fontSize: "0.74rem", padding: "3px 9px" }}
                              onClick={() => handleCancel(booking)}
                            >
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer */}
            <div className="card-footer bg-white border-top d-flex align-items-center justify-content-between py-2 px-4">
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                Showing <strong>{displayedBookings.length}</strong> booking
                {displayedBookings.length !== 1 ? "s" : ""}
              </span>
              <div className="d-flex align-items-center gap-2">
                {(fromDate || toDate) && (
                  <span className="badge bg-light text-muted border" style={{ fontSize: "0.76rem" }}>
                    Filtered view
                  </span>
                )}
                {hasMore && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Details Modal ── */}
      {selectedBooking && (
        <Modal
          show={showModal}
          onHide={() => { setShowModal(false); setSelectedBooking(null); }}
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
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Turf</p>
                <p className="fw-bold text-success mb-0" style={{ fontSize: "1.05rem" }}>{selectedBooking.turfName || "—"}</p>
              </div>
              <div className="col-md-4 text-md-center">
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Booking ID</p>
                <code className="bg-light px-2 py-1 rounded" style={{ fontSize: "0.78rem", color: "#444", wordBreak: "break-all" }}>
                  {selectedBooking.bookingId || selectedBooking.id}
                </code>
              </div>
              <div className="col-md-4 text-md-end">
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Channel Partner</p>
                <p className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>{selectedBooking.bookingUsername || "—"}</p>
                <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>{selectedBooking.bookingUserMobile || ""}</p>
              </div>
            </div>

            <hr className="my-3" />

            {/* Details Grid */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div className="bg-light rounded p-3 h-100">
                  <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>🏆 Sport</p>
                  <p className="fw-semibold mb-0 text-capitalize">{selectedBooking.bookedSportsName || "—"}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded p-3 h-100">
                  <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>⬛ Court</p>
                  <p className="fw-semibold mb-0">{selectedBooking.court || "—"}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded p-3 h-100">
                  <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>📅 Date</p>
                  <p className="fw-semibold mb-0">{selectedBooking.date || selectedBooking.selectedDate || "—"}</p>
                </div>
              </div>
            </div>

            {/* Slot + Status Row */}
            <div className="d-flex align-items-center justify-content-between rounded p-3 mb-3" style={{ background: "#f0faf5" }}>
              <div>
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>🕐 Time Slot</p>
                <Badge bg="success" className="px-3 py-2" style={{ fontSize: "0.88rem" }}>
                  {getTimeSlot(selectedBooking)}
                </Badge>
              </div>
              <div>{getStatusBadge(selectedBooking.paymentStatus)}</div>
            </div>

            {/* Amount Summary */}
            <div className="row g-0 border rounded overflow-hidden">
              <div className="col-4 text-center p-3 border-end">
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Total</p>
                <p className="fw-bold mb-0 fs-5">₹{Number(selectedBooking.totalAmount || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="col-4 text-center p-3 border-end">
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Paid</p>
                <p className="fw-bold mb-0 fs-5 text-success">₹{Number(selectedBooking.paidAmount || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="col-4 text-center p-3">
                <p className="text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Balance</p>
                <p className="fw-bold mb-0 fs-5 text-danger">₹{Number(selectedBooking.unpaidAmount || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>

          </Modal.Body>

          <Modal.Footer className="border-top bg-light">
            <Button variant="secondary" onClick={() => { setShowModal(false); setSelectedBooking(null); }}>
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

export default ChannelPartnerBookings;
