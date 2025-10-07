import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

interface SlotData {
  id: string;
  slot_start_time?: string;
  booking_username?: string;
  payment_status?: string;
  booked_sports_name?: string;
  booking_id?: string;
  court?: string;
  sport?: string;
  date?: string;
  paid_amount?: number;
  total_amount?: number;
  turf_name?: string;
  owner_id?: string;
  [key: string]: any;
}

const SlotDetails: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!turfId) {
        setError("Turf ID is missing");
        setLoading(false);
        return;
      }

      try {
        const slotsArr: SlotData[] = [];
        const today = new Date();
        const dateRange: string[] = [];

        for (let i = -60; i <= 60; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const day = String(date.getDate()).padStart(2, "0");
          const month = date.toLocaleString("en-US", { month: "short" });
          const year = date.getFullYear();
          dateRange.push(`${day}-${month}-${year}`);
        }

        const sportsToCheck = ["volleyball", "cricket", "football", "badminton", "tennis", "basketball"];
        const courtPatterns = ["court 1", "court 2", "court 3", "court 4", "court 5"];

        for (const dateId of dateRange) {
          for (const sportId of sportsToCheck) {
            const promises = courtPatterns.map(async (courtName) => {
              const slotPath = `environment/testing/all_turfs_slot_booking/${turfId}/${dateId}/${sportId}/${courtName}`;
              const slotsRef = collection(db, slotPath);
              const snapshot = await getDocs(slotsRef);
              snapshot.forEach((doc) => {
                slotsArr.push({
                  id: doc.id,
                  ...doc.data(),
                  date: dateId,
                  sport: sportId,
                  court: courtName,
                } as SlotData);
              });
            });
            await Promise.all(promises);
          }
        }

        setSlots(slotsArr);
        console.log('slotsArr', slotsArr);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [turfId]);

  if (loading) {
    return (
      <div className="container py-4">
        <h2 className="text-center text-success fw-bold mb-4">Loading Slots...</h2>
        <div className="row">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm h-100 p-3">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 mb-2"></span>
                  <span className="placeholder col-7 mb-2"></span>
                  <span className="placeholder col-4 mb-2"></span>
                  <span className="placeholder col-8 mb-2"></span>
                  <span className="placeholder col-5"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning text-center">No slots found.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center text-success fw-bold mb-4">Slots for Turf</h2>
      <div className="row">
        {slots.map((slot, idx) => (
          <div key={idx} className="col-md-6 col-lg-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-success text-white">
                <strong>⏰ {slot.slot_start_time}</strong>
              </div>
              <div className="card-body">
                <div className="mb-1"><strong>Date:</strong> {slot.date}</div>
                <div className="mb-1"><strong>Sport:</strong> {slot.sport}</div>
                <div className="mb-1"><strong>Court:</strong> {slot.court}</div>
                {slot.booking_username && (
                  <>
                    <hr />
                    <div className="mb-1"><strong>Booked by:</strong> {slot.booking_username}</div>
                    <div className="mb-1"><strong>Sport Name:</strong> {slot.booked_sports_name}</div>
                    <div className="mb-1"><strong>Turf Name:</strong> {slot.turf_name}</div>
                    <div className="mb-1"><strong>Paid Amount:</strong> ₹{slot.paid_amount}</div>
                    <div className="mb-1"><strong>Total Amount:</strong> ₹{slot.total_amount}</div>
                  </>
                )}
              </div>
              <div className="card-footer">
                <span className={`badge ${slot.booking_username ? "bg-success" : "bg-secondary"}`}>
                  {slot.booking_username ? "✓ Booked" : "○ Available"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotDetails;
