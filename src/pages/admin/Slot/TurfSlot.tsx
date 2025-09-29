import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAvailableDates } from "../../../services/firestoreService";

const TurfSlot: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
  const fetchDates = async () => {
    if (turfId) {
      const fetchedDates = await getAvailableDates(turfId);
      console.log("Fetched Dates:", fetchedDates);
      setDates(fetchedDates);
    }
  };
  fetchDates();
}, [turfId]);

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-success text-center mb-4">
        Slots for Turf: {turfId}
      </h2>
      <div>
        {dates.length === 0 ? (
          <p className="text-center text-muted">No dates found for this turf.</p>
        ) : (
          <ul className="list-unstyled">
            {dates.map((date) => (
              <li key={date} className="text-center">
                {date}
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