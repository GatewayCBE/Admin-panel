import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBookedSlots } from "../../services/firestoreService";
import "../Style/Slot.css";

interface SlotData {
  id: string; // slot time
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

// Format date to "dd-MMM-yyyy" (Firestore format)
const formatDate = (date: string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Get today's date in yyyy-mm-dd format for input[type="date"]
const getTodayInputFormat = () => {
  const d = new Date();
  return d.toISOString().split("T")[0]; // yyyy-mm-dd
};

const Slot: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();

  const [inputDate, setInputDate] = useState(getTodayInputFormat()); // yyyy-mm-dd
  const [selectedDate, setSelectedDate] = useState(formatDate(getTodayInputFormat())); // dd-MMM-yyyy
  const [slots, setSlots] = useState<SlotData[]>([]);

  useEffect(() => {
    if (turfId && selectedDate) {
      getBookedSlots(turfId, selectedDate).then(setSlots);
    }
  }, [turfId, selectedDate]);

  return (
    <div className="slot-page">
      <h2 className="slot-title">Booked Slots for Turf: {turfId}</h2>

      {/* Calendar Date Picker */}
      <input
        type="date"
        className="slot-date-picker"
        value={inputDate}
        onChange={(e) => {
          setInputDate(e.target.value);
          setSelectedDate(formatDate(e.target.value));
        }}
      />

      {slots.length > 0 ? (
        <div className="slot-grid">
          {slots.map((slot) => (
            <div key={slot.id} className="slot-card">
              <h3>{slot.slot_start_time}</h3>
              <p><strong>Sport:</strong> {slot.booked_sports_name}</p>
              <p><strong>User:</strong> {slot.booking_username}</p>
              <p><strong>Amount:</strong> ₹{slot.amount}</p>
              <p><strong>Status:</strong> {slot.payment_status}</p>
              <p><strong>Date:</strong> {slot.date}</p>
              <p><strong>Turf:</strong> {slot.turf_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No slots booked yet for {selectedDate}</p>
      )}
    </div>
  );
};

export default Slot;
