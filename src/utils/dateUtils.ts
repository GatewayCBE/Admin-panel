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
