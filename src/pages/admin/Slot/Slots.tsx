import { useEffect, useState } from "react";
// @ts-ignore
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Needed for modal
import { getSlotsByPaymentStatus } from "../../../services/firestoreService";
import { useParams } from "react-router-dom";

interface SlotData {
  booking_id: string;
  booking_username: string;
  turf_name: string;
  booked_sports_name: string;
  court: string;
  date: string;
  owner_id: string;
  slot_start_time: string;
  payment_status: string;
  paid_amount?: number;
  paid_by?: string;
  unpaid_amount?: number;
  total_amount?: number;
  payment_initiated_time?: string;
  payment_transaction_id?: string;
  turf_closed?: boolean;
  turf_id?: string;
  user_id?: string;
}

const Slots = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // 👈 new state

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      const data = await getSlotsByPaymentStatus("paymentSuccess", turfId);
      setSlots(data);
      setLoading(false);
    };

    fetchSlots();
  }, [turfId]);

  // Filter slots based on search query
  const filteredSlots = slots.filter((slot) => {
    const query = searchQuery.toLowerCase();
    return (
      (slot.turf_name || "").toLowerCase().includes(query) ||
      (slot.booked_sports_name || "").toLowerCase().includes(query) ||
      (slot.date || "").toLowerCase().includes(query) ||
      (slot.booking_username || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="container py-4">
      <h3 className="fw-bold text-success text-center mb-4">Slot Management</h3>

      {/* 🔍 Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by Turf Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading slots...</p>
      ) : filteredSlots.length === 0 ? (
        <p className="text-center text-muted">No slots found.</p>
      ) : (
        <ul className="list-group">
          {filteredSlots.map((slot) => (
            <div
              key={slot.booking_id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap rounded-3 mb-3 border-0 shadow-sm"
              style={{
                backgroundColor: "#02613a",
                color: "#5ad79f",
              }}
            >
              <div>
                <p className="mb-1">
                  <strong>Turf:</strong> {slot.turf_name}
                </p>
                <p className="mb-1">
                  <strong>Sport:</strong> {slot.booked_sports_name}
                </p>
                <p className="mb-1">
                  <strong>Date:</strong> {slot.date}
                </p>
              </div>
              <button
                className="btn btn-outline-light"
                onClick={() => setSelectedSlot(slot)}
                data-bs-toggle="modal"
                data-bs-target="#slotDetailsModal"
              >
                View Details →
              </button>
            </div>
          ))}
        </ul>
      )}

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="slotDetailsModal"
        tabIndex={-1}
        aria-labelledby="slotDetailsLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title" id="slotDetailsLabel">
                Slot Details
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedSlot ? (
                <table className="table table-bordered">
                  <tbody>
                    {Object.entries(selectedSlot).map(([key, value]) => (
                      <tr key={key}>
                        <th style={{ width: "30%" }}>{key}</th>
                        <td>{value !== null ? value.toString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No details available.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slots;
