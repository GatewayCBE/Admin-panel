// import React, { useEffect, useState } from "react";
// import { getTurfs, deleteTurf, updateTurf } from "../services/firestoreService";

// type Turf = {
//   turfId: string;
//   turfName: string;
//   turfLocation: string;
//   turfPrice: number;
//   turfImage: string;
// };

// const TurfList = () => {
//   const [turfs, setTurfs] = useState<Turf[]>([]);
//   const [editTurf, setEditTurf] = useState<Turf | null>(null);

//   const fetchTurfs = async () => {
//     const data = await getTurfs(); // Make sure getTurfs returns Turf[]
//     setTurfs(data);
//   };

//   useEffect(() => {
//     fetchTurfs();
//   }, []);

//   const handleDelete = async (id: string) => {
//     await deleteTurf(id);
//     fetchTurfs(); // Refresh the list
//   };

//   const handleUpdate = async (turf: Turf) => {
//     await updateTurf(turf.turfId, turf);
//     fetchTurfs(); // Refresh the list
//   };

//   return (
//     <div>
//       {turfs.map((turf) => (
//         <div key={turf.turfId}>
//           <h3>{turf.turfName}</h3>
//           <p>{turf.turfLocation}</p>
//           <p>₹{turf.turfPrice}</p>
//           <img src={turf.turfImage} alt={turf.turfName} width={200} />
//           <button onClick={() => handleDelete(turf.turfId)}>Delete</button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TurfList;
