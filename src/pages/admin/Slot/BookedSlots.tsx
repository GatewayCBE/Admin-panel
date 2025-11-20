import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllDatesAndSlots } from "../../../services/firestoreService";
import dayjs from "dayjs";

const BookedSlots = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slotData, setSlotData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!turfId) return;
    (async () => {
      setLoading(true);
      const data = await getAllDatesAndSlots(turfId);
      const dates = data.map((item: any) => item.date);
      setAvailableDates(dates);
      if (dates.length > 0) setSelectedDate(dates[0]);
      setLoading(false);
    })();
  }, [turfId]);

  useEffect(() => {
    if (!selectedDate || !turfId) return;
    (async () => {
      const data = await getAllDatesAndSlots(turfId);
      const filter = data.find((d: any) => d.date === selectedDate);
      setSlotData(filter || null);
    })();
  }, [selectedDate, turfId]);

  return (
    <div style={{ fontFamily: "Poppins", padding: "20px" }}>
      <h3 className="fw-bold text-success">📌 Booked Slots</h3>

      {/* Select Date */}
      <select
        className="form-select w-25 mt-3"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      >
        {availableDates.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {slotData ? (
        slotData.sports.map((sportItem: any) => (
          <div key={sportItem.sport} className="mt-4 card p-3">
            <h5 className="fw-bold">🎾 {sportItem.sport}</h5>

            {sportItem.courts.map((courtItem: any) => (
              <div key={courtItem.court}>
                <p>🏟 Court: {courtItem.court}</p>

                {courtItem.slots.map((slot: any, idx: number) => (
                  <div key={idx} className="ms-4">
                    <p>⏰ Time: {slot.time}</p>
                    <p>👤 Booked By: {slot.booking_username || "-"}</p>
                    <p>💵 Amount: ₹{slot.total_amount || "-"}</p>
                    <hr />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="text-danger mt-4">❌ No data available</p>
      )}
    </div>
  );
};

export default BookedSlots;
