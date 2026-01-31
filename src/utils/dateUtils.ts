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
