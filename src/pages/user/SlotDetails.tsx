// src/pages/user/SlotDetails.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllBookedSlots, getTurfById, onSlotUpdate } from "../../services/firestoreService";
import { normalizeTimeTo24 } from "../../utils/dateUtils"; // ✅ Import your helper

// ---------- Types ----------
type TurfDoc = {
  turf_id: string;
  owner_id?: string;
  turf_name: string;
  turf_location?: string;
  available_sports_list?: string[];
  sport_specific_timing?: Record<
    string,
    {
      opening_time?: string | null;
      closing_time?: string | null;
      day_start_time?: string | null;
      day_end_time?: string | null;
      night_start_time?: string | null;
      night_end_time?: string | null;
      court_count?: number | null;
    }
  >;
  sport_specific_price?: Record<
    string,
    Record<
      string,
      {
        day?: number | null;
        night?: number | null;
      }
    >
  >;
};

type Slot = {
  startLabel: string;
  endLabel: string;
  startMin: number;
  endMin: number;
};


// ---------- Time helpers ----------
const toMinutes = (time24: string): number => {
  const [h, m] = time24.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

const formatToAmPm = (time24: string): string => {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const dayKeyFromDate = (d: Date): string => {
  const names = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return names[d.getDay()];
};

// ✅ Format date for Firestore queries (DD-MMM-YYYY)
const formatDateForFirestore = (date: Date): string => {
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
};

// ---------- Component ----------
const SlotDetails: React.FC = () => {
  const { turfId } = useParams();
  const navigate = useNavigate();

  const [turf, setTurf] = useState<TurfDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<number>(1);

  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [bookedSlotSet, setBookedSlotSet] = useState<Set<string>>(new Set());

  // Listen for slot updates
  useEffect(() => {
    const reload = () => setRefreshKey(k => k + 1);
    window.addEventListener("slotsUpdated", reload);
    return () => window.removeEventListener("slotsUpdated", reload);
  }, []);

  // Fetch turf
  useEffect(() => {
    const run = async () => {
      if (!turfId) return;
      setLoading(true);
      const data = await getTurfById(turfId);
      if (data) {
        const typed = data as TurfDoc;
        setTurf(typed);

        const sports = typed.available_sports_list ?? [];
        if (sports.length > 0) {
          setSelectedSport(sports[0]);
        }
      }
      setLoading(false);
    };
    run();
  }, [turfId]);

  // Dates (30-day window)
  const today = useMemo(() => new Date(), []);
  const allDates = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [today]);

  const visibleDates = useMemo(
    () => allDates.slice(visibleStartIndex, visibleStartIndex + 6),
    [allDates, visibleStartIndex]
  );

  const selectedDate = allDates[selectedDateIndex];
  const selectedDayKey = useMemo(
    () => dayKeyFromDate(selectedDate),
    [selectedDate]
  );

  // ✅ Load booked slots with normalizeTimeTo24
  const loadBookedSlots = useCallback(async () => {
    if (!turf || !selectedSport || !selectedDate) return;

    const dateString = formatDateForFirestore(selectedDate);

    console.log("🔄 [SlotDetails] Loading booked slots:", {
      turfId: turf.turf_id,
      date: dateString,
      sport: selectedSport,
      court: `court ${selectedCourt}`,
    });

    try {
      const bookedSlots = await getAllBookedSlots(
        turf.turf_id,
        dateString,
        selectedSport,
        `court ${selectedCourt}` // ✅ lowercase "court"
      );

      console.log(`📦 [SlotDetails] Received ${bookedSlots.length} bookings`);

      // ✅ Filter only active bookings (not cancelled)
      const activeBookings = bookedSlots.filter((b: any) => {
        const status = (b.paymentStatus || b.payment_status || "").toUpperCase();
        const isCancelled = b.cancelledAt || b.cancelled_at;
        return status !== "CANCELLED" && !isCancelled;
      });

      console.log(`✅ [SlotDetails] ${activeBookings.length} active bookings`);

      // ✅ Extract and normalize start times using your helper
      const set = new Set<string>();

      activeBookings.forEach((booking: any) => {
        const start = normalizeTimeTo24(
  booking.slotStartTime || booking.slot_start_time
);
const end = normalizeTimeTo24(
  booking.slotEndTime || booking.slot_end_time
);

if (start && end) {
  let startMin = toMinutes(start);
  let endMin = toMinutes(end);

  // ✅ MOBILE APP FIX
  // If start and end are same, treat it as 1-hour slot
  if (endMin === startMin) {
    endMin = startMin + 60;
  }

  // ✅ Overnight booking handling
  else if (endMin < startMin) {
    endMin += 1440;
  }

  for (let min = startMin; min < endMin; min += 60) {
    const hour = Math.floor(min / 60) % 24;

    const key = `${hour
      .toString()
      .padStart(2, "0")}:00`;

    set.add(key);
  }
}
      });

      console.log("🔴 [SlotDetails] Final booked slots (24h):", Array.from(set));
      setBookedSlotSet(set);
    } catch (error) {
      console.error("❌ [SlotDetails] Error loading booked slots:", error);
      setBookedSlotSet(new Set());
    }
  }, [turf, selectedSport, selectedCourt, selectedDate]);

  // Update when dependencies change
  useEffect(() => {
    loadBookedSlots();
  }, [loadBookedSlots]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribe = onSlotUpdate(() => {
      console.log("🔄 [SlotDetails] Refreshing after booking/cancellation");
      loadBookedSlots();
    });

    return () => unsubscribe();
  }, [loadBookedSlots]);

  // Timing info for chosen sport
  const timing = useMemo(() => {
    if (!turf || !selectedSport) return null;

    const t = turf.sport_specific_timing?.[selectedSport];
    if (!t) return null;

    // ✅ Use normalizeTimeTo24 for all times
    const opening24 = normalizeTimeTo24(t.opening_time);
    const closing24 = normalizeTimeTo24(t.closing_time);

    if (!opening24 || !closing24) return null;

    let openingMin = toMinutes(opening24);
    let closingMin = toMinutes(closing24);

    // Handle overnight (closing after midnight)
    if (closingMin <= openingMin) {
      closingMin += 24 * 60;
    }

    const fixRange = (start?: string | null, end?: string | null) => {
      if (!start || !end) return { start: null, end: null };
      const s24 = normalizeTimeTo24(start);
      const e24 = normalizeTimeTo24(end);
      if (!s24 || !e24) return { start: null, end: null };
      
      let s = toMinutes(s24);
      let e = toMinutes(e24);
      if (e <= s) e += 24 * 60;
      return { start: s, end: e };
    };

    const day = fixRange(t.day_start_time, t.day_end_time);
    const night = fixRange(t.night_start_time, t.night_end_time);

    return {
      openingMin,
      closingMin,
      dayStartMin: day.start,
      dayEndMin: day.end,
      nightStartMin: night.start,
      nightEndMin: night.end,
      courtCount: t.court_count ?? 1,
    };
  }, [turf, selectedSport]);

  // Ensure court selection stays in range
  useEffect(() => {
    if (!timing) return;
    if (selectedCourt > timing.courtCount) {
      setSelectedCourt(1);
    }
  }, [timing, selectedCourt]);

  // All 1-hour slots
  const allSlots = useMemo<Slot[]>(() => {
    if (!timing) return [];

    const slots: Slot[] = [];

    for (let min = timing.openingMin; min < timing.closingMin; min += 60) {
      const hour24Raw = Math.floor(min / 60);
const hour24 = hour24Raw >= 24 ? hour24Raw - 24 : hour24Raw;
      const endMin = min + 60;

      const startLabel = formatToAmPm(`${hour24.toString().padStart(2, "0")}:00`);
      const endHour24 = Math.floor(endMin / 60) % 24;
      const endLabel = formatToAmPm(`${endHour24.toString().padStart(2, "0")}:00`);

      slots.push({
        startLabel,
        endLabel,
        startMin: min,
        endMin,
      });
    }

    return slots;
  }, [timing]);

  // Price table
  const priceTable = useMemo(() => {
    if (!turf || !selectedSport) return null;
    return turf.sport_specific_price?.[selectedSport] ?? null;
  }, [turf, selectedSport]);

  // Calculate price for a slot
  const calculatePriceForSlot = useCallback(
    (slot: Slot): number | null => {
      if (!timing || !priceTable) return null;
      const dayPriceInfo = priceTable[selectedDayKey];
      if (!dayPriceInfo) return null;

      const { dayStartMin, dayEndMin, nightStartMin, nightEndMin } = timing;
      const { startMin, endMin } = slot;

      let type: "day" | "night" | null = null;

      if (
        dayStartMin !== null &&
        dayEndMin !== null &&
        startMin >= dayStartMin &&
        endMin <= dayEndMin
      ) {
        type = "day";
      } else if (
        nightStartMin !== null &&
        nightEndMin !== null &&
        startMin >= nightStartMin &&
        endMin <= nightEndMin
      ) {
        type = "night";
      }

      if (!type) return null;
      const price = type === "day" ? dayPriceInfo.day : dayPriceInfo.night;
      return typeof price === "number" ? price : null;
    },
    [priceTable, timing, selectedDayKey]
  );

  // Total price
  const totalPrice = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    let total = 0;
    let hasAny = false;
    for (const s of selectedSlots) {
      const p = calculatePriceForSlot(s);
      if (p !== null) {
        total += p;
        hasAny = true;
      }
    }
    return hasAny ? total : null;
  }, [selectedSlots, calculatePriceForSlot]);

  // UI helpers
  const formatDateLabel = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  const formatDayLabel = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short" });

  const isSlotSelected = (slot: Slot) =>
    selectedSlots.some(
      (s) => s.startMin === slot.startMin && s.endMin === slot.endMin
    );

  const toggleSlot = (slot: Slot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(
        (s) => s.startMin === slot.startMin && s.endMin === slot.endMin
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.startMin === slot.startMin && s.endMin === slot.endMin)
        );
      }
      const next = [...prev, slot];
      next.sort((a, b) => a.startMin - b.startMin);
      return next;
    });
  };

  async function handleBooking() {
    if (!turf || !selectedSport || !totalPrice || selectedSlots.length === 0) return;

    navigate("/user/advancepayment", {
      state: {
        turf,
        selectedSport,
        selectedCourt,
        selectedSlots,
        selectedDate,
        totalPrice,
      },
    });
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  function renderTimelineRow(hours: number[]) {
    return (
      <>
        <div
          className="d-flex justify-content-between px-3 text-muted small mb-1"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {hours.map((h, idx) => (
            <div key={idx} style={{ width: `${100 / hours.length}%` }}>
              {formatToAmPm(`${(h % 24).toString().padStart(2, "0")}:00`)}
            </div>
          ))}
        </div>

        <div
          className="rounded-pill border border-success d-flex mx-auto mb-4"
          style={{ height: "44px", maxWidth: "900px", overflow: "hidden" }}
        >
          {hours.map((h, idx) => {
            const realHour = h % 24;
            const startMin = realHour * 60;
            const slot = allSlots.find((s) => s.startMin === startMin);

            // ✅ Check if slot is booked using normalized 24h format
            const slotKey24 = `${realHour.toString().padStart(2, "0")}:00`;
            const isBooked = bookedSlotSet.has(slotKey24);

            const disabled =
              (isToday && startMin <= nowMinutes) ||
              isBooked ||
              !slot;

            const selected = selectedSlots.some(
              (s) => s.startMin === startMin
            );

            return (
              <div
                key={idx}
                className={`flex-grow-1 d-flex align-items-center justify-content-center ${
                  isBooked
                    ? "bg-danger text-white"
                    : disabled
                    ? "bg-secondary bg-opacity-50"
                    : selected
                    ? "bg-success text-white"
                    : "bg-white"
                }`}
                style={{
                  borderRight: idx !== hours.length - 1 ? "1px solid #ccc" : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  backgroundColor: disabled && !isBooked
                    ? "repeating-linear-gradient(45deg,#ddd,#ddd 4px,#eee 4px,#eee 8px)"
                    : undefined,
                }}
                onClick={() => {
                  if (!disabled && slot) toggleSlot(slot);
                }}
              >
                {formatToAmPm(`${realHour.toString().padStart(2, "0")}:00`)}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  if (loading || !turf || !selectedSport || !timing) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" />
          <p className="text-muted">Loading slot details…</p>
        </div>
      </div>
    );
  }

  const sports = turf.available_sports_list ?? [];
  const courts = Array.from({ length: timing.courtCount || 1 }, (_, i) => i + 1);

  return (
    <div className="container-fluid py-5 mt-5">
      <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-link text-success px-0 me-3"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="mb-0 fw-bold text-success">{turf.turf_name}</h2>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body px-4 px-md-5 py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
              <div>
                <div className="text-uppercase text-muted small mb-2">Format</div>
                <div className="d-flex flex-wrap gap-2">
                  {sports.map((s) => (
                    <button
                      key={s}
                      className={
                        "btn btn-sm rounded-pill px-3 " +
                        (s === selectedSport
                          ? "btn-success text-white"
                          : "btn-outline-success")
                      }
                      onClick={() => {
                        setSelectedSport(s);
                        setSelectedSlots([]);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-uppercase text-muted small mb-2">No. of Courts</div>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "120px" }}
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(Number(e.target.value))}
                >
                  {courts.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                style={{ width: "32px", height: "32px" }}
                disabled={visibleStartIndex === 0}
                onClick={() => setVisibleStartIndex((prev) => Math.max(0, prev - 6))}
              >
                ‹
              </button>

              <div className="d-flex flex-grow-1 justify-content-center gap-2 mx-3">
                {visibleDates.map((d, idx) => {
                  const globalIndex = visibleStartIndex + idx;
                  const isSelected = globalIndex === selectedDateIndex;
                  return (
                    <button
                      key={d.toISOString()}
                      className={
                        "btn rounded-4 px-3 py-2 d-flex flex-column align-items-center " +
                        (isSelected ? "btn-success text-white" : "btn-light border")
                      }
                      style={{ minWidth: "90px" }}
                      onClick={() => {
                        setSelectedDateIndex(globalIndex);
                        setSelectedSlots([]);
                      }}
                    >
                      <span className="fw-semibold">{formatDayLabel(d)}</span>
                      <span className={isSelected ? "text-white-50" : "text-muted"}>
                        {formatDateLabel(d)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                style={{ width: "32px", height: "32px" }}
                disabled={visibleStartIndex + 6 >= allDates.length}
                onClick={() =>
                  setVisibleStartIndex((prev) =>
                    Math.min(allDates.length - 6, prev + 6)
                  )
                }
              >
                ›
              </button>
            </div>

            <div className="mb-4">
              <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  }}
>
  {allSlots.map((slot) => {
    const hour = Math.floor(slot.startMin / 60) % 24;
    const slotKey24 = `${hour.toString().padStart(2, "0")}:00`;

    const isBooked = bookedSlotSet.has(slotKey24);

    const disabled =
      (isToday && slot.startMin <= nowMinutes) ||
      isBooked;

    const selected = isSlotSelected(slot);

    return (
      <button
        key={slot.startMin}
        className={`btn ${
          isBooked
            ? "btn-danger"
            : disabled
            ? "btn-secondary"
            : selected
            ? "btn-success"
            : "btn-outline-success"
        }`}
        disabled={disabled}
        onClick={() => toggleSlot(slot)}
        style={{
          width: "100%",
          borderRadius: "12px",
          padding: "10px 6px",
          fontSize: "14px",
        }}
      >
        {slot.startLabel} – {slot.endLabel}
      </button>
    );
  })}
</div>
            </div>

            <div className="border-top pt-3 mt-2 text-center">
              {selectedSlots.length > 0 && totalPrice !== null ? (
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                  <div className="text-start">
                    <div className="text-muted small mb-1">Selected slots</div>
                    {selectedSlots.map((s) => (
                      <div key={s.startMin} className="small">
                        {s.startLabel} – {s.endLabel}
                      </div>
                    ))}
                    <div className="text-success fw-bold mt-2">
                      Total: ₹{totalPrice}
                    </div>
                  </div>

                  <button className="btn btn-success btn-lg px-5" onClick={handleBooking}>
                    Book for ₹{totalPrice}
                  </button>
                </div>
              ) : (
                <p className="text-muted mb-0">Select a slot to continue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotDetails;