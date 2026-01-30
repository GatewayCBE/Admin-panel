// src/pages/admin/TurfBookingsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getChannelPartnerBookings, cancelBooking } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";
import { Modal, Button, Table, Badge, Spinner, Toast } from "react-bootstrap"; // Add Bootstrap or use your UI lib

const TurfBookingsPage: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const channelBookings = await getChannelPartnerBookings();
        const filtered = turfId 
          ? channelBookings.filter((b) => b.turfId === turfId || b.turf_id === turfId)
          : channelBookings;
        setRawBookings(filtered);
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
  }, [turfId]);

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
      return (a.slot_start_time || "").localeCompare(b.slot_start_time || "");
    });
  }, [rawBookings, fromDate, toDate]);

  const isPaid = (status?: string) => status?.toLowerCase().includes("success") || status === "PAID";

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking(bookingId, "Cancelled by admin", "admin");

      // Refresh list
      setRawBookings(prev => prev.filter(b => b.id !== bookingId));

      setToastMessage("Booking cancelled successfully");
      setToastVariant("success");
      setShowToast(true);
    } catch (err: any) {
      setToastMessage("Failed to cancel: " + err.message);
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading channel partner bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <AdminNavbar />
      <h2 className="fw-bold mb-2">Channel Partner Bookings {turfId ? `- ${turfId}` : ""}</h2>
      <p className="text-muted mb-4">
        Total shown: <strong>{displayedBookings.length}</strong>
      </p>

      {/* Date filters */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-light">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-semibold">From Date</label>
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="col-md-5">
            <label className="form-label fw-semibold">To Date</label>
            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setFromDate(""); setToDate(""); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No channel partner bookings found</h5>
        </div>
      ) : (
        <Table responsive hover className="table-bordered">
          <thead className="table-success">
            <tr>
              <th>Booked On</th>
              <th>Channel Partner</th>
              <th>Sport</th>
              <th>Court</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th>ID (last 8)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.date || booking.selectedDate || "—"}</td>
                <td>{booking.booking_username || "—"}</td>
                <td>{booking.booked_sports_name || booking.sport || "—"}</td>
                <td>{booking.court || "—"}</td>
                <td>{booking.date || booking.selectedDate || "—"}</td>
                <td>{booking.slot_start_time || (Array.isArray(booking.allSlots) ? booking.allSlots.join(", ") : "—")}</td>
                <td>₹{Number(booking.paid_amount || booking.paidAmount || 0).toLocaleString("en-IN")}</td>
                <td>
                  <Badge bg={isPaid(booking.payment_status || booking.paymentStatus) ? "success" : "warning"}>
                    {isPaid(booking.payment_status || booking.paymentStatus) ? "Paid" : "Pending"}
                  </Badge>
                </td>
                <td>{booking.booking_id?.slice(-8) || booking.id?.slice(-8)}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleViewDetails(booking)}>
                    View
                  </Button>
                  {booking.payment_status !== "CANCELLED" && (
                    <Button variant="outline-danger" size="sm" onClick={() => handleCancel(booking.id)}>
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details - {selectedBooking?.id?.slice(-8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking ? (
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
              {JSON.stringify(selectedBooking, null, 2)}
            </pre>
          ) : (
            <p>No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={5000}
        autohide
        bg={toastVariant}
        className="position-fixed bottom-0 end-0 m-3"
      >
        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default TurfBookingsPage;