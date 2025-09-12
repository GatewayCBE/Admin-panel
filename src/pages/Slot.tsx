import React, { useEffect, useState } from "react";
import { getBookedSlots } from "../services/firestoreService";
import "./Style/Dashboard.css";

interface Slot {
  booking_id: string;
  booked_sports_name: string;
  slot_start_time: string;
  date: string;
  turf_name: string;
  amount: number;
}

const Slots: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const slotData = await getBookedSlots();
      setSlots(slotData);
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      {/* Left panel - Booked Slots */}
      <div className="panel">
        <h2>Booked Slots</h2>
        {slots.length === 0 ? (
          <p>No slots booked yet.</p>
        ) : (
          <ul>
            {slots.map((slot) => (
              <li key={slot.booking_id}>
                <strong>{slot.turf_name}</strong> - {slot.booked_sports_name} <br />
                <span>
                  {slot.date} at {slot.slot_start_time}
                </span>{" "}
                <br />
                Amount: ₹{slot.amount}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Slots;
