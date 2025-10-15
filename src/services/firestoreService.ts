import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Get all turf details
export const getTurfs = async () => {
  try {
    const turfRef = collection(db, "environment/testing/turfs");
    const turfDocs = await getDocs(turfRef);

    return turfDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching turfs:", error);
    return [];
  }
};

export const getTurfsByOwner = async (ownerId: string) => {
  try {
    const turfRef = collection(db, "environment", "testing", "turfs");
    const q = query(turfRef, where("owner_id", "==", ownerId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching turfs by owner:", error);
    return [];
  }
};

export const debugPath = async () => {
  try {
    const test1 = await getDocs(
      collection(db, "environment/testing/all_turfs_slot_booking")
    );
    console.log(
      "Test1 docs:",
      test1.docs.map((d) => d.id)
    );

    const test2 = await getDocs(
      collection(db, "environment", "testing", "all_turfs_slot_booking")
    );
    console.log(
      "Test2 docs:",
      test2.docs.map((d) => d.id)
    );
  } catch (err) {
    console.error("Debug error:", err);
  }
};

export interface SlotData {
  id: string;
  amount: number;
  paid_amount?: number;
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
  court?: string;
  sport?: string;
}

export const getBookedSlots = async (turfId: string, selectedDate: string) => {
  try {
    const slots: any[] = [];

    // Reference to date collection under turf
    const dateRef = collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      selectedDate
    );

    // Get all sports under that date
    const sportsSnap = await getDocs(dateRef);

    for (const sportDoc of sportsSnap.docs) {
      const sportName = sportDoc.id; // cricket, football, etc.

      const courtsRef = collection(dateRef, sportName);
      const courtsSnap = await getDocs(courtsRef);

      for (const courtDoc of courtsSnap.docs) {
        const courtName = courtDoc.id;

        const timeslotsRef = collection(courtsRef, courtName);
        const timeslotsSnap = await getDocs(timeslotsRef);

        timeslotsSnap.forEach((slotDoc) => {
          slots.push({
            id: slotDoc.id,
            sport: sportName,
            court: courtName,
            ...slotDoc.data(),
          });
        });
      }
    }

    return slots;
  } catch (err) {
    console.error("Error fetching slots:", err);
    return [];
  }
};

// Get all slots across all users by payment status
export const getSlotsByPaymentStatus = async (status: string, turfId?: string) => {
  try {
    const usersRef = collection(db, "environment/testing/users");
    const userSnapshot = await getDocs(usersRef);
    const allSlots: any[] = [];

    userSnapshot.docs.forEach((userDoc) => {
      const userData = userDoc.data();
      const paymentCopies = userData.payment_copies || [];

      // Filter by status (and turfId if provided)
      const filteredSlots = paymentCopies.filter((slot: any) => {
        const statusMatch = slot.payment_status === status;
        const turfMatch = turfId ? slot.turf_id === turfId : true;
        return statusMatch && turfMatch;
      });

      allSlots.push(...filteredSlots);
    });

    return allSlots;
  } catch (error) {
    console.error("Error fetching slots by payment status:", error);
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


// export async function getSlotByBookingId(turfId: string, bookingId: string) {
//   try {
//     const ref = collection(db, "environment/testing/all_turfs_slot_booking");
//     const q = query(ref, where("turf_id", "==", turfId), where("booking_id", "==", bookingId));
//     const snapshot = await getDocs(q);

//     if (!snapshot.empty) {
//       return snapshot.docs[0].data();
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching slot:", error);
//     return null;
//   }
// }