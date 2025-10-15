import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSlotsByPaymentStatus } from "../../../services/firestoreService";
import { Modal, Button } from "react-bootstrap";

interface SlotData {
  booking_id: string;
  booking_username: string;
  turf_name: string;
  booked_sports_name: string;
  court: string;
  date: string;
  slot_start_time: string;
  payment_status: string;
  paid_amount?: number;
  unpaid_amount?: number;
}

const SlotDetails: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const todayISO = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchSlots = async () => {
      if (!turfId) return;
      setLoading(true);
      const data = await getSlotsByPaymentStatus("paymentSuccess", turfId);
      setSlots(data || []);
      setLoading(false);
    };

    fetchSlots();
  }, [turfId]);

  const formatDateToFirestore = (dateStr?: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayWithZero = day.padStart(2, "0");
    return `${dayWithZero}-${monthNames[parseInt(month) - 1]}-${year}`;
  };

  const selectedDateFirestore = formatDateToFirestore(selectedDate);

  const filteredSlots = selectedDateFirestore
    ? slots.filter((s) => s.date === selectedDateFirestore)
    : slots;

  const totalPaidAll = filteredSlots.reduce(
    (sum, s) => sum + (s.paid_amount || 0),
    0
  );
  const uniqueUsers = Array.from(
    new Set(filteredSlots.map((s) => s.booking_username))
  );

  // 🧮 Group users with totals
  const userStats = uniqueUsers.map((user) => {
    const userSlots = filteredSlots.filter((s) => s.booking_username === user);
    const totalBookings = userSlots.length;
    const totalPaid = userSlots.reduce(
      (sum, s) => sum + (s.paid_amount || 0),
      0
    );
    const totalUnpaid = userSlots.reduce(
      (sum, s) => sum + (s.unpaid_amount || 0),
      0
    );
    return { user, totalBookings, totalPaid, totalUnpaid };
  });

  // 🧩 Group by date > court > sport
  const slotsByDate: Record<
    string,
    Record<string, Record<string, SlotData[]>>
  > = {};
  filteredSlots.forEach((slot) => {
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = {};
    if (!slotsByDate[slot.date][slot.court])
      slotsByDate[slot.date][slot.court] = {};
    if (!slotsByDate[slot.date][slot.court][slot.booked_sports_name]) {
      slotsByDate[slot.date][slot.court][slot.booked_sports_name] = [];
    }
    slotsByDate[slot.date][slot.court][slot.booked_sports_name].push(slot);
  });

  const displayedDates = selectedDateFirestore
    ? [selectedDateFirestore]
    : Object.keys(slotsByDate);

  const toggleDate = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold text-primary mb-4">
        Turf Slot Dashboard
      </h2>

      {/* ✅ Date Picker + Summary */}
      <div className="d-flex flex-column align-items-center mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <input
            type="date"
            className="form-control"
            style={{ width: "250px" }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || "")}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setSelectedDate("")}
          >
            Clear
          </button>
        </div>
        <span className="badge bg-info text-dark">
          Today: {formatDateToFirestore(todayISO)}
        </span>
      </div>

      {/* 🧾 Summary Cards */}
      <div className="row text-center mb-4 justify-content-center">
        {/* Total Slots */}
        <div className="col-md-3 mb-3">
          <div
            className="card border-primary shadow-sm summary-card"
            style={{ cursor: "default", transition: "all 0.25s ease-in-out" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.backgroundColor = "#caf0f8";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Slots</h6>
              <h4 className="mb-0">{filteredSlots.length}</h4>
            </div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="col-md-3 mb-3">
          <div
            className="card border-success shadow-sm summary-card"
            style={{ cursor: "default", transition: "all 0.25s ease-in-out" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.backgroundColor = "#b7efc5";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Paid</h6>
              <h4 className="mb-0">₹{totalPaidAll}</h4>
            </div>
          </div>
        </div>

        {/* 🧍 Unique Users Card - Clickable */}
        <div className="col-md-3 mb-3">
          <div
            className="card border-warning shadow-sm summary-card"
            onClick={() => setShowUserModal(true)}
            style={{
              cursor: "pointer",
              transition: "all 0.25s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "#ffcb69";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body d-flex justify-content-between align-items-center px-4">
              <div style={{ marginLeft: "45px" }}>
                <h6 className="text-muted mb-1">Unique Users</h6>
                <h4 className="mb-0">{uniqueUsers.length}</h4>
              </div>
              <i
                className="bi bi-play-circle-fill text-black"
                style={{
                  fontSize: "24px",
                  transition: "transform 0.2s ease-in-out",
                }}
              ></i>
            </div>
          </div>
        </div>
      </div>

      {/* 🧍 User Details Modal */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Users Booking Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userStats.length === 0 ? (
            <p className="text-center text-muted">
              No users found for this date.
            </p>
          ) : (
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-success">
                <tr>
                  <th>User</th>
                  <th>Total Bookings</th>
                  <th>Total Paid</th>
                  <th>Total Unpaid</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((u) => (
                  <tr key={u.user}>
                    <td className="fw-bold">{u.user}</td>
                    <td>{u.totalBookings}</td>
                    <td className="text-success fw-bold">₹{u.totalPaid}</td>
                    <td className="text-danger fw-bold">₹{u.totalUnpaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Accordion section */}
      {loading ? (
        <p>Loading slots...</p>
      ) : displayedDates.length === 0 ? (
        <p className="text-center text-muted">
          {selectedDateFirestore
            ? `No slots booked for ${selectedDateFirestore}`
            : "No slots booked for this turf."}
        </p>
      ) : (
        <div className="accordion" id="slotAccordion">
          {displayedDates.map((date) => {
            const courts = slotsByDate[date] || {};
            const totalPaidForDate = Object.values(courts)
              .flatMap((courtObj) => Object.values(courtObj || {}).flat())
              .reduce((sum, s) => sum + (s.paid_amount || 0), 0);

            return (
              <div className="accordion-item mb-2 shadow-sm" key={date}>
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${
                      expandedDate === date ? "" : "collapsed"
                    }`}
                    type="button"
                    onClick={() => toggleDate(date)}
                  >
                    <strong>{date}</strong> — Total Paid: ₹{totalPaidForDate}
                  </button>
                </h2>
                <div
                  className={`accordion-collapse collapse ${
                    expandedDate === date ? "show" : ""
                  }`}
                >
                  <div className="accordion-body">
                    {Object.keys(courts).map((court) => {
                      const sports = courts[court] || {};
                      const totalPaidForCourt = Object.values(sports)
                        .flat()
                        .reduce((sum, s) => sum + (s.paid_amount || 0), 0);

                      return (
                        <div key={court} className="mb-4">
                          <h5 className="text-primary mb-3">
                            🏟️ {court} — ₹{totalPaidForCourt}
                          </h5>
                          {Object.keys(sports).map((sport) => {
                            const sportSlots = sports[sport] || [];
                            return (
                              <div key={sport} className="mb-3">
                                <h6 className="fw-bold text-success">
                                  ⚽ {sport}
                                </h6>
                                <table className="table table-hover table-striped align-middle">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Booking ID</th>
                                      <th>User</th>
                                      <th>Time</th>
                                      <th>Paid</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sportSlots.map((slot) => (
                                      <tr key={slot.booking_id}>
                                        <td>{slot.booking_id}</td>
                                        <td>{slot.booking_username}</td>
                                        <td>
                                          <span className="badge bg-secondary">
                                            {slot.slot_start_time}
                                          </span>
                                        </td>
                                        <td>
                                          <span className="badge bg-success">
                                            ₹{slot.paid_amount || 0}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlotDetails;
