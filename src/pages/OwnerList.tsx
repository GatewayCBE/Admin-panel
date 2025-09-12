// import React, { useEffect, useState } from "react";
// import { getOwners, deleteOwner, updateOwner } from "../services/firestoreService";

// const OwnerList = () => {
//   interface Owner {
//   id: string;
//   ownerId: string;
//   ownerName: string;
//   ownerEmail: string;
//   ownerMobile: string;
//   ownerLocation: string;
//   turfId: string;
// }

// const [owners, setOwners] = useState<Owner[]>([]);
// const [editOwner, setEditOwner] = useState<Owner | null>(null);

//   const fetchOwners = async () => {
//   const data = await getOwners();
//   const ownersData: Owner[] = data.map((doc: any) => ({
//     id: doc.id,
//     ownerId: doc.ownerId || "",
//     ownerName: doc.ownerName || "",
//     ownerEmail: doc.ownerEmail || "",
//     ownerMobile: doc.ownerMobile || "",
//     ownerLocation: doc.ownerLocation || "",
//     turfId: doc.turfId || "",
//   }));
//   setOwners(ownersData);
// };

//   useEffect(() => {
//     fetchOwners();
//   }, []);

//   const handleDelete = async (id: string) => {
//     await deleteOwner(id);
//     fetchOwners();
//   };

//   const handleUpdate = async () => {
//     if (editOwner) {
//       await updateOwner(editOwner.id, editOwner);
//       setEditOwner(null);
//       fetchOwners();
//     }
//   };

//   return (
//     <div>
//       <h2>📋 Owners</h2>
//       <table border={1} cellPadding={5}>
//         <thead>
//           <tr>
//             <th>Owner ID</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Mobile</th>
//             <th>Location</th>
//             <th>Turf ID</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {owners.map((owner) => (
//             <tr key={owner.id}>
//               <td>{owner.ownerId}</td>
//               <td>{owner.ownerName}</td>
//               <td>{owner.ownerEmail}</td>
//               <td>{owner.ownerMobile}</td>
//               <td>{owner.ownerLocation}</td>
//               <td>{owner.turfId}</td>
//               <td>
//                 <button onClick={() => setEditOwner(owner)}>✏️ Edit</button>
//                 <button onClick={() => handleDelete(owner.id)}>🗑 Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {editOwner && (
//         <div style={{ marginTop: "10px" }}>
//           <h4>Edit Owner</h4>
//           <input
//             type="text"
//             value={editOwner.ownerName}
//             onChange={(e) => editOwner && setEditOwner({ ...editOwner, ownerName: e.target.value })}
//             placeholder="Owner Name"
//           />
//           <input
//             type="email"
//             value={editOwner.ownerEmail}
//             onChange={(e) => setEditOwner({ ...editOwner, ownerEmail: e.target.value })}
//             placeholder="Owner Email"
//           />
//           <button onClick={handleUpdate}>Save</button>
//           <button onClick={() => setEditOwner(null)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OwnerList;
