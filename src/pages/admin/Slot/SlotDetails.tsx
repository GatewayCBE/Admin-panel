import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

interface SlotData {
  id: string;
  slot_start_time: string;
  booking_username?: string;
  payment_status?: string;
  booked_sports_name?: string;
  court?: string;
  sport?: string;
  date?: string;
  paid_amount?: number;
  owner_id?: string;
}

const SlotDetails: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [slots, setSlots] = useState<SlotData[]>([]);
  console.log('slots',slots);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!turfId) return;

      try {
        const slotsArr: SlotData[] = [];

        const turfPath = `environment/testing/all_turfs_slot_booking/${turfId}`;

        const dateSnap = await getDocs(collection(db, turfPath));

        for (const dateDoc of dateSnap.docs) {
          const sportsSnap = await getDocs(collection(db, turfPath, dateDoc.id));
          console.log('sportsSnap',sportsSnap);
          

          for (const sportDoc of sportsSnap.docs) {
            const courtsSnap = await getDocs(
              collection(db, turfPath, dateDoc.id, sportDoc.id)
              
            );
            
          console.log('courtsSnap',courtsSnap);

            for (const courtDoc of courtsSnap.docs) {
              const slotsSnap = await getDocs(
                collection(db, turfPath, dateDoc.id, sportDoc.id, courtDoc.id)
              );
          console.log('slotsSnap',slotsSnap);

              slotsSnap.forEach((s) => {
                slotsArr.push({
                  id: s.id,
                  ...s.data(),
                  court: courtDoc.id,
                  sport: sportDoc.id,
                  date: dateDoc.id,
                } as SlotData);
              });
            }
          }
        }

        setSlots(slotsArr);
      } catch (error) {
        console.error("Error fetching slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [turfId]);

  if (loading) return <p className="text-center">Loading slots...</p>;

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary fw-bold mb-4">
        Slots for Turf ID: {turfId}
      </h2>

      {slots.length === 0 ? (
        <p className="text-center text-muted">No slots available.</p>
      ) : (
        <ul className="list-group">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2"
            >
              <div>
                <strong>{slot.slot_start_time}</strong> ({slot.sport} -{" "}
                {slot.court}) on <em>{slot.date}</em>
                <p className="mb-0 text-muted">
                  {slot.booking_username || "Not booked"}
                </p>
              </div>
              <span
                className={`badge ${
                  slot.payment_status === "paid"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {slot.payment_status || "pending"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SlotDetails;
