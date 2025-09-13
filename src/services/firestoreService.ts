import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

// Get all turf details
export const getTurfs = async () => {
  try {
    const turfRef = collection(db, "environment/testing/turfs");
    const turfDocs = await getDocs(turfRef);

    return turfDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching turfs:", error);
    return [];
  }
};

export const debugPath = async () => {
  try {
    const test1 = await getDocs(collection(db, "environment/testing/all_turfs_slot_booking"));
    console.log("Test1 docs:", test1.docs.map(d => d.id));

    const test2 = await getDocs(collection(db, "environment", "testing", "all_turfs_slot_booking"));
    console.log("Test2 docs:", test2.docs.map(d => d.id));
  } catch (err) {
    console.error("Debug error:", err);
  }
};

export interface SlotData {
  id: string;
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

export const getBookedSlots = async (
  turfId: string,
  date: string
): Promise<SlotData[]> => {
  try {
    const slotsRef = collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      date
    );

    const snapshot = await getDocs(slotsRef);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as SlotData)
    );
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return [];
  }
};

export const getAvailableDates = async (turfId: string): Promise<string[]> => {
  try {
    const datesRef = collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId
    );

    const snapshot = await getDocs(datesRef);
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return [];
  }
};

// export const getBookedSlots = async () => {
//   try {
//     const bookings: any[] = [];

//     // Level 1: Turf collection
//     const turfCollection = collection(db, "environment", "testing", "all_turfs_slot_booking");
//     const turfSnapshot = await getDocs(turfCollection);
//     console.log("Turf docs found:", turfSnapshot.docs.map((d) => d.id));

//     for (const turfDoc of turfSnapshot.docs) {
//       const turfId = turfDoc.id;

//       // Level 2: Date collections (⚠️ these are collections, not documents)
//       const dateCollectionRef = collection(db, "environment", "testing", "all_turfs_slot_booking", turfId, "07-Sep-2025");
//       const slotSnapshot = await getDocs(dateCollectionRef);
//       console.log(`Slots under ${turfId}/07-Sep-2025:`, slotSnapshot.docs.map((d) => d.id));

//       slotSnapshot.forEach((slotDoc) => {
//         bookings.push({
//           turfId,
//           date: "07-Sep-2025",
//           slot: slotDoc.id,
//           ...slotDoc.data(),
//         });
//       });
//     }

//     console.log("All Bookings fetched:", bookings);
//     return bookings;
//   } catch (error) {
//     console.error("Error fetching booked slots:", error);
//     return [];
//   }
// };

// Get Owners
export const getOwners = async () => {
  try {
    const ownersRef = collection(db, "environment/testing/owners"); // 👈 update path if needed
    const ownerDocs = await getDocs(ownersRef);

    return ownerDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching owners:", error);
    return [];
  }
};