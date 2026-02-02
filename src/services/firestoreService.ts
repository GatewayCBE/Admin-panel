import { auth, db } from "../firebase";
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
   Timestamp,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getApp } from "firebase/app";
import { Owner } from "../types/Owner";
import { Turf } from "../types/Turf";
import { getAuth } from "firebase/auth";
import { parseDate } from "../utils/dateUtils";

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

export const getOwnerDocByMobile = async (mobile: string) => {
  const digits = mobile.replace(/\D/g, "").slice(-10);

  const colRef = collection(db, "environment", "testing", "owners");

  const q = query(
    colRef,
    where("owner_mobile_number", "in", [
      digits,
      Number(digits),
      "91" + digits,
      "+91" + digits,
      "0" + digits
    ])
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    docId: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
};



export const getUserDocByMobile = async (mobile: string) => {
  const digits = mobile.replace(/\D/g, "").slice(-10);

  console.log("Searching mobile:", digits);

  const colRef = collection(db, "environment", "testing", "users");

  const q = query(
    colRef,
    where("user_mobile_number", "in", [
      digits,                 // 8925232180
      Number(digits),         // 8925232180 as number
      "91" + digits,          // 918925232180
      "+91" + digits,         // +918925232180
      "0" + digits            // 08925232180
    ])
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    console.log("No user found with mobile");
    return null;
  }

  console.log("User found:", snap.docs[0].data());

  return {
    docId: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
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

export const getOwnerById = async (ownerId: string) => {
  const ownerRef = doc(db, "environment", "testing", "owners", ownerId);
  const snapshot = await getDoc(ownerRef);
  // console.log('getOwnerById snap',ownerRef);
  
  return snapshot.exists() ? snapshot.data() : null;
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

// export async function createTurfBookingSafe({
//   turfId,
//   dateString,
//   sportName,
//   courtName,
//   slotStart,
//   bookingData,
// }: {
//   turfId: string;
//   dateString: string;   // "02-Dec-2025"
//   sportName: string;    // "boxcricket & football"
//   courtName: string;    // "court 1"
//   slotStart: string;    // "7:00PM"
//   bookingData: any;
// }) {
//   const slotRef = doc(
//     db,
//     "environment",
//     "testing",
//     "all_turfs_slot_booking",
//     turfId,
//     dateString,
//     sportName,
//     courtName,
//     slotStart
//   );

//   try {
//     await runTransaction(db, async (transaction) => {
//       const snap = await transaction.get(slotRef);

//       // 🔒 HARD LOCK — slot already exists
//       if (snap.exists()) {
//         throw new Error("SLOT_ALREADY_BOOKED");
//       }

//       // ✅ Create booking (NO merge)
//       transaction.set(slotRef, {
//         ...bookingData,
//         created_at: serverTimestamp(),
//       });
//     });

//     return { success: true };
//   } catch (err: any) {
//     if (err.message === "SLOT_ALREADY_BOOKED") {
//       return {
//         success: false,
//         reason: "SLOT_ALREADY_BOOKED",
//       };
//     }

//     console.error("Transaction failed:", err);
//     return {
//       success: false,
//       reason: "UNKNOWN_ERROR",
//     };
//   }
// }

export const updateOwnerProfile = async (ownerId: string, data: any) => {
  const ownerRef = doc(db, "environment", "testing", "owners", ownerId);
  await updateDoc(ownerRef, data);
};

export const getOwnerByOwnerId = async (
  ownerId: string
): Promise<Owner | null> => {
  try {
    const ownerRef = collection(db, "environment", "testing", "owners");
    const q = query(ownerRef, where("owner_id", "==", ownerId));
    const snap = await getDocs(q);
console.log('getOwnerByOwnerId snap',ownerRef);

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

export interface AppUser {
  doc_id: string;
  user_id: string;
  user_name: string;
  user_mobile_number: string;
  user_profile_image_url?: string;
  user_email?: string;
}

export const updateUserProfile = async (docId: string, data: any) => {
  const userRef = doc(db, "environment", "testing", "users", docId);
  await updateDoc(userRef, data);
};


export const getUserByUserId = async (
  userId: string
): Promise<AppUser | null> => {
  try {
    const userRef = collection(db, "environment", "testing", "users");
    const q = query(userRef, where("user_id", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const docSnap = snap.docs[0];
    const data = docSnap.data();

    return {
      doc_id: docSnap.id,
      user_id: data.user_id || "",
      user_name: data.user_name || "",
      user_mobile_number: data.user_mobile_number || "",
      user_profile_image_url: data.user_profile_image_url || "",
      user_email: data.user_email || "",
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
    // turf_mobile_number: formData.turfMobileNumber,
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

// export const debugPath = async () => {
//   try {
//     const test1 = await getDocs(
//       collection(db, "environment", "testing", "all_turfs_slot_booking")
//     );
//     console.log(
//       "Test1 docs:",
//       test1.docs.map((d) => d.id)
//     );

//     const test2 = await getDocs(
//       collection(db, "environment", "testing", "all_turfs_slot_booking")
//     );
//     console.log(
//       "Test2 docs:",
//       test2.docs.map((d) => d.id)
//     );
//   } catch (err) {
//     console.error("Debug error:", err);
//   }
// };

export const fetchAllBookings = async (environment: string = "testing") => {
  try {
    const bookingsRef = collection(db, `environments/${environment}/bookings`);
    const snapshot = await getDocs(bookingsRef);
    
    const bookings: any[] = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Fetched ${bookings.length} bookings from ${environment} environment`);
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

/**
 * Fetch bookings with filters
 * @param environment - The environment to fetch from
 * @param filters - Optional filters (turfId, userId, ownerId, status)
 * @returns Promise with filtered array of booking objects
 */
export const fetchBookingsWithFilters = async (
  environment: string = "testing",
  filters?: {
    turfId?: string;
    userId?: string;
    ownerId?: string;
    bookingStatus?: string;
    paymentStatus?: string;
  }
) => {
  try {
    let bookingsQuery = collection(db, `environments/${environment}/bookings`);
    
    if (filters) {
      const constraints = [];
      
      if (filters.turfId) {
        constraints.push(where("turfId", "==", filters.turfId));
      }
      if (filters.userId) {
        constraints.push(where("userId", "==", filters.userId));
      }
      if (filters.ownerId) {
        constraints.push(where("ownerId", "==", filters.ownerId));
      }
      if (filters.bookingStatus) {
        constraints.push(where("bookingStatus", "==", filters.bookingStatus));
      }
      if (filters.paymentStatus) {
        constraints.push(where("paymentStatus", "==", filters.paymentStatus));
      }
      
      if (constraints.length > 0) {
        bookingsQuery = query(bookingsQuery as any, ...constraints) as any;
      }
    }
    
    const snapshot = await getDocs(bookingsQuery);
    
    const bookings: any[] = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Fetched ${bookings.length} filtered bookings`);
    return bookings;
  } catch (error) {
    console.error("Error fetching filtered bookings:", error);
    throw error;
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

// export const getAvailableDates = async (turfId: string): Promise<string[]> => {
//   try {
//     const datesRef = collection(
//       db,
//       "environment",
//       "testing",
//       "all_turfs_slot_booking",
//       turfId
//     );

//     const snapshot = await getDocs(datesRef);
//     return snapshot.docs.map((doc) => doc.id);
//   } catch (error) {
//     console.error("Error fetching available dates:", error);
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

// export const getTurfDates = async (turfId: string) => {
//   const snapshot = await getDocs(
//     collection(db, "environment", "testing", "all_turfs_slot_booking", turfId)
//   );
//   return snapshot.docs.map((d) => d.id);
// };

// export const getSportsForDate = async (turfId: string, date: string) => {
//   const snapshot = await getDocs(
//     collection(
//       db,
//       "environment",
//       "testing",
//       "all_turfs_slot_booking",
//       turfId,
//       date
//     )
//   );
//   return snapshot.docs.map((d) => d.id);
// };

// export const getCourtsForSport = async (
//   turfId: string,
//   date: string,
//   sport: string
// ) => {
//   const snapshot = await getDoc(
//     doc(
//       db,
//       "environment",
//       "testing",
//       "all_turfs_slot_booking",
//       turfId,
//       date,
//       sport
//     )
//   );
//   return snapshot.exists() ? snapshot.data()?.courts || [] : [];
// };

// export const getBookedSlotTimes = async (
//   turfId: string,
//   date: string,
//   sport: string,
//   court: string
// ) => {
//   const snapshot = await getDocs(
//     collection(
//       db,
//       "environment",
//       "testing",
//       "all_turfs_slot_booking",
//       turfId,
//       date,
//       sport,
//       court
//     )
//   );
//   return snapshot.docs.map((d) => d.id);
// };

// export const getSlotDetails = async (
//   turfId: string,
//   date: string,
//   sport: string,
//   court: string,
//   slotTime: string
// ) => {
//   const slotDoc = doc(
//     db,
//     "environment",
//     "testing",
//     "all_turfs_slot_booking",
//     turfId,
//     date,
//     sport,
//     court,
//     slotTime
//   );
//   const snapshot = await getDoc(slotDoc);
//   return snapshot.exists() ? snapshot.data() : null;
// };

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


// function format24ToAmPm(time24: string) {
//   const [hStr, mStr] = time24.split(":");
//   let h = parseInt(hStr, 10);
//   const m = parseInt(mStr, 10);

//   const ampm = h >= 12 ? "PM" : "AM";
//   if (h === 0) h = 12;
//   else if (h > 12) h -= 12;

//   return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
// }

const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return "00:00";
  
  // If already in 24-hour format, return as is
  if (!time12h.includes("AM") && !time12h.includes("PM")) {
    return time12h;
  }
  
  const clean = time12h.trim().toUpperCase().replace(/\s+/g, " ");
  const parts = clean.split(" ");
  
  let time = parts[0];
  let modifier = parts[1] || null;
  
  let [hours, minutes] = time.split(":").map(Number);
  
  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;
  
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Convert 24-hour time to 12-hour format
 */
const formatTo12Hour = (time: string): string => {
  if (!time) return "";

  const clean = time.trim().toUpperCase();

  // Already 12h format → return safely
  if (clean.includes("AM") || clean.includes("PM")) {
    return clean;
  }

  const parts = clean.split(":");
  if (parts.length < 2) return "";

  const hoursNum = Number(parts[0]);
  const minsNum = Number(parts[1]);

  if (isNaN(hoursNum) || isNaN(minsNum)) return "";

  const period = hoursNum >= 12 ? "PM" : "AM";
  const hours12 = hoursNum % 12 || 12;

  return `${hours12}:${minsNum.toString().padStart(2, "0")} ${period}`;
};


/**
 * Generate unique booking ID
 */
const generateBookingId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BYT_P_${timestamp}${random}`;
};

const formatFirestoreDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, "-");
};


export async function getAllBookedSlots(
  turfId: string,
  inputDate: string,           // from form: "2026-02-01"
  sport: string,
  court: string
): Promise<BookedSlot[]> {
  try {
    const bookingsRef = collection(db, "environments", "testing", "bookings");

    // Get all possible bookings for this turf + sport + court (we'll filter date client-side)
    const q = query(
      bookingsRef,
      where("turfId", "==", turfId),
      where("bookedSportsName", "==", sport.trim().toLowerCase()),
      where("court", "==", court)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No candidate bookings found for turf/sport/court");
      return [];
    }

    // Parse the input date once
    const targetDate = parseDate(inputDate);
    if (!targetDate) {
      console.warn("Invalid input date format:", inputDate);
      return [];
    }

    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const matchingBookings: BookedSlot[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const storedDateStr = data.date || data.selectedDate || "";

      const parsedStored = parseDate(storedDateStr);
      if (!parsedStored) {
        console.warn("Invalid stored date format:", storedDateStr, "in booking", doc.id);
        return;
      }

      // Compare only date parts
      if (
        parsedStored.getDate() === targetDay &&
        parsedStored.getMonth() === targetMonth &&
        parsedStored.getFullYear() === targetYear
      ) {
        matchingBookings.push({
          booking_id: doc.id,
          turf_id: data.turfId || turfId,
          turf_name: data.turfName || "",
          date: storedDateStr, // keep original string for display
          sport: data.bookedSportsName || sport,
          court: data.court || court,
          slot_start_time: data.slotStartTime || data.slot_start_time || "",
          slot_end_time: data.slotEndTime || data.slot_end_time || "",
          booking_username: data.bookingUsername || "",
          booking_user_mobile: data.bookingUserMobile || "",
          paid_amount: Number(data.paidAmount ?? data.paid_amount ?? 0),
          unpaid_amount: Number(data.unpaidAmount ?? data.unpaid_amount ?? 0),
          total_amount: Number(data.totalAmount ?? data.total_amount ?? 0),
          payment_status: data.paymentStatus ?? data.payment_status ?? "unknown",
          created_by: data.createdBy || "UNKNOWN",
        });
      }
    });

    console.log(`Found ${matchingBookings.length} bookings matching date ${inputDate}`);
    return matchingBookings;
  } catch (err) {
    console.error("Error fetching booked slots:", err);
    return [];
  }
}

export async function createBooking(bookingData: Omit<Booking, "bookingId">): Promise<string> {
  try {
    // Generate ID (you can keep your existing format or adjust)
    const bookingId = `BYT_P_${Date.now()}`;

    // Format the date to "DD-MMM-YYYY" (e.g., "02-Feb-2026")
    const formatDateToDisplay = (dateStr: string): string => {
      if (!dateStr) return "";

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // fallback if invalid

      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleString("en-GB", { month: "short" });
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    };

    // Create formatted date
    const formattedDate = formatDateToDisplay(bookingData.date || bookingData.selectedDate || "");

    // Prepare the data to save
    const dataToSave = {
      ...bookingData,
      bookingId,
      createdAt: new Date().toISOString(),
      // Ensure date is saved in desired format
      date: formattedDate,
      // Also store selectedDate in the same format (if your app uses it)
      selectedDate: formattedDate,
    };

    const bookingRef = doc(db, "environments", "testing", "bookings", bookingId);

    await setDoc(bookingRef, dataToSave);

    console.log(`✅ Booking created: ${bookingId} | Formatted date: ${formattedDate}`);
    return bookingId;
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    throw error;
  }
}

export interface UserBookingHistory {
  id: string;
  bookingId: string;
  turfId: string;
  turfName: string;
  turfLocation: string;
  selectedDate: string;
  slotStartTime: string;
  slotEndTime: string;
  displaySlots: string;
  slotList: string[];
  slotCount?: number;
  paymentStatus: string;
  paidAmount: number;
  unpaidAmount: number;
  totalAmount: number;
  paidBy: string;
  paymentTransactionId: string;
  bookingType: string;
  userName: string;
  userMobile: string;
  createdAt: Date | null;
}

export const getBookingsByUserMobile = async (
  userMobile: string
): Promise<UserBookingHistory[]> => {
  try {
    if (!userMobile) return [];

    const bookings: UserBookingHistory[] = [];

    // Ensure mobile format matches Firestore document ID
    const formattedMobile = userMobile.startsWith("+")
      ? userMobile
      : `+91${userMobile.replace(/\D/g, "").slice(-10)}`;

    console.log("Fetching bookings for:", formattedMobile);

    const bookingRef = collection(
      db,
      "environments",
      "testing",
      "users",
      formattedMobile, // ✅ dynamic document id
      "payment_coppys"
    );

    const snapshot = await getDocs(bookingRef);

    snapshot.forEach((doc) => {
      const d = doc.data();

      bookings.push({
        id: doc.id,
        bookingId: d.bookingId || doc.id,
        turfId: d.turfId || "",
        turfName: d.turfName || "",
        turfLocation: d.turfLocation || "",
        selectedDate: d.selectedDate || "",
        slotStartTime: d.slotStartTime || "",
        slotEndTime: d.slotEndTime || "",
        displaySlots: d.displaySlots || "",
        slotList: d.slotList || [],
        paymentStatus: d.paymentStatus || "UNKNOWN",
        paidAmount: Number(d.paidAmount ?? 0),
        unpaidAmount: Number(d.unpaidAmount ?? 0),
        totalAmount: Number(d.totalAmount ?? 0),
        paidBy: d.paidBy || "",
        paymentTransactionId: d.paymentTransactionId || "",
        bookingType: d.bookingType || "",
        userName: d.userName || "",
        userMobile: d.userMobile || formattedMobile,
          slotCount: Number(d.slotCount ?? d.numberOfSlots ?? d.slotList?.length ?? 0),
        createdAt: d.createdAt ? d.createdAt.toDate() : null,
      });
    });

    // Sort latest first
    bookings.sort(
      (a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );

    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
};



export interface SlotBooking {
  id: string;
  turf_id: string;
  date: string;
  booked_sports_name: string;
  court: string;
  slots?: string[];
  slot_start_time?: string;
  slot_end_time?: string;
  booking_username: string;
  booking_user_mobile: string;
  paid_amount: number;
  unpaid_amount: number;
  total_paid: number;
  total_unpaid: number;
  total_amount: number;
  payment_status: string;
  createdBy?: string;
  docIds?: string[];
  slotPaidAmounts?: number[];
  slotUnpaidAmounts?: number[];
  bookingId?: string; // ✅ Preserve original booking ID
}

export const getBookingsByTurfAndDate = async (
  turfId: string,
  date: string
): Promise<SlotBooking[]> => {
  try {
    console.log("🔍 Fetching bookings for:", { turfId, date });

    const bookingsRef = collection(db, "environments", "testing", "bookings");

    const q = query(
      bookingsRef,
      where("turfId", "==", turfId),
      where("date", "==", date)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("⚠️ No bookings found");
      return [];
    }

    const allBookings: SlotBooking[] = [];

    snapshot.forEach((doc) => {
      const d = doc.data();

      // ✅ Extract amounts EXACTLY as stored
      const paidAmount = Number(d.paidAmount ?? 0);
      const unpaidAmount = Number(d.unpaidAmount ?? d.balanceAmount ?? 0);
      const totalAmount = Number(d.totalAmount ?? 0);

      // ✅ Build slots array from allSlots
      const allSlots: string[] = d.allSlots || [];
      const formattedSlots = allSlots.map((slot: string) => formatTo12Hour(slot));

      allBookings.push({
        id: doc.id,
        turf_id: d.turfId || "",
        date: d.date || d.selectedDate || "",
        booked_sports_name: d.bookedSportsName || "",
        court: d.court || "",
        slots: formattedSlots,
        slot_start_time: d.slotStartTime ? formatTo12Hour(d.slotStartTime) : "",
        slot_end_time: d.slotEndTime ? formatTo12Hour(d.slotEndTime) : "",
        booking_username: d.bookingUsername || d.userName || "",
        booking_user_mobile: d.bookingUserMobile || d.userMobile || "",
        
        // ✅ Use EXACT values from Firestore
        paid_amount: paidAmount,
        unpaid_amount: unpaidAmount,
        total_paid: paidAmount,
        total_unpaid: unpaidAmount,
        total_amount: totalAmount,
        
        payment_status: (d.paymentStatus || "advance").toLowerCase(),
        createdBy: d.createdBy || "USER",
        
        // ✅ CRITICAL: Preserve the original bookingId
        bookingId: d.bookingId || doc.id,
      });
    });

    console.log(`✅ Total bookings fetched: ${allBookings.length}`);
    return allBookings;
  } catch (error) {
    console.error("❌ Error fetching turf bookings:", error);
    return [];
  }
};

export const groupBookings = (slots: any[]) => {
  const grouped: Record<string, any> = {};

  slots.forEach((s) => {
    // Normalize values
    const username = (s.booking_username || s.bookingUsername || "").trim();
    const mobile = (s.booking_user_mobile || s.bookingUserMobile || "").trim();
    const court = (s.court || "").trim();
    const sport = (s.booked_sports_name || s.bookedSportsName || "").trim();
    const date = (s.date || s.selectedDate || "").trim();

    // 🔑 KEY decides merging behavior
    const key = `${username}_${mobile}_${court}_${sport}_${date}`;

    const paid = Number(s.paid_amount ?? s.paidAmount ?? 0);
    const unpaid = Number(s.unpaid_amount ?? s.unpaidAmount ?? 0);

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        docIds: [],
        turf_id: s.turf_id || s.turfId,
        date,
        booked_sports_name: sport,
        court,
        booking_username: username,
        booking_user_mobile: mobile,
        slots: [],
        slot_start_time: "",
        slot_end_time: "",
        paid_amount: 0,
        unpaid_amount: 0,
        total_paid: 0,
        total_unpaid: 0,
        total_amount: 0,
        payment_status: "advance",
        createdBy: s.createdBy || "OWNER"
      };
    }

    // Keep doc ids for updates later
    grouped[key].docIds.push(s.id);

    // Add slot time
const start = formatTo12Hour(s.slot_start_time || s.slotStartTime || "");
const end = formatTo12Hour(s.slot_end_time || s.slotEndTime || "");

if (start && end) {
  grouped[key].slots.push(`${start} - ${end}`);
}

    // Add amounts
    grouped[key].total_paid += paid;
    grouped[key].total_unpaid += unpaid;
  });

  // Final calculations
  Object.values(grouped).forEach((g: any) => {
    g.total_amount = g.total_paid + g.total_unpaid;

    if (g.total_unpaid === 0 && g.total_paid > 0) {
      g.payment_status = "paid";
    } else if (g.total_paid === 0 && g.total_unpaid > 0) {
      g.payment_status = "unpaid";
    } else {
      g.payment_status = "advance";
    }
  });

  return Object.values(grouped);
};





export const markBookingFullyPaid = async (booking: any) => {
  try {
    const updates = booking.docIds.map((docId: string, index: number) => {
      const slotPaid = booking.slotPaidAmounts[index] || 0;
      const slotUnpaid = booking.slotUnpaidAmounts[index] || 0;

      const bookingRef = doc(
        db,
        "environments",
        "testing",
        "bookings",
        docId
      );

      return updateDoc(bookingRef, {
        paid_amount: slotPaid + slotUnpaid, // ✅ correct per slot
        unpaid_amount: 0,
        payment_status: "paid",
      });
    });

    await Promise.all(updates);
  } catch (error) {
    console.error("Error marking booking as fully paid:", error);
    throw error;
  }
};



export const buildWhatsAppBookingMessage = ({
  bookingUserName,
  turfName,
  turfMobile,
  sport,
  court,
  bookedOn,
  bookingDate,
  slots,
  totalAmount,
  paidAmount,
  remainingAmount
}: any) => {
  const status = remainingAmount > 0 ? "Partial Payment" : "Fully Paid";

  return `*Booking Confirmed!* 

 Dear ${bookingUserName}
 Sports Venue: ${turfName}
 Mobile: ${turfMobile}
 Sport: ${sport}
 Court: ${court}
 Booked On: ${bookedOn}
 Booking Date: ${bookingDate}
 Reserved Slots: ${slots.join(", ")}

 *Total Amount:* ₹${totalAmount}
 *Paid Amount:* ₹${paidAmount}
 *Remaining:* ₹${remainingAmount}
*Status:* ${status}

Thank you for booking with us! 
Book Your Turf

For more information:
Download our app:
https://play.google.com/store/apps/details?id=com.bookyourturf.app`;
};

export const shareBookingViaWhatsApp = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, ""); // remove + and spaces
  const encodedMessage = encodeURIComponent(message);

  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, "_blank");
};

export const buildBookingEmailMessage = (data: {
  bookingUserName: string;
  turfName: string;
  turfMobile: string;
  sport: string;
  court: string;
  bookedOn: string;
  bookingDate: string;
  slots: string[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}) => {
  return `
Booking Confirmed

Dear ${data.bookingUserName},

Here are the booking details:

Sports Venue: ${data.turfName}
Mobile: ${data.turfMobile}
Sports: ${data.sport}
Court: ${data.court}
Booked On: ${data.bookedOn}
Booking Date: ${data.bookingDate}
Reserved Slots: ${data.slots.join(", ")}

Total Amount: ₹${data.totalAmount}
Paid Amount: ₹${data.paidAmount}
Remaining Amount: ₹${data.remainingAmount}
Status: ${data.remainingAmount > 0 ? "Partial Payment" : "Fully Paid"}

Thank you for booking with us!

Book Your Turf App:
https://play.google.com/store/apps/details?id=com.bookyourturf.app
`;
};


export const sendBookingEmail = async (
  toEmail: string,
  subject: string,
  message: string
) => {
  try {
     console.log("📧 Sending booking email...");
    console.log("➡️ To:", toEmail);
    console.log("📝 Subject:", subject);
 const res = await fetch("https://your-server.com/send-booking-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toEmail,
        subject,
        message,
      }),
    });
    const data = await res.json();

    console.log("✅ Email API response:", data);
    console.log("📧 Booking email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};



export const bookSlot = async (bookingData: {
  turfId: string;
  turfName?: string;
  date: string;
  sport: string;
  court: string;
  slot?: any;        // Single slot (old format)
  slots?: any[];     // Multiple slots (new format)
  bookingName: string;
  bookingMobile: string;
  price: number;
  paidAmount: number;
  unpaidAmount: number;
  ownerId: string;
}) => {
  try {
    const {
      turfId,
      turfName,
      date,
      sport,
      court,
      slot,
      slots,
      bookingName,
      bookingMobile,
      price,
      paidAmount,
      unpaidAmount,
      ownerId
    } = bookingData;

    // ✅ Handle both single and multiple slot formats
const bookingSlots = Array.isArray(slots)
  ? slots.filter(Boolean) // removes undefined/null
  : slot
  ? [slot]
  : [];
      
    if (bookingSlots.length === 0) {
      throw new Error("No slots provided for booking");
    }

    // ✅ Generate unique booking ID for this transaction
    const bookingId = generateBookingId();
    
    // ✅ Extract slot times and convert to 24-hour format
    const allSlots24 = bookingSlots.map(s => {
      // Extract start time from label "6:00 PM - 7:00 PM"
      const startTime = s.startTime || s.label.split(" - ")[0];
      return convertTo24Hour(startTime.trim());
    });
    
    // ✅ Get first and last slot for time range
    const firstSlot = bookingSlots[0];
    const lastSlot = bookingSlots[bookingSlots.length - 1];
    
    const slotStartTime24 = convertTo24Hour(firstSlot.startTime || firstSlot.label.split(" - ")[0]);
    const slotEndTime24 = convertTo24Hour(lastSlot.endTime || lastSlot.label.split(" - ")[1]);
    
    // ✅ Format all slots as 12-hour strings for display
    const allSlotsString = bookingSlots.map(s => s.label).join(", ");
    
    // ✅ Format date to Firestore format
    const formattedDate = formatFirestoreDate(date);
    
    // ✅ Calculate payment status
    let paymentStatus = "ADVANCE";
    if (unpaidAmount === 0 && paidAmount > 0) {
      paymentStatus = "PAID";
    } else if (paidAmount === 0) {
      paymentStatus = "UNPAID";
    }

    // ✅ Create booking document
    const bookingsRef = collection(db, "environments", "testing", "bookings");
    
    const bookingDoc = {
      // IDs
      bookingId: bookingId,
      turfId: turfId,
      ownerId: ownerId,
      userId: `owner_${ownerId}`,
      
      // User Info
      bookingUsername: bookingName,
      bookingUserMobile: bookingMobile,
      userName: bookingName,
      userMobile: bookingMobile,
      
      // Turf Info
      turfName: turfName || "",
      turfLocation: "",
      
      // Booking Details
      bookedSportsName: sport,
      court: court,
      date: formattedDate,
      selectedDate: formattedDate,
      
      // ✅ Slots - IMPORTANT!
      allSlots: allSlots24,              // ["19:00", "20:00", "21:00"]
      allSlotsString: allSlotsString,    // "7:00 PM - 8:00 PM, 8:00 PM - 9:00 PM"
      numberOfSlots: bookingSlots.length,
      slotStartTime: slotStartTime24,    // "19:00"
      slotEndTime: slotEndTime24,        // "22:00"
      
      // Payment
      totalAmount: price,
      paidAmount: paidAmount,
      unpaidAmount: unpaidAmount,
      balanceAmount: unpaidAmount,
      paymentStatus: paymentStatus,
      
      // Payment Details
      paymentMethod: "Offline payment to owner",
      paymentId: `OFFLINE_${Date.now()}`,
      paymentTransactionId: `OFFLINE_${Date.now()}`,
      paymentInitiatedTime: new Date().toISOString(),
      paidBy: "Offline payment to owner",
      
      // Other Fields
      bookingType: "OFFLINE",
      createdBy: "OWNER",
      turfClosed: false,
      dayPrice: 0,
      nightPrice: 0,
      
      // Timestamps
      createdAt: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    console.log("📝 Creating booking document:", bookingDoc);
    
    const docRef = await addDoc(bookingsRef, bookingDoc);
    
    console.log(`✅ Booking created successfully: ${docRef.id}`);
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   Slots: ${allSlotsString}`);
    console.log(`   Total: ₹${price}, Paid: ₹${paidAmount}, Balance: ₹${unpaidAmount}`);
    
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    throw error;
  }
};


// export async function getAllDatesAndSlots(turfId: string) {
//   try {
//     const turfRef = collection(
//       db,
//       "environment",
//       "testing",
//       "all_turfs_slot_booking",
//       turfId
//     );

//     const dateSnapshots = await getDocs(turfRef);

//     if (dateSnapshots.empty) {
//       console.warn("⚠️ No dates found for turf:", turfId);
//       return [];
//     }

//     const results: any[] = [];

//     for (const dateDoc of dateSnapshots.docs) {
//       const date = dateDoc.id;
//       const sportsSnapshot = await getDocs(collection(turfRef, date));

//       const sportsData = [];

//       for (const sportDoc of sportsSnapshot.docs) {
//         const sport = sportDoc.id;
//         const courtsSnapshot = await getDocs(collection(turfRef, date, sport));

//         const courtData = [];

//         for (const courtDoc of courtsSnapshot.docs) {
//           const court = courtDoc.id;
//           const slotsSnapshot = await getDocs(
//             collection(turfRef, date, sport, court)
//           );
//           const slots = slotsSnapshot.docs.map((doc) => ({
//             time: doc.id,
//             ...doc.data(),
//           }));
//           courtData.push({ court, slots });
//         }

//         sportsData.push({ sport, courts: courtData });
//       }

//       results.push({ date, sports: sportsData });
//     }

//     console.log("📅 All booked slots for turf:", results);
//     return results;
//   } catch (err) {
//     console.error("❌ Error fetching all booked slots:", err);
//     return [];
//   }
// }

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
// export async function getSportsAndCourts(turfId: string, date: string) {
//   try {
//     // console.log("🔎 Fetching sports & courts for Turf:", turfId, "Date:", date);

//     const dateCollectionRef = collection(
//       db,
//       "environment",
//       "testing",
//       "all_turfs_slot_booking",
//       turfId,
//       date
//     );

//     const sportsSnapshot = await getDocs(dateCollectionRef);

//     if (sportsSnapshot.empty) {
//       // console.warn("⚠️ No sports found for this date!");
//       return [];
//     }

//     const result: any[] = [];

//     for (const sportDoc of sportsSnapshot.docs) {
//       const data = sportDoc.data();
//       const sportName = sportDoc.id;
//       const courts = data.courts || [];

//       result.push({ sport: sportName, courts });
//     }

//     console.log("✅ Sports & courts fetched:", result);
//     return result;
//   } catch (err) {
//     console.error("❌ Error fetching sports & courts:", err);
//     return [];
//   }
// }

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

export const cancelBooking = async (bookingId: string) => {
  const res = await fetch(
    "https://asia-south1-play-arena-e83d8.cloudfunctions.net/cancelWebBooking",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Cancel failed");
  }

  return true;
};


export interface Booking {
  id: string;
  booking_id?: string;
  date: string;                   // "01-Feb-2026"
  turf_name?: string;
  booked_sports_name?: string;
  court?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  total_amount?: number;
  paid_amount?: number;
  unpaid_amount?: number;
  payment_status?: string;
  paymentStatus?: string;         // some bookings use camelCase
  user_id: string;
  // add other fields you care about
  [key: string]: any;             // allow extra fields
}

export const getCurrentUserId = (): string | null => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    console.log("[getCurrentUserId] Firebase Auth UID:", currentUser.uid);
    return currentUser.uid;
  }

  // Fallback to localStorage (for legacy or special cases)
  const stored = localStorage.getItem("user_id");
  if (stored) {
    console.log("[getCurrentUserId] Fallback to localStorage:", stored);
    return stored;
  }

  console.warn("[getCurrentUserId] No user ID found");
  return null;
};

// Fetch all bookings for the current user
export const getUserBookings = async (): Promise<Booking[]> => {
  const bookingsRef = collection(db, "environments", "testing", "bookings");

  // No where() clause at all — get everything
  const q = query(bookingsRef);

  console.log("[ADMIN] Fetching ALL bookings (no filters)");

  try {
    const querySnapshot = await getDocs(q);
    
    console.log("[ADMIN] Total raw documents fetched:", querySnapshot.size);
    console.log("[ADMIN] All booking IDs:", querySnapshot.docs.map(d => d.id));

    const bookings: Booking[] = querySnapshot.docs
      // Optional: filter only user bookings (BYT_U_ prefix) client-side
      .filter(doc => doc.id.startsWith("BYT_U_"))
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Booking));

    console.log("[ADMIN] Filtered BYT_U_ count:", bookings.length);

    // Sort newest first
    bookings.sort((a, b) => {
      const parseDate = (dateStr: string = ""): Date => {
        if (!dateStr.trim()) return new Date(0);
        try {
          dateStr = dateStr.trim();

          if (dateStr.match(/^\d{1,2}-[A-Za-z]{3}-\d{4}$/i)) {
            const [day, monthStr, year] = dateStr.split("-");
            const monthMap: Record<string, number> = {
              jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
              jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            const month = monthMap[monthStr.toLowerCase()];
            if (month === undefined) return new Date(0);
            return new Date(Number(year), month, Number(day));
          }
          else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
            const [day, month, year] = dateStr.split("-").map(Number);
            return new Date(year, month - 1, day);
          }
          else if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            const [year, month, day] = dateStr.split("-").map(Number);
            return new Date(year, month - 1, day);
          }

          const native = new Date(dateStr);
          if (!isNaN(native.getTime())) return native;
          return new Date(0);
        } catch {
          return new Date(0);
        }
      };

      const dateA = parseDate(a.date || a.selectedDate);
      const dateB = parseDate(b.date || b.selectedDate);
      return dateB.getTime() - dateA.getTime();
    });

    return bookings;
  } catch (err) {
    console.error("[ADMIN] Fetch error:", err);
    throw err;
  }
};

/**
 * Cancel a booking and FREE the slot for others to book
 * Works for both user dashboard and admin panel
 */

export const getChannelPartnerBookings = async (): Promise<Booking[]> => {
  const bookingsRef = collection(db, "environments", "testing", "bookings");

  // Fetch everything — no where() clause
  const q = query(bookingsRef);

  console.log("[getChannelPartnerBookings] Starting unrestricted fetch for BYT_P_...");

  try {
    const querySnapshot = await getDocs(q);

    console.log("[getChannelPartnerBookings] Raw fetch count:", querySnapshot.size);
    console.log("[getChannelPartnerBookings] All fetched IDs:", querySnapshot.docs.map(d => d.id));

    // Filter client-side for channel partner bookings only
    const channelBookings = querySnapshot.docs
      .filter(doc => doc.id.startsWith("BYT_P_"))
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Normalize fields (same as before)
          date: data.date || data.selectedDate || data.selecteddated || "",
          slot_start_time: data.slot_start_time || data.slotStartTime || data.slotStart || "",
          slot_end_time: data.slot_end_time || data.slotEndTime || data.slotEnd || "",
          turf_name: data.turf_name || data.turfName || "Unknown Turf",
          booked_sports_name: data.booked_sports_name || data.bookedSportsName || data.sport || "—",
          total_amount: data.total_amount ?? data.totalAmount ?? 0,
          paid_amount: data.paid_amount ?? data.paidAmount ?? 0,
          payment_status: data.payment_status || data.paymentStatus || data.paymentstatus || "Unknown",
        } as Booking;
      });

    console.log("[getChannelPartnerBookings] Filtered BYT_P_ count:", channelBookings.length);

    // Sort newest first
    channelBookings.sort((a, b) => {
      const parseDate = (dateStr: string = ""): Date => {
        if (!dateStr.trim()) return new Date(0);
        try {
          dateStr = dateStr.trim();

          if (dateStr.match(/^\d{1,2}-[A-Za-z]{3}-\d{4}$/i)) {
            const [day, monthStr, year] = dateStr.split("-");
            const monthMap: Record<string, number> = {
              jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
              jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            const month = monthMap[monthStr.toLowerCase()];
            if (month === undefined) return new Date(0);
            return new Date(Number(year), month, Number(day));
          }
          else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
            const [day, month, year] = dateStr.split("-").map(Number);
            return new Date(year, month - 1, day);
          }
          else if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            const [year, month, day] = dateStr.split("-").map(Number);
            return new Date(year, month - 1, day);
          }

          const native = new Date(dateStr);
          if (!isNaN(native.getTime())) return native;
          return new Date(0);
        } catch {
          return new Date(0);
        }
      };

      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return channelBookings;
  } catch (err) {
    console.error("[getChannelPartnerBookings] Fetch error:", err);
    throw err;
  }
};

// Add these helper functions to emit and listen for slot updates
type SlotUpdateListener = () => void;
const slotUpdateListeners: SlotUpdateListener[] = [];

export const notifySlotUpdate = () => {
  console.log("🔔 Notifying all slot listeners to refresh");
  slotUpdateListeners.forEach(listener => listener());
};

export const onSlotUpdate = (listener: SlotUpdateListener) => {
  slotUpdateListeners.push(listener);
  return () => {
    const index = slotUpdateListeners.indexOf(listener);
    if (index > -1) slotUpdateListeners.splice(index, 1);
  };
};

export const canCancelBooking = (booking: any): boolean => {
  if (booking.payment_status === "CANCELLED" || booking.paymentStatus === "CANCELLED") {
    return false;
  }

  const dateStr = booking.date || booking.selectedDate || booking.selecteddated || "";
  if (!dateStr) return false;

  const timeStr =
    booking.slot_start_time ||
    booking.slotStartTime ||
    booking.slotStart ||
    "";

  try {
    // Parse date (handles "01-Feb-2026", "2026-02-01", "30-01-2026")
    let bookingDate: Date;
    if (dateStr.match(/^\d{1,2}-[A-Za-z]{3}-\d{4}$/)) {
      const [day, monthStr, year] = dateStr.split("-");
      const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = monthMap[monthStr as keyof typeof monthMap];
      if (month === undefined) return false;
      bookingDate = new Date(Number(year), month, Number(day));
    } else {
      bookingDate = new Date(dateStr);
    }

    if (isNaN(bookingDate.getTime())) return false;

    // Add time if available
    if (timeStr) {
      const [h, m] = timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        bookingDate.setHours(h, m, 0, 0);
      }
    }

    // Can cancel if current time is before booking start
    return new Date() < bookingDate;
  } catch (err) {
    console.warn("canCancelBooking parse error:", err);
    return false;
  }
};
