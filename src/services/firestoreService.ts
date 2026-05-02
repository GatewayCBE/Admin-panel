import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
   Timestamp,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot 
} from "firebase/firestore";

import {
  getFunctions,
  httpsCallable,
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
    original_password: string;
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
    original_password: data.original_password,
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
      digits,                 // 892****180
      Number(digits),         // 892****180 as number
      "91" + digits,          // 91892****180
      "+91" + digits,         // +91892****180
      "0" + digits            // 0892****180
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

export const getUsers = async () => {
  try {
    const usersRef = collection(db, "environment", "testing", "users");
    const userDocs = await getDocs(usersRef);

    return userDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
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

// export const getOwnerById = async (ownerId: string) => {
//   const ownerRef = doc(db, "environment", "testing", "owners", ownerId);
//   const snapshot = await getDoc(ownerRef);
//   return snapshot.exists() ? snapshot.data() : null;
// };

export const getOwnerById = async (
  ownerId: string
): Promise<Owner | null> => {
  if (!ownerId) return null;

  const ownersRef = collection(db, "environment", "testing", "owners");
  const q = query(ownersRef, where("owner_id", "==", ownerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  return {
    doc_id: docSnap.id, // ✅ phone number
    owner_id: data.owner_id,
    owner_name: data.owner_name,
    owner_mobile_number: data.owner_mobile_number,
    owner_email: data.owner_email,
    owner_profile_image: data.owner_profile_image,
  };
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
export const safeDeleteTurf = async (
  turfId: string,
  options?: {
    userId?: string;
    role?: string;
    reason?: "CHANNEL_PARTNER_DELETE" | "ADMIN_DELETE" | "AUTO_DELETE";
  }
) => {
  try {
    console.log("🧨 DELETE TRIGGERED >>>", {
      turfId,
      userId: options?.userId || "UNKNOWN",
      role: options?.role || "UNKNOWN",
      reason: options?.reason || "UNKNOWN",
      url: window.location.href,
      time: new Date().toISOString(),
    });

    const turfRef = doc(db, "environment", "testing", "turfs", turfId);
    const turfSnap = await getDoc(turfRef);

    if (!turfSnap.exists()) {
      console.warn("⚠️ Turf not found:", turfId);
      return;
    }

    const turfData = turfSnap.data();

    const deleteReason = options?.reason ?? "UNKNOWN";

    // ✅ Store backup
    await setDoc(
      doc(
        collection(
          db,
          "environment",
          "testing",
          "deleted_turfs",
          turfId,
          "history"
        )
      ),
      {
        originalTurfId: turfId,
        turfData,
        deletedAt: serverTimestamp(),
        deletedAtReadable: new Date().toISOString(),
        deletedBy: options?.role || "UNKNOWN",
        deletedById: options?.userId || "UNKNOWN",
        reason: deleteReason,
        triggeredFrom: window.location.href,
      }
    );

    // 🚫 TEMP: Block auto deletion
    if (options?.reason === "AUTO_DELETE") {
      console.warn("🚫 AUTO DELETE BLOCKED:", turfId);
      return;
    }

    // ✅ Delete original
    await deleteDoc(turfRef);

    console.log("✅ Turf deleted & archived:", turfId);

  } catch (error) {
    console.error("❌ Error in safeDeleteTurf:", error);
  }
};

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

export const subscribeToCounts = (
  env: string,
  callbacks: {
    onUsers?: (count: number) => void;
    onOwners?: (count: number) => void;
    onTurfs?: (count: number) => void;
  }
) => {
  console.log("📡 Subscribing to counts...");

  const unsubUsers = onSnapshot(
    collection(db, "environment", "testing", "users"),
    (snapshot) => {
      console.log("👤 Users:", snapshot.size);
      callbacks.onUsers?.(snapshot.size);
    }
  );

  const unsubOwners = onSnapshot(
    collection(db, "environment", "testing", "owners"),
    (snapshot) => {
      console.log("🤝 Owners:", snapshot.size);
      callbacks.onOwners?.(snapshot.size);
    }
  );

  const unsubTurfs = onSnapshot(
    collection(db, "environment", "testing", "turfs"),
    (snapshot) => {
      console.log("🏟️ Turfs:", snapshot.size);
      callbacks.onTurfs?.(snapshot.size);
    }
  );

  // ✅ Return cleanup
  return () => {
    unsubUsers();
    unsubOwners();
    unsubTurfs();
  };
};

export const to12HourFormate = (time24: string) => {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

export const normalizeSportKeyFormate = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("football")) return "football";
  if (n.includes("cricket")) return "boxcricket";
  if (n.includes("badminton")) return "badminton";
  if (n.includes("pickle")) return "pickleball";
  return n.replace(/\s+/g, "");
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
      opening_time: to12Hour(s.openingTime),
      closing_time: to12Hour(s.closingTime),

      day_start_time: to12Hour(s.daySlotStart),
      day_end_time: to12Hour(s.daySlotEnd),

      night_start_time: to12Hour(s.nightSlotStart),
      night_end_time: to12Hour(s.nightSlotEnd),
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


// 🔁 Convert 24h → 12h format (required for SlotDetails page)
const to12Hour = (time24: string) => {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

// 🔥 Build MOBILE-STYLE sport maps (CRITICAL FIX)
const normalizeSportKey = (name: string) => {
  const n = name.toLowerCase();

  if (n.includes("football")) return "football";
  if (n.includes("cricket")) return "boxcricket";
  if (n.includes("badminton")) return "badminton";
  if (n.includes("pickle")) return "pickleball";

  return n.replace(/\s+/g, "");
};

// 🔥 Build MOBILE-STYLE sport maps
export const buildSportMaps = (sports: any[]) => {
  const prices: any = {};
  const timings: any = {};
  const persons: any = {};
  const sportNames: string[] = [];

  sports.forEach((sport) => {
    const key = normalizeSportKey(sport.name); // ✅ FIXED KEY
    sportNames.push(key);

    // PRICE MAP
    prices[key] = {};
    Object.keys(sport.dayPrices).forEach((day) => {
      prices[key][day] = {
        day: Number(sport.dayPrices[day]),
        night: Number(sport.nightPrices[day]),
      };
    });

    // TIMINGS MAP
    timings[key] = {
      opening_time: to12Hour(sport.openingTime),
      closing_time: to12Hour(sport.closingTime),
      day_start_time: to12Hour(sport.daySlotStart),
      day_end_time: to12Hour(sport.daySlotEnd),
      night_start_time: to12Hour(sport.nightSlotStart),
      night_end_time: to12Hour(sport.nightSlotEnd),
      court_count: Number(sport.courtCount) || 1,
    };

    persons[key] = Number(sport.maxPersons);
  });

  return { prices, timings, persons, sportNames };
};

// ✅ MAIN FUNCTION
export const createTurf = async ({
  formData,
  sports,
  ownerId,
  ownerName,
  imageUrls,
  addedSource,
}: any) => {
  const turfId = generateTurfId(ownerName);

  const { prices, timings, persons, sportNames } = buildSportMaps(sports);

  const turfDoc = {
    turf_id: turfId,
    turf_name: formData.turfName,
    turf_location: formData.turfAddress,
    turf_description: formData.turfDescription,
    turf_length: `${formData.turfLength} ${formData.dimensionUnit}`,
    turf_breadth: `${formData.turfBreadth} ${formData.dimensionUnit}`,
    turf_height: `${formData.turfHeight} ${formData.dimensionUnit}`,
    amenities: formData.facilities,
    badminton_court_type: formData.badmintonCourtType || null,
    owner_id: ownerId,
    turf_images: imageUrls,

    // ✅ MOBILE COMPATIBLE STRUCTURE
    available_sports_list: sportNames,
    sport_specific_price: prices,
    sport_specific_timing: timings,
    sports_specific_person_count: persons,

    turf_active_status: false,
    turf_opened: true,

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
      // 🚫 Ignore cancelled bookings
  if (
    data.paymentStatus === "CANCELLED" ||
    data.bookingStatus === "CANCELLED"
  ) {
    console.log("Skipping cancelled booking:", doc.id);
    return;
  }
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
    const formattedDate = formatDateToDisplay(bookingData.date || bookingData.date || "");

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

    console.log(` Booking created: ${bookingId} | Formatted date: ${formattedDate}`);
    return bookingId;
  } catch (error) {
    console.error(" Error creating booking:", error);
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
      formattedMobile, //  dynamic document id
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
  turfId: string;
  date: string;
  bookedSportsName: string;
  court: string;
  slots?: string[];
  slotStartTime?: string;
  slotEndTime?: string;
  bookingUsername: string;
  bookingUserMobile: string;
  paidAmount: number;
  unpaidAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  totalAmount: number;
  paymentStatus: string;
  createdBy?: string;
  docIds?: string[];
  slotPaidAmounts?: number[];
  slotUnpaidAmounts?: number[];
  bookingId?: string; //  Preserve original booking ID
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
      const bookedSportsName =
  d.bookedSportsName ||
  d.sportsName ||
  d.sportName ||
  d.availableSport ||
  "Unknown Sport";
      //  Extract amounts EXACTLY as stored
      const paidAmount = Number(d.paidAmount ?? 0);
      const unpaidAmount = Number(d.unpaidAmount ?? d.balanceAmount ?? 0);
      const totalAmount = Number(d.totalAmount ?? 0);

      //  Build slots array from allSlots
      const allSlots: string[] = d.allSlots || [];
      const formattedSlots = allSlots.map((slot: string) => formatTo12Hour(slot));

      allBookings.push({
        id: doc.id,
        turfId: d.turfId || "",
        date: d.date || d.selectedDate || "",
        bookedSportsName,
        court: d.court || "",
        slots: formattedSlots,
        slotStartTime: d.slotStartTime ? formatTo12Hour(d.slotStartTime) : "",
        slotEndTime: d.slotEndTime ? formatTo12Hour(d.slotEndTime) : "",
        bookingUsername: d.bookingUsername || d.userName || "",
        bookingUserMobile: d.bookingUserMobile || d.userMobile || "",
        
        //  Use EXACT values from Firestore
        paidAmount: paidAmount,
        unpaidAmount: unpaidAmount,
        totalPaid: paidAmount,
        totalUnpaid: unpaidAmount,
        totalAmount: totalAmount,
        
        paymentStatus: (d.paymentStatus || "advance").toLowerCase(),
        createdBy: d.createdBy || "USER",
        
        //  CRITICAL: Preserve the original bookingId
        bookingId: d.bookingId || doc.id,
      });
    });

    console.log(` Total bookings fetched: ${allBookings.length}`);
    return allBookings;
  } catch (error) {
    console.error(" Error fetching turf bookings:", error);
    return [];
  }
};

export const groupBookings = (slots: any[]) => {
  // ✅ STEP 1: FILTER OUT CANCELLED BOOKINGS
  const activeSlots = slots.filter((s) => {
    const status = (s.paymentStatus || s.payment_status || "").toUpperCase();
    return status !== "CANCELLED" && !s.cancelledAt;
  });

  const grouped: Record<string, any> = {};

  // ✅ STEP 2: USE activeSlots INSTEAD OF slots
  activeSlots.forEach((s) => {
    const bookingUsername = (s.bookingUsername || s.booking_username || "").trim();
    const bookingUserMobile = (s.bookingUserMobile || s.booking_user_mobile || "").trim();
    const court = (s.court || "").trim();
    const bookedSportsName = (s.bookedSportsName || s.booked_sports_name || "").trim();
    const date = (s.date || s.selectedDate || "").trim();

    const key = `${bookingUsername}_${bookingUserMobile}_${court}_${bookedSportsName}_${date}`;

    const paid = Number(s.paidAmount ?? s.paid_amount ?? 0);
    const unpaid = Number(s.unpaidAmount ?? s.unpaid_amount ?? 0);

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        bookingId: s.bookingId || s.booking_id || "",
        docIds: [],
        turfId: s.turfId || s.turf_id || "",
        date,
        bookedSportsName,
        court,
        bookingUsername,
        bookingUserMobile,
        slots: [],
        totalPaid: 0,
        totalUnpaid: 0,
        totalAmount: 0,
        paymentStatus: "advance",
        createdBy: s.createdBy || "OWNER",
      };
    }
    if (!grouped[key].bookingId) {
  grouped[key].bookingId = s.bookingId || s.booking_id || "";
}

    grouped[key].docIds.push(s.id);

    const start = formatTo12Hour(s.slotStartTime || s.slot_start_time || "");
    const end = formatTo12Hour(s.slotEndTime || s.slot_end_time || "");

    if (start && end) {
      grouped[key].slots.push(`${start} - ${end}`);
    }

    grouped[key].totalPaid += paid;
    grouped[key].totalUnpaid += unpaid;
  });

  // ✅ STEP 3: CALCULATE FINAL STATUS
  Object.values(grouped).forEach((g: any) => {
    g.totalAmount = g.totalPaid + g.totalUnpaid;

    if (g.totalUnpaid === 0 && g.totalPaid > 0) {
      g.paymentStatus = "paid";
    } else if (g.totalPaid === 0 && g.totalUnpaid > 0) {
      g.paymentStatus = "unpaid";
    } else {
      g.paymentStatus = "advance";
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
        paid_amount: slotPaid + slotUnpaid, //  correct per slot
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



export const sendBookingSMS = async (mobile: string, message: string) => {
  try {
    console.log("📲 Sending SMS to:", mobile);

    const res = await fetch(
      "https://sendbookingsms-xxxxx.cloudfunctions.net/sendBookingSMS",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, message }),
      }
    );

    const data = await res.json();
    console.log("✅ SMS API response:", data);
  } catch (error) {
    console.error("❌ SMS sending failed:", error);
  }
};  


// ===== MESSAGE BUILDING FUNCTIONS =====

export const buildSMSBookingMessage = ({
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
  // ✅ FIX: Ensure all amounts are numbers and provide defaults
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  const remaining = Number(remainingAmount) || 0;
  
  const status = remaining > 0 ? "Partial Payment ⚠️" : "Fully Paid ✅";

  return `Booking Confirmed!

Dear ${bookingUserName}

Sports Venue: ${turfName}
Mobile: ${turfMobile || "N/A"}
Sports: ${sport}
Court: ${court}

Booked On: ${bookedOn}
Booking Date: ${bookingDate}

Reserved Slots:
${Array.isArray(slots) ? slots.map((s: string) => `• ${s}`).join("\n") : `• ${slots}`}

Total Amount: ₹${total.toFixed(2)}
Paid Amount: ₹${paid.toFixed(2)}
Remaining: ₹${remaining.toFixed(2)}
Status: ${status}

Thank you for booking with us!
Book Your Turf

Download our app:
https://play.google.com/store/apps/details?id=com.bookyourturf.app`;
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
  // ✅ FIX: Ensure all amounts are numbers
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  const remaining = Number(remainingAmount) || 0;
  
  const status = remaining > 0 ? "Partial Payment" : "Fully Paid";
  const slotsList = Array.isArray(slots) ? slots.join(", ") : slots;

  return `*Booking Confirmed!* 

Dear ${bookingUserName}
Sports Venue: ${turfName}
Mobile: ${turfMobile || "N/A"}
Sport: ${sport}
Court: ${court}
Booked On: ${bookedOn}
Booking Date: ${bookingDate}
Reserved Slots: ${slotsList}

*Total Amount:* ₹${total.toFixed(2)}
*Paid Amount:* ₹${paid.toFixed(2)}
*Remaining:* ₹${remaining.toFixed(2)}
*Status:* ${status}

Thank you for booking with us! 
Book Your Turf

For more information:
Download our app:
https://play.google.com/store/apps/details?id=com.bookyourturf.app`;
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
  // ✅ FIX: Ensure all amounts are numbers
  const total = Number(data.totalAmount) || 0;
  const paid = Number(data.paidAmount) || 0;
  const remaining = Number(data.remainingAmount) || 0;
  
  const slotsList = Array.isArray(data.slots) ? data.slots.join(", ") : data.slots;

  return `
Booking Confirmed

Dear ${data.bookingUserName},

Here are the booking details:

Sports Venue: ${data.turfName}
Mobile: ${data.turfMobile || "N/A"}
Sports: ${data.sport}
Court: ${data.court}
Booked On: ${data.bookedOn}
Booking Date: ${data.bookingDate}
Reserved Slots: ${slotsList}

Total Amount: ₹${total.toFixed(2)}
Paid Amount: ₹${paid.toFixed(2)}
Remaining Amount: ₹${remaining.toFixed(2)}
Status: ${remaining > 0 ? "Partial Payment" : "Fully Paid"}

Thank you for booking with us!

Book Your Turf App:
https://play.google.com/store/apps/details?id=com.bookyourturf.app
`;
};

export const shareBookingViaWhatsApp = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, "_blank");
};

// ===== SEND NOTIFICATIONS =====

export const sendBookingNotifications = async ({
  userPhone,
  userEmail,
  partnerPhone,
  partnerEmail,
  smsMessage,
  emailMessage,
}: {
  userPhone?: string | null;
  userEmail?: string | null;
  partnerPhone?: string | null;
  partnerEmail?: string | null;
  smsMessage?: string | null;
  emailMessage?: string | null;
}) => {
  try {
    console.log("📤 Sending booking notifications", {
      userPhone,
      userEmail,
      partnerPhone,
      partnerEmail,
    });

    const notificationData = {
      userPhone: userPhone ?? null,
      userEmail: userEmail ?? null,
      partnerPhone: partnerPhone ?? null,
      partnerEmail: partnerEmail ?? null,
      smsMessage: smsMessage ?? null,
      emailMessage: emailMessage ?? null,
    };

    const response = await fetch(
      "https://asia-south1-play-arena-e83d8.cloudfunctions.net/sendBookingNotifications",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: notificationData }),
      }
    );

    if (!response.ok) {
      throw new Error("Notification API failed");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error sending notifications:", error);
    return { success: false, error };
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
      ownerId,
    } = bookingData;

    let resolvedTurfName = "Unknown Turf";

    const turfRef = doc(db, "environment", "testing", "turfs", turfId);
    const turfSnap = await getDoc(turfRef);

    if (turfSnap.exists()) {
      const turfData = turfSnap.data();
      resolvedTurfName =
        turfData.turf_name ||
        turfData.turfName ||
        turfData.name ||
        "Unknown Turf";
    }

    // ✅ Normalize slots (single / multiple)
    const bookingSlots = Array.isArray(slots)
      ? slots.filter(Boolean)
      : slot
      ? [slot]
      : [];

    if (bookingSlots.length === 0) {
      throw new Error("No slots provided for booking");
    }

    // ✅ Generate YOUR booking ID (BYT_P_...)
    const bookingId = generateBookingId();

    // ✅ Convert slots to 24-hour format
    const allSlots24 = bookingSlots.map((s) => {
      const startTime = s.startTime || s.label.split(" - ")[0];
      return convertTo24Hour(startTime.trim());
    });

    const firstSlot = bookingSlots[0];
    const lastSlot = bookingSlots[bookingSlots.length - 1];

    const slotStartTime24 = convertTo24Hour(
      firstSlot.startTime || firstSlot.label.split(" - ")[0]
    );
    const slotEndTime24 = convertTo24Hour(
      lastSlot.endTime || lastSlot.label.split(" - ")[1]
    );

    const allSlotsString = bookingSlots.map((s) => s.label).join(", ");
    const formattedDate = formatFirestoreDate(date);

    // ✅ Payment status logic
    let paymentStatus = "ADVANCE";
    if (unpaidAmount === 0 && paidAmount > 0) paymentStatus = "PAID";
    else if (paidAmount === 0) paymentStatus = "UNPAID";

    // ✅ Firestore reference
    const bookingsRef = collection(db, "environments", "testing", "bookings");

    // 🔑 IMPORTANT: use bookingId as Firestore document ID
    const bookingDocRef = doc(bookingsRef, bookingId);
    
    const bookingDoc = {
      // IDs
      bookingId,
      turfId,
      ownerId,
      userId: `owner_${ownerId}`,

      // User Info
      bookingUsername: bookingName,
      bookingUserMobile: bookingMobile,
      userName: bookingName,
      userMobile: bookingMobile,

      // Turf Info
      turfName: resolvedTurfName,
      turfLocation: "",

      // Booking Details
      bookedSportsName: sport.toLowerCase(),
      court,
      date: formattedDate,
      selectedDate: formattedDate,

      // Slots
      allSlots: allSlots24,
      allSlotsString,
      numberOfSlots: bookingSlots.length,
      slotStartTime: slotStartTime24,
      slotEndTime: slotEndTime24,

      // Payment
      totalAmount: price,
      paidAmount,
      unpaidAmount,
      balanceAmount: unpaidAmount,
      paymentStatus,

      // Payment Meta
      paymentMethod: "Offline payment to owner",
      paymentId: `OFFLINE_${Date.now()}`,
      paymentTransactionId: `OFFLINE_${Date.now()}`,
      paymentInitiatedTime: new Date().toISOString(),
      paidBy: "Offline payment to owner",

      // Other
      bookingType: "OFFLINE",
      createdBy: "OWNER",
      turfClosed: false,
      dayPrice: 0,
      nightPrice: 0,

      // Timestamps
      createdAt: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    console.log("📝 Creating booking with bookingId as docId:", bookingId);

    // ✅ THIS IS THE KEY FIX
    await setDoc(bookingDocRef, bookingDoc);

    console.log(`✅ Booking stored with Firestore ID: ${bookingId}`);
    console.log(`Slots: ${allSlotsString}`);
    console.log(`Total: ₹${price}, Paid: ₹${paidAmount}, Balance: ₹${unpaidAmount}`);

    return bookingId;
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    throw error;
  }
};

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

  // 🔔 Notify SlotManagement
  window.dispatchEvent(new Event("slotsUpdated"));

  return true;
};
export interface Booking {
  id: string;
  bookingId: string;

  turfId: string;
  turfName: string;

  bookingUsername: string;
  bookingUserMobile: string;

  bookedSportsName: string;
  court: string;

  date: string;

  slotStartTime: string;
  slotEndTime: string;
  allSlotsString: string;

  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;

  paymentStatus: string;

  userId: string;
  createdBy: string;

  createdAt?: any;
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

      const dateA = parseDate(a.date || a.date);
      const dateB = parseDate(b.date || b.date);
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
    bookingId: data.bookingId || doc.id,

    turfId: data.turfId,
    turfName: data.turfName || data.turf_name || "Unknown Turf",

    bookingUsername: data.bookingUsername || data.booking_username || "",
    bookingUserMobile: data.bookingUserMobile || data.booking_user_mobile || "",

    bookedSportsName: data.bookedSportsName || data.booked_sports_name || "",
    court: data.court || "",

    date: data.date || data.selectedDate || "",

    slotStartTime: data.slotStartTime || data.slot_start_time || "",
    slotEndTime: data.slotEndTime || data.slot_end_time || "",
    allSlotsString: data.allSlotsString || "",

    totalAmount: data.totalAmount ?? data.total_amount ?? 0,
    paidAmount: data.paidAmount ?? data.paid_amount ?? 0,
    unpaidAmount: data.unpaidAmount ?? data.unpaid_amount ?? 0,

    paymentStatus: data.paymentStatus || data.payment_status || "UNPAID",

    userId: data.userId || "",
    createdBy: data.createdBy || "OWNER",

    createdAt: data.createdAt,
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
