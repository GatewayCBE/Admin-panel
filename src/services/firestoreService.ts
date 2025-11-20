import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

// Get all turf details
export const getTurfs = async () => {
  try {
    const turfRef = collection(db, "environment", "testing", "turfs");
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
      collection(db, "environment", "testing", "all_turfs_slot_booking")
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

export const getTurfDates = async (turfId: string) => {
  const snapshot = await getDocs(
    collection(db, "environment", "testing", "all_turfs_slot_booking", turfId)
  );
  return snapshot.docs.map((d) => d.id);
};

export const getSportsForDate = async (turfId: string, date: string) => {
  const snapshot = await getDocs(
    collection(db, "environment", "testing", "all_turfs_slot_booking", turfId, date)
  );
  return snapshot.docs.map((d) => d.id);
};

export const getCourtsForSport = async (turfId: string, date: string, sport: string) => {
  const snapshot = await getDoc(
    doc(db, "environment", "testing", "all_turfs_slot_booking", turfId, date, sport)
  );
  return snapshot.exists() ? snapshot.data()?.courts || [] : [];
};


export const getBookedSlotTimes = async (
  turfId: string,
  date: string,
  sport: string,
  court: string
) => {
  const snapshot = await getDocs(
    collection(db, "environment", "testing", "all_turfs_slot_booking", turfId, date, sport, court)
  );
  return snapshot.docs.map((d) => d.id);
};

export const getSlotDetails = async (
  turfId: string,
  date: string,
  sport: string,
  court: string,
  slotTime: string
) => {
  const slotDoc = doc(
    db,
    "environment",
    "testing",
    "all_turfs_slot_booking",
    turfId,
    date,
    sport,
    court,
    slotTime
  );
  const snapshot = await getDoc(slotDoc);
  return snapshot.exists() ? snapshot.data() : null;
};

export interface BookedSlot {
  booking_id: string;
  booking_username?: string;
  booked_sports_name?: string;
  court?: string;
  turf_name?: string;
  date?: string;

  slot_start_time?: string;
  slot_end_time?: string;
  time?: string;

  paid_amount?: number;
  unpaid_amount?: number;
  payment_status?: string;
  payment_initiated_time?: string;

  owner_id?: string;
  turfId?: string;
  turfName?: string;

  [key: string]: any;
}

export async function getAllBookedSlots(
  turfId: string,
  date: string,
  sport: string,
  court: string
): Promise<BookedSlot[]> {
  try {
    const slotsRef = collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      date,
      sport,
      court
    );

    const snapshot = await getDocs(slotsRef);

    if (snapshot.empty) {
      console.warn(`⚠️ No slots found for ${sport}/${court}`);
      return [];
    }

    const slots: BookedSlot[] = snapshot.docs.map((doc) => {
      const data = doc.data() || {};

      return {
        booking_id: doc.id,
        booking_username: data.booking_username || "",
        sport: sport,

        booked_sports_name: data.booked_sports_name || sport,
        court: data.court || court,
        date: data.date || date,
        turf_name: data.turf_name || "",

        slot_start_time: data.slot_start_time || doc.id,
        slot_end_time: data.slot_end_time || null,
        time: data.slot_start_time || data.time || doc.id,

        paid_amount: Number(data.paid_amount ?? 0),
        unpaid_amount: Number(data.unpaid_amount ?? 0),
        payment_status: data.payment_status || "unknown",
        payment_initiated_time: data.payment_initiated_time || "",

        owner_id: data.owner_id || "",

        ...data // keep remaining Firestore fields
      };
    });

    return slots;
  } catch (err) {
    console.error("❌ Error fetching booked slots:", err);
    return [];
  }
}

export async function getAllDatesAndSlots(turfId: string) {
  try {
    const turfRef = collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId
    );

    const dateSnapshots = await getDocs(turfRef);

    if (dateSnapshots.empty) {
      console.warn("⚠️ No dates found for turf:", turfId);
      return [];
    }

    const results: any[] = [];

    for (const dateDoc of dateSnapshots.docs) {
      const date = dateDoc.id;
      const sportsSnapshot = await getDocs(collection(turfRef, date));

      const sportsData = [];

      for (const sportDoc of sportsSnapshot.docs) {
        const sport = sportDoc.id;
        const courtsSnapshot = await getDocs(collection(turfRef, date, sport));

        const courtData = [];

        for (const courtDoc of courtsSnapshot.docs) {
          const court = courtDoc.id;
          const slotsSnapshot = await getDocs(
            collection(turfRef, date, sport, court)
          );
          const slots = slotsSnapshot.docs.map((doc) => ({
            time: doc.id,
            ...doc.data(),
          }));
          courtData.push({ court, slots });
        }

        sportsData.push({ sport, courts: courtData });
      }

      results.push({ date, sports: sportsData });
    }

    console.log("📅 All booked slots for turf:", results);
    return results;
  } catch (err) {
    console.error("❌ Error fetching all booked slots:", err);
    return [];
  }
}

// Global
export const getGlobalAnalytics = async () => {
  try {
    const ref = doc(db, "environment/testing/analytics/data/global/summary");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        total_revenue: data.total_revenue ?? 0,
        total_bookings: data.total_bookings ?? 0,
      };
    }
    return { total_revenue: 0, total_bookings: 0 };
  } catch (error) {
    console.error("Error fetching global analytics:", error);
    return { total_revenue: 0, total_bookings: 0 };
  }
};

// Daily: return the whole daily object (including nested turfs/users maps)
export const getDailyAnalytics = async () => {
  try {
    const ref = collection(db, "environment/testing/analytics/data/daily");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        // keep original totals
        total_revenue: data.total_revenue ?? 0,
        total_bookings: data.total_bookings ?? 0,
        // include nested breakdown maps (may be undefined)
        turfs: data.turfs ?? {},
        users: data.users ?? {},
        date: data.date ?? d.id,
      };
    });
  } catch (error) {
    console.error("Error fetching daily analytics:", error);
    return [];
  }
};

// Turf & users summary (overall aggregates)
export const getTurfAnalytics = async () => {
  try {
    const ref = collection(db, "environment/testing/analytics/data/turf");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        turf_id: data.turf_id ?? d.id,
        turf_name: data.turf_name ?? "Unknown Turf",
        total_revenue: data.total_revenue ?? 0,
        total_bookings: data.total_bookings ?? 0,
      };
    });
  } catch (error) {
    console.error("Error fetching turf analytics:", error);
    return [];
  }
};

export const getUserAnalytics = async () => {
  try {
    const colRef = collection(db, "environment/testing/analytics/data/users");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id ?? doc.id,
        user_name: data.user_name ?? "Unknown User",
        total_spent: data.total_spent ?? 0,
        total_bookings: data.total_bookings ?? 0,
      };
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return [];
  }
};

function parseStringTimestampToDate(s?: string): Date | null {
  if (!s || typeof s !== "string") return null;
  const fixed = s.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(fixed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Fetch all booked slots for a given turf and date (across all sports)
 */
export async function getSportsAndCourts(turfId: string, date: string) {
  try {
    // console.log("🔎 Fetching sports & courts for Turf:", turfId, "Date:", date);

    const dateCollectionRef = collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      date
    );

    const sportsSnapshot = await getDocs(dateCollectionRef);

    if (sportsSnapshot.empty) {
      // console.warn("⚠️ No sports found for this date!");
      return [];
    }

    const result: any[] = [];

    for (const sportDoc of sportsSnapshot.docs) {
      const data = sportDoc.data();
      const sportName = sportDoc.id;
      const courts = data.courts || [];

      result.push({ sport: sportName, courts });
    }

    console.log("✅ Sports & courts fetched:", result);
    return result;
  } catch (err) {
    console.error("❌ Error fetching sports & courts:", err);
    return [];
  }
}

// NEW — SUPER FAST Cloud Function version
const functions = getFunctions(); // Automatically uses your project
// Auto-detect environment
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  connectFunctionsEmulator(functions, "localhost", 5001);
  console.log("Connected to Firebase Functions Emulator (localhost:5001)");
}

const getRecentBookingsFn = httpsCallable(functions, "getRecentBookings");

export async function getAllBookings(): Promise<BookedSlot[]> {
  try {
    console.log("Fetching recent bookings via Cloud Function...");
    const result = await getRecentBookingsFn();
    
    // The function returns { success: true, bookings: [...] }
    const bookings = (result.data as any).bookings || [];
    
    console.log(`Loaded ${bookings.length} bookings instantly`);
    return bookings;
  } catch (error: any) {
    console.error("Failed to fetch bookings from Cloud Function:", error);
    // Optional: fallback to old method only during transition
    // alert("Using fallback method — please refresh in a minute");
    // return oldSlowMethod(); // you can keep as backup temporarily
    return [];
  }
}