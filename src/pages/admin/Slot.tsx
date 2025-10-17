// <<<<<<< HEAD
// // import React, { useEffect, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import { getBookedSlots } from "../../services/firestoreService";
// // import "bootstrap/dist/css/bootstrap.min.css";

// // interface SlotData {
// //   id: string;
// //   amount: number;
// //   paid_amount?: number;   // ✅ add this
// //   booked_sports_name: string;
// //   booking_id: string;
// //   booking_username: string;
// //   date: string;
// //   owner_id: string;
// //   paid_by: string;
// //   payment_initiated_time: string;
// //   payment_status: string;
// //   payment_transaction_id: string;
// //   slot_start_time: string;
// //   turf_id: string;
// //   turf_name: string;
// //   user_id: string;
// //   turf_closed: boolean | null;
// //   court?: string;         // ✅ also add court (since you’re using slot.court)
// //   sport?: string;         // ✅ also add sport (since you’re using slot.sport?.toUpperCase())
// // }


// // const formatDate = (date: string) => {
// //   const d = new Date(date);
// //   const day = d.getDate().toString().padStart(2, "0");
// //   const month = d.toLocaleString("en-US", { month: "short" });
// //   const year = d.getFullYear();
// //   return `${day}-${month}-${year}`;
// // };
// =======
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getBookedSlots } from "../../services/firestoreService"; // Your service
// import "bootstrap/dist/css/bootstrap.min.css";

// interface SlotData {
//   id: string;
//   slot_start_time: string;
//   booking_username: string;
//   booked_sports_name: string;
//   booking_id: string;
//   date: string;
//   owner_id: string;
//   paid_by: string;
//   payment_initiated_time: string;
//   payment_status: string;
//   payment_transaction_id: string;
//   paid_amount?: number;
//   total_amount?: number;
//   amount: number;
//   turf_id: string;
//   turf_name: string;
//   user_id: string;
//   turf_closed: boolean | null;
//   court?: string;
//   sport?: string;
//   [key: string]: any; // For any extra fields
// }

// // Format date as "29-Sep-2025"
// const formatDate = (date: string) => {
//   const d = new Date(date);
//   const day = d.getDate().toString().padStart(2, "0");
//   const month = d.toLocaleString("en-US", { month: "short" });
//   const year = d.getFullYear();
//   return `${day}-${month}-${year}`;
// };
// >>>>>>> c89ac71b04f3352627db470bf24cd50cf0be315d

// // const getTodayInputFormat = () => {
// //   const d = new Date();
// //   return d.toISOString().split("T")[0];
// // };

// <<<<<<< HEAD
// // const Slot: React.FC = () => {
// //   const { turfId } = useParams<{ turfId: string }>();
// //   console.log('turfId',turfId);
  
// //   const [inputDate, setInputDate] = useState(getTodayInputFormat());
// //   const [selectedDate, setSelectedDate] = useState(formatDate(getTodayInputFormat()));
// //   const [slots, setSlots] = useState<SlotData[]>([]);

// // console.log('slots',slots)
// // console.log('selectedDate',selectedDate)
// // console.log('inputDate',inputDate)

// //   useEffect(() => {
    
// //     if (turfId && selectedDate) {
// //       getBookedSlots(turfId, selectedDate).then(setSlots);
// //     }

// //   }, [turfId, selectedDate]);
// =======
// const SlotByDate: React.FC = () => {
//   const { turfId } = useParams<{ turfId: string }>();
//   const [inputDate, setInputDate] = useState(getTodayInputFormat());
//   const [selectedDate, setSelectedDate] = useState(formatDate(getTodayInputFormat()));
//   const [slots, setSlots] = useState<SlotData[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (turfId && selectedDate) {
//       setLoading(true);
//       getBookedSlots(turfId, selectedDate)
//         .then((data) => setSlots(data))
//         .finally(() => setLoading(false));
//     }
//   }, [turfId, selectedDate]);
// >>>>>>> c89ac71b04f3352627db470bf24cd50cf0be315d

// //   return (
// //     <div className="container my-4">
// //       <h2 className="text-center text-success mb-4">Booked Slots for Turf: {turfId}</h2>

// //       {/* Date Picker */}
// //       <div className="d-flex justify-content-center mb-4">
// //         <input
// //           type="date"
// //           className="form-control w-auto border-success"
// //           value={inputDate}
// //           onChange={(e) => {
// //             setInputDate(e.target.value);
// //             setSelectedDate(formatDate(e.target.value));
// //           }}
// //         />
// //       </div>

// <<<<<<< HEAD
// //     {slots.length > 0 ? (
// //   <div className="row g-4">
// //     {slots.map((slot) => (
// //       <div key={slot.id} className="col-md-4 col-sm-6">
// //         <div
// //           className="card text-center shadow-sm border-0 h-100"
// //           style={{ backgroundColor: "#02613a", color: "#5ad79f" }}
// //         >
// //           {/* Card Header */}
// //           <div className="card-header fw-bold" style={{ backgroundColor: "#014d2d", color: "#fff" }}>
// //             {slot.sport?.toUpperCase()} | {slot.court}
// //           </div>

// //           {/* Card Body */}
// //           <div className="card-body">
// //             <h5 className="card-title">{slot.slot_start_time}</h5>
// //             <p><strong>User:</strong> {slot.booking_username || "N/A"}</p>
// //             <p><strong>Amount:</strong> ₹{slot.paid_amount ?? slot.amount ?? 0}</p>
// //             <p><strong>Status:</strong> {slot.payment_status || "Not Paid"}</p>
// //             <p><strong>Date:</strong> {slot.date}</p>
// //           </div>

// //           {/* Card Footer */}
// //           <div className="card-footer text-muted">
// //             Turf: {slot.turf_name || turfId}
// //           </div>
// //         </div>
// //       </div>
// //     ))}
// //   </div>
// // ) : (
// //   <p className="text-center text-muted">No slots booked yet for {selectedDate}</p>
// // )}

// //     </div>
// //   );
// // };

// // export default Slot;
// =======
//       {loading ? (
//         <div className="row g-4">
//           {Array.from({ length: 6 }).map((_, idx) => (
//             <div key={idx} className="col-md-4 col-sm-6">
//               <div className="card text-center shadow-sm border-0 h-100 p-3">
//                 <div className="placeholder-glow">
//                   <span className="placeholder col-6 mb-2"></span>
//                   <span className="placeholder col-7 mb-2"></span>
//                   <span className="placeholder col-4 mb-2"></span>
//                   <span className="placeholder col-8 mb-2"></span>
//                   <span className="placeholder col-5"></span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : slots.length > 0 ? (
//         <div className="row g-4">
//           {slots.map((slot) => (
//             <div key={slot.id} className="col-md-4 col-sm-6">
//               <div
//                 className="card text-center shadow-sm border-0 h-100"
//                 style={{ backgroundColor: "#02613a", color: "#5ad79f" }}
//               >
//                 {/* Card Header */}
//                 <div
//                   className="card-header fw-bold"
//                   style={{ backgroundColor: "#014d2d", color: "#fff" }}
//                 >
//                   {slot.sport?.toUpperCase()} | {slot.court}
//                 </div>

//                 {/* Card Body */}
//                 <div className="card-body text-start">
//                   <p><strong>Slot Time:</strong> {slot.slot_start_time}</p>
//                   <p><strong>Booked By:</strong> {slot.booking_username}</p>
//                   <p><strong>Sport Name:</strong> {slot.booked_sports_name}</p>
//                   <p><strong>Booking ID:</strong> {slot.booking_id}</p>
//                   <p><strong>Paid Amount:</strong> ₹{slot.paid_amount ?? slot.amount}</p>
//                   <p><strong>Total Amount:</strong> ₹{slot.total_amount ?? slot.amount}</p>
//                   <p><strong>Payment Status:</strong> {slot.payment_status}</p>
//                   <p><strong>Paid By:</strong> {slot.paid_by}</p>
//                   <p><strong>Payment Time:</strong> {slot.payment_initiated_time}</p>
//                   <p><strong>Date:</strong> {slot.date}</p>
//                   <p><strong>Turf Name:</strong> {slot.turf_name}</p>
//                   <p><strong>Court:</strong> {slot.court}</p>
//                   <p><strong>Sport:</strong> {slot.sport}</p>
//                   <p><strong>User ID:</strong> {slot.user_id}</p>
//                   <p><strong>Owner ID:</strong> {slot.owner_id}</p>
//                   <p><strong>Turf Closed:</strong> {slot.turf_closed ? "Yes" : "No"}</p>
//                 </div>

//                 {/* Card Footer */}
//                 <div className="card-footer text-muted text-center">
//                   Slot ID: {slot.id}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-center text-muted">No slots booked yet for {selectedDate}</p>
//       )}
//     </div>
//   );
// };

// export default SlotByDate;
// >>>>>>> c89ac71b04f3352627db470bf24cd50cf0be315d
