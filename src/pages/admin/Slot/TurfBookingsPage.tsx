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
          ? channelBookings.filter(
  (b) => b.turfId === turfId
)
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

  const handleCancel = async (booking: any) => {
  if (!window.confirm("Are you sure you want to cancel this booking?")) return;

  try {
    await cancelBooking(booking.id);

    // Remove row OR mark cancelled
    setRawBookings(prev => prev.filter(b => b.id !== booking.id));

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
      <h2 className="fw-bold mt-5 py-5 text-success text-center">Channel Partner Bookings</h2>
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
                <td>
  {booking.createdAt
    ? new Date(
        booking.createdAt.seconds * 1000
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"}
</td>
                <td>{booking.bookingUsername || "—"}</td>
                <td>{booking.bookedSportsName || booking.sport || "—"}</td>
                <td>{booking.court || "—"}</td>
                <td>{booking.date || booking.selectedDate || "—"}</td>
                <td>
  {booking.slot_start_time && booking.slot_end_time
    ? `${booking.slot_start_time} - ${booking.slot_end_time}`
    : booking.allSlotsString || "—"}
</td>
                <td>₹{Number(booking.totalAmount || 0)}</td>
                <td>
                  <Badge bg={
  booking.paymentStatus === "PAID" ? "success" :
  booking.paymentStatus === "UNPAID" ? "warning" :
  booking.paymentStatus === "CANCELLED" ? "secondary" :
  "info"
}>
  {booking.paymentStatus}
</Badge>
                </td>
                <td>{booking.booking_id?.slice(-8) || booking.id?.slice(-8)}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleViewDetails(booking)}>
                    View
                  </Button>
                  {booking.payment_status !== "CANCELLED" && (
                    <Button
  variant="outline-danger"
  size="sm"
  onClick={() => handleCancel(booking)}
>
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
    <Modal.Header closeButton>
     <Modal.Title className="fs-5 fw-bold">
        Booking Details
      </Modal.Title>
    </Modal.Header>

    <Modal.Body className="px-4 py-3">

  {/* Top info row */}
  <div className="row mb-3 align-items-center">
    <div className="col-md-4">
      <div className="text-muted small">
        <i className="bi bi-geo-alt me-1" />
        Turf
      </div>
      <div className="fw-bold fs-5">{selectedBooking.turfName}</div>
    </div>

    <div className="col-md-4 text-center">
      <div className="text-muted small">
        <i className="bi bi-receipt me-1" />
        Booking ID
      </div>
      <div className="fw-semibold">{selectedBooking.bookingId}</div>
    </div>

    <div className="col-md-4 text-md-end">
      <div className="text-muted small">
        <i className="bi bi-person-circle me-1" />
        User
      </div>
      <div className="fw-bold">{selectedBooking.bookingUsername}</div>
      <div className="text-muted">{selectedBooking.bookingUserMobile}</div>
    </div>
  </div>

  <hr />

  {/* Booking details */}
  <div className="row gy-3 mb-3">
    <div className="col-md-4">
      <div className="text-muted small">
        <i className="bi bi-trophy me-1" />
        Sport
      </div>
      <div className="fw-semibold text-capitalize">
        {selectedBooking.bookedSportsName}
      </div>
    </div>

    <div className="col-md-4">
      <div className="text-muted small">
        <i className="bi bi-grid me-1" />
        Court
      </div>
      <div className="fw-semibold">{selectedBooking.court}</div>
    </div>

    <div className="col-md-4">
      <div className="text-muted small">
        <i className="bi bi-calendar-event me-1" />
        Date
      </div>
      <div className="fw-semibold">{selectedBooking.date}</div>
    </div>
  </div>

{/* Slot */}
<div className="mb-4">
  <div className="text-muted small mb-2">
    <i className="bi bi-clock me-1" />
    Slot
  </div>

  <div className="d-flex align-items-center">
    {/* Left: Slot time */}
    <Badge bg="success" className="px-3 py-2 fs-6">
      {selectedBooking.allSlotsString}
    </Badge>

    {/* Push status to the right */}
    <div className="ms-auto">
      <Badge
        bg={
          selectedBooking.paymentStatus === "PAID"
            ? "success"
            : selectedBooking.paymentStatus === "UNPAID"
            ? "warning"
            : "secondary"
        }
        className="px-4 py-2 fs-6 text-uppercase text-danger"
      >
        <i
          className={`bi ${
            selectedBooking.paymentStatus === "PAID"
              ? "bi-check-circle"
              : selectedBooking.paymentStatus === "UNPAID"
              ? "bi-exclamation-circle"
              : "bi-x-circle"
          } me-1`}
        />
        {selectedBooking.paymentStatus}
      </Badge>
    </div>
  </div>
</div>

  {/* Amount summary */}
  <div className="row text-center bg-light rounded py-3">
    <div className="col">
      <div className="text-muted small">
        <i className="bi bi-currency-rupee me-1" />
        Total
      </div>
      <div className="fw-bold fs-5">₹{selectedBooking.totalAmount}</div>
    </div>

    <div className="col">
      <div className="text-muted small">
        <i className="bi bi-check-circle me-1 text-success" />
        Paid
      </div>
      <div className="fw-bold fs-5 text-success">
        ₹{selectedBooking.paidAmount}
      </div>
    </div>

    <div className="col">
      <div className="text-muted small">
        <i className="bi bi-exclamation-circle me-1 text-danger" />
        Balance
      </div>
      <div className="fw-bold fs-5 text-danger">
  ₹{selectedBooking.unpaidAmount}
</div>
    </div>
  </div>

</Modal.Body>

    <Modal.Footer>
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