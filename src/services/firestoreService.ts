import { db } from "../firebase";
import { collection, doc, getDocs } from "firebase/firestore";

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

export const getBookedSlots = async (turfId: string, selectedDate: string) => {
  try {
    // ✅ Format helpers
    const formatDate = (date: string) => {
      const [year, month, day] = date.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${day}-${monthNames[parseInt(month) - 1]}-${year}`;
    };

    // Two possibilities:
    // 1. User gave ISO (2025-09-20)
    // 2. Already formatted (20-Sep-2025)
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
    const formattedDate = isoPattern.test(selectedDate)
      ? formatDate(selectedDate)
      : selectedDate;

    // Paths to check
    const pathsToTry = [
      doc(db, "environment", "testing", "all_turfs_slot_booking", turfId, formattedDate),
      doc(db, "environment", "testing", "all_turfs_slot_booking", turfId, selectedDate),
    ];

    let results: any[] = [];

    for (const path of pathsToTry) {
      const slotCollection = collection(path, "/");
      const snapshot = await getDocs(slotCollection);

      if (!snapshot.empty) {
        results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        break; // ✅ Stop if found
      }
    }

    return results;
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