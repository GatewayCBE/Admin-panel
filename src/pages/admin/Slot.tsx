import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBookedSlots } from "../../services/firestoreService";
import "bootstrap/dist/css/bootstrap.min.css";

interface SlotData {
  id: string;
  amount: number;
  booked_sports_name: string;
  booking_id: string;
  booking_username: string;
  date: string;
  owner_id: string;
  paid_by: string;
  payment_initiated_time: string;
  payment_status: string;
  payment_transaction_id: string;
  slot_start_time: string;
  turf_id: string;
  turf_name: string;
  user_id: string;
  turf_closed: boolean | null;
}

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getTodayInputFormat = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const Slot: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [inputDate, setInputDate] = useState(getTodayInputFormat());
  const [selectedDate, setSelectedDate] = useState(formatDate(getTodayInputFormat()));
  const [slots, setSlots] = useState<SlotData[]>([]);

  useEffect(() => {
    if (turfId && selectedDate) {
      getBookedSlots(turfId, selectedDate).then(setSlots);
    }
  }, [turfId, selectedDate]);

  return (
    <div className="container my-4">
      <h2 className="text-center text-success mb-4">Booked Slots for Turf: {turfId}</h2>

      {/* Date Picker */}
      <div className="d-flex justify-content-center mb-4">
        <input
          type="date"
          className="form-control w-auto border-success"
          value={inputDate}
          onChange={(e) => {
            setInputDate(e.target.value);
            setSelectedDate(formatDate(e.target.value));
          }}
        />
      </div>

      {slots.length > 0 ? (
        <div className="row g-4">
          {slots.map((slot) => (
            <div key={slot.id} className="col-md-4 col-sm-6">
              <div
                className="card text-center shadow-sm border-0 h-100"
                style={{ backgroundColor: "#02613a", color: "#5ad79f" }}
              >
                <div className="card-body">
                  <h5 className="card-title">{slot.slot_start_time}</h5>
                  <p><strong>Sport:</strong> {slot.booked_sports_name}</p>
                  <p><strong>User:</strong> {slot.booking_username}</p>
                  <p><strong>Amount:</strong> ₹{slot.amount}</p>
                  <p><strong>Status:</strong> {slot.payment_status}</p>
                  <p><strong>Date:</strong> {slot.date}</p>
                  <p><strong>Turf:</strong> {slot.turf_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No slots booked yet for {selectedDate}</p>
      )}
    </div>
  );
};

export default Slot;
