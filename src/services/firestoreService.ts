import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  QuerySnapshot,
  DocumentData,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getApp } from "firebase/app";
import { Owner } from "../types/Owner";
import { Turf } from "../types/Turf";

/**
 * Generate Custom ID exactly like Flutter app
 * e.g., USID_rah_02122025163011 or OID_Rak_02122025163222
 */
export const generateCustomId = (
  role: "user" | "owner",
  name: string
): string => {
  const prefix = role === "user" ? "USID_" : "OID_";
  const namePart = name.trim().slice(0, 3);
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${dd}${mm}${yyyy}${hh}${mins}${ss}`;
  return `${prefix}${namePart}_${timestamp}`;
};

export const generateTurfId = (ownerName: string): string => {
  const prefix = "TID_";
  const namePart = ownerName.trim().slice(0, 3);

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${prefix}${namePart}_${dd}${mm}${yyyy}${hh}${min}${ss}`;
};

/**
 * Save User/Owner to Firestore
 */
export const saveUserProfile = async (
  role: "user" | "owner",
  data: {
    name: string;
    email: string;
    mobile: string;
    uid: string;
    password: string;
    acceptedTerms: boolean;
  }
) => {
  const customId = generateCustomId(role, data.name);
  const now = new Date();
  const collectionName = role === "user" ? "users" : "owners";

  const userData: any = {
    [role === "user" ? "user_id" : "owner_id"]: customId,
    [role === "user" ? "user_name" : "owner_name"]: data.name,
    [role === "user" ? "user_email" : "owner_email"]: data.email,
    [role === "user" ? "user_mobile_number" : "owner_mobile_number"]:
      data.mobile,
    [role === "user" ? "user_password" : "owner_password"]: data.password,
    has_accepted_terms: data.acceptedTerms,
    terms_accepted_at: data.acceptedTerms ? now.toISOString() : null,
    created_at: now.toISOString(),
    firebase_uid: data.uid,
    payment_copies: [],
    ...(role === "user"
      ? { user_address: null, user_profile_image_url: null }
      : { owner_location: null, owner_profile_image: null }),
  };

  const docRef = doc(db, "environment", "testing", collectionName, data.mobile);
  await setDoc(docRef, userData);

  return customId;
};

/**
 * Check if mobile is already registered for a specific role
 */
export const isMobileRegisteredForRole = async (
  role: "user" | "owner",
  mobile: string
): Promise<boolean> => {
  const colRef =
    role === "user"
      ? collection(db, "environment", "testing", "users")
      : collection(db, "environment", "testing", "owners");

  const field = role === "user" ? "user_mobile_number" : "owner_mobile_number";

  const snap = await getDocs(query(colRef, where(field, "==", mobile)));
  return !snap.empty;
};

// Check if this email already exists under a DIFFERENT mobile number
export const isEmailLinkedToAnotherMobile = async (
  role: "user" | "owner",
  email: string,
  currentMobile: string
): Promise<boolean> => {
  const colRef =
    role === "user"
      ? collection(db, "environment/testing/users")
      : collection(db, "environment/testing/owners");

  const field = role === "user" ? "user_email" : "owner_email";

  const snap = await getDocs(query(colRef, where(field, "==", email)));
  return !snap.empty;
};

// Get user by email (search all docs under users/)
export const getUserDocByEmail = async (email: string) => {
  const colRef = collection(db, "environment/testing/users");
  const q = query(colRef, where("user_email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) return null;
  return snap.docs[0].data();
};

// Get owner by email
export const getOwnerDocByEmail = async (email: string) => {
  const colRef = collection(db, "environment/testing/owners");
  const q = query(colRef, where("owner_email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) return null;
  return snap.docs[0].data();
};

// Get user by mobile (optional helper)
export const getUserDocByMobile = async (mobile: string) => {
  const docRef = doc(db, "environment/testing/users", mobile);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};

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

/**
 * Get a single turf document by ID
 */
export const getTurfById = async (turfId: string): Promise<Turf | null> => {
  try {
    const docRef = doc(db, "environment", "testing", "turfs", turfId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.warn(`Turf not found: ${turfId}`);
      return null;
    }

    const data = snap.data();

    return {
      id: snap.id,
      turf_id: snap.id,
      ...data,
    } as Turf;
  } catch (err) {
    console.error("Error fetching turf:", err);
    return null;
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

/**
 * Update an existing turf document
 */
export const updateTurf = async (turfId: string, updatedData: any) => {
  try {
    const docRef = doc(db, "environment", "testing", "turfs", turfId);
    await updateDoc(docRef, {
      ...updatedData,
      updated_at: new Date(), // Tracking when it was modified
    });
    return true;
  } catch (error) {
    console.error("Error updating turf:", error);
    throw error;
  }
};

/**
 * Delete a turf document
 */
export const deleteTurf = async (turfId: string) => {
  try {
    const docRef = doc(db, "environment", "testing", "turfs", turfId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting turf:", error);
    throw error;
  }
};

export async function createTurfBookingSafe({
  turfId,
  dateString,
  sportName,
  courtName,
  slotStart,
  bookingData,
}: {
  turfId: string;
  dateString: string;   // "02-Dec-2025"
  sportName: string;    // "boxcricket & football"
  courtName: string;    // "court 1"
  slotStart: string;    // "7:00PM"
  bookingData: any;
}) {
  const slotRef = doc(
    db,
    "environment",
    "testing",
    "all_turfs_slot_booking",
    turfId,
    dateString,
    sportName,
    courtName,
    slotStart
  );

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(slotRef);

      // 🔒 HARD LOCK — slot already exists
      if (snap.exists()) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      // ✅ Create booking (NO merge)
      transaction.set(slotRef, {
        ...bookingData,
        created_at: serverTimestamp(),
      });
    });

    return { success: true };
  } catch (err: any) {
    if (err.message === "SLOT_ALREADY_BOOKED") {
      return {
        success: false,
        reason: "SLOT_ALREADY_BOOKED",
      };
    }

    console.error("Transaction failed:", err);
    return {
      success: false,
      reason: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Get owner details using owner_id field
 */
export const getOwnerByOwnerId = async (
  ownerId: string
): Promise<Owner | null> => {
  try {
    const ownerRef = collection(db, "environment", "testing", "owners");
    const q = query(ownerRef, where("owner_id", "==", ownerId));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const docSnap = snap.docs[0];

    return {
      doc_id: docSnap.id,
      ...(docSnap.data() as Omit<Owner, "doc_id">),
    };
  } catch (error) {
    console.error("Error fetching owner:", error);
    return null;
  }
};

const mapPrices = (sports: any[]) => {
  const result: any = {};

  sports.forEach((s) => {
    const key = s.name.toLowerCase();
    result[key] = {};

    Object.keys(s.dayPrices).forEach((day) => {
      result[key][day] = {
        day: Number(s.dayPrices[day] || 0),
        night: Number(s.nightPrices[day] || 0),
      };
    });
  });

  return result;
};

const mapTimings = (sports: any[]) => {
  const result: any = {};

  sports.forEach((s) => {
    const key = s.name.toLowerCase();
    result[key] = {
      opening_time: s.openingTime,
      closing_time: s.closingTime,
      day_start_time: s.daySlotStart,
      day_end_time: s.daySlotEnd,
      night_start_time: s.nightSlotStart,
      night_end_time: s.nightSlotEnd,
    };
  });

  return result;
};

const mapPersons = (sports: any[]) => {
  const result: any = {};

  sports.forEach((s) => {
    const key = s.name.toLowerCase();
    result[key] = Number(s.maxPersons || 0);
  });

  return result;
};

export const createTurf = async ({
  formData,
  sports,
  ownerId,
  ownerName,
  imageUrls,
  addedSource,
}: any) => {
  const turfId = generateTurfId(ownerName);

  const turfDoc = {
    turf_id: turfId,
    turf_name: formData.turfName,
    turf_mobile_number: formData.turfMobileNumber,
    turf_location: formData.turfAddress,
    turf_description: formData.turfDescription,
    turf_length: `${formData.turfLength} ${formData.dimensionUnit}`,
    turf_breadth: `${formData.turfBreadth} ${formData.dimensionUnit}`,
    turf_height: `${formData.turfHeight} ${formData.dimensionUnit}`,
    amenities: formData.facilities,
    badminton_court_type: formData.badmintonCourtType || null,
    owner_id: ownerId,
    turf_images: imageUrls,
    available_sports_list: sports.map((s: any) => s.name),
    sport_specific_price: mapPrices(sports),
    sport_specific_timing: mapTimings(sports),
    sports_specific_person_count: mapPersons(sports),
    turf_active_status: true,
    turf_opened: true,
    booking_type: "call_now",
    added_source: {
      platform: addedSource.platform,
      checked_by: ownerId,
      checked_at: new Date().toISOString(),
    },
    created_at: new Date(),
  };

  await setDoc(doc(db, "environment", "testing", "turfs", turfId), turfDoc);

  return turfId;
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
export const getSlotsByPaymentStatus = async (
  status: string,
  turfId?: string
) => {
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
    collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      date
    )
  );
  return snapshot.docs.map((d) => d.id);
};

export const getCourtsForSport = async (
  turfId: string,
  date: string,
  sport: string
) => {
  const snapshot = await getDoc(
    doc(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      date,
      sport
    )
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
    collection(
      db,
      "environment",
      "testing",
      "all_turfs_slot_booking",
      turfId,
      date,
      sport,
      court
    )
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

        ...data, // keep remaining Firestore fields
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
        total_revenue: data.total_revenue ?? 0,
        total_bookings: data.total_bookings ?? 0,
        turfs: data.turfs ?? {},
        users: data.users ?? {},
        date: data.date ?? d.id,

        // ⬇ FIXED: Convert flat fields to nested format
        time_split: {
          day: {
            bookings: data["time_split.day.bookings"] ?? 0,
            revenue: data["time_split.day.revenue"] ?? 0,
          },
          night: {
            bookings: data["time_split.night.bookings"] ?? 0,
            revenue: data["time_split.night.revenue"] ?? 0,
          },
        },

        weekday_bookings: data.weekday_bookings ?? 0,
        weekday_revenue: data.weekday_revenue ?? 0,
        weekend_bookings: data.weekend_bookings ?? 0,
        weekend_revenue: data.weekend_revenue ?? 0,
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

const app = getApp();
const functions = getFunctions(app, "asia-south1");

// Use direct fetch — works perfectly with onRequest + emulator + production
const baseUrl = "https://asia-south1-play-arena-e83d8.cloudfunctions.net";

export async function getAllBookings(): Promise<any[]> {
  try {
    console.log("Fetching recent bookings...");
    const response = await fetch(`${baseUrl}/getRecentBookings`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    console.log(`Loaded ${result.bookings?.length || 0} bookings`);
    return result.bookings || [];
  } catch (error: any) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}
