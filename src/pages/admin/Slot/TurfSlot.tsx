import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../firebase"; // adjust path
import { collection, getDocs, doc } from "firebase/firestore";

const TurfSlot: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setSelectedDate(formatted);
  }, []);

  // Format date for Firestore (dd-MMM-yyyy)
  const formatDateForFirestore = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`; // e.g., "18-Sep-2025"
  };

  // Fetch sports whenever date or turfId changes
  useEffect(() => {
    const fetchSports = async () => {
      if (!turfId || !selectedDate) return;
      setLoading(true);
      try {
        const firestoreDate = formatDateForFirestore(selectedDate);
        console.log("Turf ID:", turfId);
        console.log("Querying Firestore Date:", firestoreDate);
        const dateRef = doc(
          db,
          "environment",
          "testing",
          "all_turfs_slot_booking",
          turfId
        );
        
        const sportsRef = collection(dateRef, firestoreDate);
        const snapshot = await getDocs(sportsRef);
        console.log("Sports snapshot size:", snapshot.size);
        snapshot.forEach((doc) => {
          console.log("Sport doc ID:", doc.id, "data:", doc.data());
        });
        const sportList = snapshot.docs.map((doc) => doc.id);
        setSports(sportList);
      } catch (err) {
        console.error("Error fetching sports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, [turfId, selectedDate]);

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success text-center mb-4">
        Slots for Turf: {turfId}
      </h2>
      {/* Date Picker */}
      <div className="mb-4 text-center">
        <label htmlFor="slotDate" className="fw-bold me-2">
          Select Date:
        </label>
        <input
          type="date"
          id="slotDate"
          className="form-control d-inline-block w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      {/* Sports List */}
      <div className="text-center">
        <h5>Available Sports on {formatDateForFirestore(selectedDate)}</h5>
        {loading ? (
          <p>Loading sports...</p>
        ) : sports.length === 0 ? (
          <p>No sports found for this date.</p>
        ) : (
          <ul className="list-group d-inline-block">
            {sports.map((sport) => (
              <li key={sport} className="list-group-item">
                {sport}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TurfSlot;

// import React, { useEffect, useState } from "react";
// import { getFirestore, doc, collection, getDocs } from "firebase/firestore";
// import "bootstrap/dist/css/bootstrap.min.css";

// interface SlotType {
//   id: string;
//   booking_username: string;
//   court: string;
//   date: string;
//   slot_start_time: string;
//   booked_sports_name: string;
//   payment_status: string;
// }

// const TurfSlot = () => {
//     const [slots, setSlots] = useState<SlotType[]>([]);

//       useEffect(() => {
//         const fetchSlots = async () => {
//           const db = getFirestore();
//           const turfId = "TID_DkO_2192025163623";
//           const date = "22-Sep-2025";
//           const sport = "volleyball";
//           const court = "court 1";
//           const slotsCollectionRef = collection(
//             db,
//             `environment/testing/all_turfs_slot_booking/${turfId}/${date}/${sport}/${court}`
//           );
//           const slotSnapshot = await getDocs(slotsCollectionRef);
//           const slotData = slotSnapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               booking_username: data.booking_username ?? "",
//               court: data.court ?? "",
//               date: data.date ?? "",
//               slot_start_time: data.slot_start_time ?? "",
//               booked_sports_name: data.booked_sports_name ?? "",
//               payment_status: data.payment_status ?? ""
//             } as SlotType;
//           });
//           setSlots(slotData);
//         };
//         fetchSlots();
//       }, []);

//       return (
//         <div className="container mt-4">
//           <h3>Booked Slots</h3>
//           <table className="table table-striped">
//             <thead>
//               <tr>
//                 <th>Username</th>
//                 <th>Court</th>
//                 <th>Date</th>
//                 <th>Time</th>
//                 <th>Sport</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {slots.map(slot => (
//                 <tr key={slot.id}>
//                   <td>{slot.booking_username}</td>
//                   <td>{slot.court}</td>
//                   <td>{slot.date}</td>
//                   <td>{slot.slot_start_time}</td>
//                   <td>{slot.booked_sports_name}</td>
//                   <td>{slot.payment_status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       );
//     };

// export default TurfSlot
