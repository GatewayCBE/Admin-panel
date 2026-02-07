export const parseDate = (value: string): Date | null => {
  if (!value || typeof value !== "string") return null;

  value = value.trim();

  // DD-MMM-YYYY (01-Feb-2026)
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(value)) {
    const [day, mon, year] = value.split("-");
    const map: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const month = map[mon];
    if (month === undefined) return null;
    return new Date(Number(year), month, Number(day));
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Fallback (ISO / native)
  const native = new Date(value);
  return isNaN(native.getTime()) ? null : native;
};

// Accept ONLY hour format like "09:00 AM"
  export const formatHourOnly12 = (value: string) => {
    if (!value) return "";

    value = value.toUpperCase().replace(/\s+/g, "");

    // Convert 9AM → 09:00 AM
    const short = value.match(/^(1[0-2]|0?[1-9])(AM|PM)$/);
    if (short) {
      return `${short[1].padStart(2, "0")}:00 ${short[2]}`;
    }

    // Accept only HH:00 AM/PM
    const full = value.match(/^(0[1-9]|1[0-2]):00(AM|PM)$/);
    if (full) {
      return `${full[1]}:00 ${full[2]}`;
    }

    return value; // allow typing but won't validate
  };

// Convert "09:00 AM" → minutes (for comparison logic)
export const hour12ToMinutes = (time12: string) => {
  if (!time12) return null;

  const match = time12.match(/(0[1-9]|1[0-2]):00\s?(AM|PM)/);
  if (!match) return null;

  let [_, h, period] = match;
  let hours = parseInt(h);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60;
};

// 🔥 SAME as Add Turf

/**
 * Converts ANY reasonable time format into 24-hour "HH:mm"
 * Returns null if input is invalid
 */
export function normalizeTimeTo24(
  time: string | null | undefined
): string | null {
  if (!time) return null;

  let t = time.trim().toUpperCase().replace(/\s+/g, " ");

  // HH:mm (24h)
  if (/^\d{1,2}:\d{2}$/.test(t) && !t.includes("AM") && !t.includes("PM")) {
    const [h, m] = t.split(":").map(Number);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }
  }

  // 6 PM, 6:00 PM
  const ampm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (ampm) {
    let h = Number(ampm[1]);
    let m = Number(ampm[2] ?? 0);
    if (ampm[3] === "PM" && h !== 12) h += 12;
    if (ampm[3] === "AM" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
  }

  // "6", "18"
  if (/^\d{1,2}$/.test(t)) {
    const h = Number(t);
    if (h >= 0 && h < 24) {
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  return null;
}

