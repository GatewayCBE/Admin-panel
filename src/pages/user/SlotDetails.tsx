// src/pages/user/SlotDetails.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTurfBooking, getTurfById, isSlotAlreadyBooked } from "../../services/firestoreService";

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
  startLabel: string; // e.g. "6:00 PM"
  endLabel: string;
  startMin: number;   // minutes from 00:00
  endMin: number;
};

type Segment = "twilight" | "morning" | "noon" | "evening";

// ---------- Time helpers ----------
const toMinutes = (time24: string): number => {
  const [h, m] = time24.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

const convertTo24Hour = (t: string | null | undefined): string | null => {
  if (!t) return null;
  const trimmed = t.trim();

  // Already "HH:MM" 24h
  if (/^\d{1,2}:\d{2}$/.test(trimmed) && !/[AP]M$/i.test(trimmed)) {
    const [h, m] = trimmed.split(":").map((n) => parseInt(n, 10));
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    }
  }

  // "10:00 PM" etc
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
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

// ---------- Component ----------
const SlotDetails: React.FC = () => {
  const { turfId } = useParams();
  const navigate = useNavigate();

  const [turf, setTurf] = useState<TurfDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<number>(1);

  const [visibleStartIndex, setVisibleStartIndex] = useState(0); // 6-day window
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const [selectedSegment, setSelectedSegment] =
    useState<Segment>("evening");

  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);

  // -------- Fetch turf --------
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

  // -------- Dates (30-day window) --------
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

  // -------- Timing info for chosen sport --------
  const timing = useMemo(() => {
    if (!turf || !selectedSport) return null;
    const t = turf.sport_specific_timing?.[selectedSport];
    if (!t) return null;

    const opening = convertTo24Hour(t.opening_time ?? null) ?? "00:00";
    const closing = convertTo24Hour(t.closing_time ?? null) ?? "23:59";

    const dayStart = convertTo24Hour(t.day_start_time ?? null);
    const dayEnd = convertTo24Hour(t.day_end_time ?? null);
    const nightStart = convertTo24Hour(t.night_start_time ?? null);
    const nightEnd = convertTo24Hour(t.night_end_time ?? null);

    return {
      openingMin: toMinutes(opening),
      closingMin: toMinutes(closing),
      dayStartMin: dayStart ? toMinutes(dayStart) : null,
      dayEndMin: dayEnd ? toMinutes(dayEnd) : null,
      nightStartMin: nightStart ? toMinutes(nightStart) : null,
      nightEndMin: nightEnd ? toMinutes(nightEnd) : null,
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

  // -------- All 1-hour slots across 24h (filtered by opening/closing) --------
  const allSlots = useMemo<Slot[]>(() => {
    if (!timing) return [];

    const slots: Slot[] = [];
    for (let h = 0; h < 24; h++) {
      const startMin = h * 60;
      const endMin = startMin + 60;

      // Respect opening / closing
      if (startMin < timing.openingMin || endMin > timing.closingMin) continue;

      const startLabel = formatToAmPm(
        `${h.toString().padStart(2, "0")}:00`
      );
      const endLabel = formatToAmPm(
        `${(h + 1).toString().padStart(2, "0")}:00`
      );

      slots.push({ startLabel, endLabel, startMin, endMin });
    }
    return slots;
  }, [timing]);

  // -------- Filter slots by Twilight / Morning / Noon / Evening --------
  const filteredSlots = useMemo<Slot[]>(() => {
    if (!timing) return [];

    let segStart = 0;
    let segEnd = 24 * 60;

    if (selectedSegment === "twilight") {
      segStart = 0;
      segEnd = 6 * 60;
    } else if (selectedSegment === "morning") {
      segStart = 6 * 60;
      segEnd = 12 * 60;
    } else if (selectedSegment === "noon") {
      segStart = 12 * 60;
      segEnd = 18 * 60;
    } else if (selectedSegment === "evening") {
      segStart = 18 * 60;
      segEnd = 24 * 60;
    }

    return allSlots.filter(
      (s) => s.startMin >= segStart && s.endMin <= segEnd
    );
  }, [allSlots, selectedSegment, timing]);

  // Split into 2 "timeline" rows
  const [row1Slots, row2Slots] = useMemo(() => {
    const mid = Math.ceil(filteredSlots.length / 2);
    return [filteredSlots.slice(0, mid), filteredSlots.slice(mid)];
  }, [filteredSlots]);

  // -------- Price table for selected sport --------
  const priceTable = useMemo(() => {
    if (!turf || !selectedSport) return null;
    return turf.sport_specific_price?.[selectedSport] ?? null;
  }, [turf, selectedSport]);

  // Calculate price for a single slot from timing + price table
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

  // Total price = sum of each selected slot price
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

  // -------- UI helpers --------
  const formatDateLabel = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  const formatDayLabel = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short" });

  const segmentLabel = (seg: Segment) => {
    switch (seg) {
      case "twilight":
        return "Twilight";
      case "morning":
        return "Morning";
      case "noon":
        return "Noon";
      case "evening":
        return "Evening";
      default:
        return seg;
    }
  };

  const segmentHoursText = (seg: Segment) => {
    switch (seg) {
      case "twilight":
        return "12:00 AM – 6:00 AM";
      case "morning":
        return "6:00 AM – 12:00 PM";
      case "noon":
        return "12:00 PM – 6:00 PM";
      case "evening":
        return "6:00 PM – 12:00 AM";
      default:
        return "";
    }
  };

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
      // add & sort by time
      const next = [...prev, slot];
      next.sort((a, b) => a.startMin - b.startMin);
      return next;
    });
  };

  // Map each segment to EXACT 8 hours → 4 in row1, 4 in row2
function getSegmentHours(segment: Segment) {
  switch (segment) {
    case "twilight": // 12am–6am
      return {
        row1: [0, 1, 2, 3],
        row2: [3, 4, 5, 6],
      };
    case "morning": // 6am–12pm
      return {
        row1: [6, 7, 8, 9],
        row2: [9, 10, 11, 12],
      };
    case "noon": // 12pm–6pm
      return {
        row1: [12, 13, 14, 15],
        row2: [15, 16, 17, 18],
      };
    case "evening": // 6pm–12am
      return {
        row1: [18, 19, 20, 21],
        row2: [21, 22, 23, 24], // 24 → 12 AM next day
      };
    default:
      return { row1: [], row2: [] };
  }
}

async function handleBooking() {
  if (!turf || !selectedSport) return;

  const userId = localStorage.getItem("user_id") ?? "";
  const userName = localStorage.getItem("user_name") ?? "";

  const dateString = selectedDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-"); // "02-Dec-2025"

  for (const slot of selectedSlots) {
    const slotStart = slot.startLabel.replace(" ", "");

    // Check if already booked
    const isBooked = await isSlotAlreadyBooked({
      turfId: turf.turf_id,
      dateString,
      sportName: selectedSport,
      courtName: `court ${selectedCourt}`,
      slotStart,
    });

    if (isBooked) {
      alert(`Slot ${slot.startLabel} is already booked!`);
      continue;
    }

    const price = calculatePriceForSlot(slot);

    const bookingData = {
      booked_sports_name: selectedSport,
      booking_id: `BS_${turf.turf_id}_${Date.now()}`,
      booking_username: userName,
      court: `court ${selectedCourt}`,
      date: dateString,
      day_price: priceTable?.[selectedDayKey]?.day ?? null,
      night_price: priceTable?.[selectedDayKey]?.night ?? null,
      owner_id: turf.owner_id ?? "",       // FIX HERE
      paid_amount: price,
      paid_by: `${userId} ${userName}`,
      payment_initiated_time: new Date().toISOString(),
      payment_status: "paymentSuccess",
      payment_transaction_id: "",
      slot_start_time: slot.startLabel,
      slot_end_time: slot.endLabel,
      total_amount: price,
      turf_closed: false,
      turf_id: turf.turf_id,
      turf_name: turf.turf_name,
      unpaid_amount: 0,
      user_id: userId,
    };

    await createTurfBooking({
      turfId: turf.turf_id,
      dateString,
      sportName: selectedSport,
      courtName: `court ${selectedCourt}`,
      slotStart,
      bookingData,
    });
  }

  alert("Booking created successfully!");
}



function renderTimelineRow(hours: number[]) {
  return (
    <>
      {/* Top Hour Labels */}
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

      {/* Timeline Bar */}
      <div
        className="rounded-pill border border-success d-flex mx-auto mb-4"
        style={{ height: "44px", maxWidth: "900px", overflow: "hidden" }}
      >
        {hours.map((h, idx) => {
          const realHour = h % 24;
          const startMin = realHour * 60;
          const slot = allSlots.find((s) => s.startMin === startMin);
          const price = slot ? calculatePriceForSlot(slot) : null;

          const disabled = price === null;
          const selected = selectedSlots.some((s) => s.startMin === startMin);

          return (
            <div
              key={idx}
              className={`flex-grow-1 d-flex align-items-center justify-content-center ${
                disabled
                  ? "bg-light bg-opacity-50"
                  : selected
                  ? "bg-success text-white"
                  : "bg-white"
              }`}
              style={{
                borderRight: idx !== hours.length - 1 ? "1px solid #ccc" : "none",
                cursor: disabled ? "not-allowed" : "pointer",
                backgroundImage: disabled
                  ? "repeating-linear-gradient(45deg,#ddd,#ddd 4px,#eee 4px,#eee 8px)"
                  : "none",
              }}
              onClick={() => !disabled && toggleSlot(slot!)}
            >
              {formatToAmPm(`${realHour.toString().padStart(2, "0")}:00`)}
            </div>
          );
        })}
      </div>
    </>
  );
}


  // -------- Render --------
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
    <div className="container-fluid py-4">
      <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-link text-success px-0 me-3"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="mb-0 fw-bold text-success">{turf.turf_name}</h2>
        </div>

        {/* Main card */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body px-4 px-md-5 py-4">
            {/* FORMAT + COURT */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
              <div>
                <div className="text-uppercase text-muted small mb-2">
                  Format
                </div>
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
                <div className="text-uppercase text-muted small mb-2">
                  No. of Courts
                </div>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "120px" }}
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(Number(e.target.value))}
                >
                  {courts.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DATE STRIP */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                style={{ width: "32px", height: "32px" }}
                disabled={visibleStartIndex === 0}
                onClick={() =>
                  setVisibleStartIndex((prev) => Math.max(0, prev - 6))
                }
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
                        (isSelected
                          ? "btn-success text-white"
                          : "btn-light border")
                      }
                      style={{ minWidth: "90px" }}
                      onClick={() => {
                        setSelectedDateIndex(globalIndex);
                        setSelectedSlots([]);
                      }}
                    >
                      <span className="fw-semibold">
                        {formatDayLabel(d)}
                      </span>
                      <span
                        className={
                          isSelected ? "text-white-50" : "text-muted"
                        }
                      >
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

            {/* SEGMENT TABS */}
            <div className="d-flex justify-content-center gap-4 mb-3">
              {(["twilight", "morning", "noon", "evening"] as Segment[]).map(
                (seg) => (
                  <button
                    key={seg}
                    className="btn btn-link text-decoration-none px-2"
                    onClick={() => {
                      setSelectedSegment(seg);
                      setSelectedSlots([]);
                    }}
                  >
                    <div
                      className={
                        "fw-semibold " +
                        (selectedSegment === seg
                          ? "text-success"
                          : "text-muted")
                      }
                    >
                      {segmentLabel(seg)}
                    </div>
                    {selectedSegment === seg && (
                      <div
                        className="mt-1"
                        style={{
                          height: "3px",
                          borderRadius: "999px",
                          backgroundColor: "#198754",
                        }}
                      />
                    )}
                  </button>
                )
              )}
            </div>

            <div className="text-center text-muted small mb-3">
              {segmentHoursText(selectedSegment)}
            </div>

            {/* TIMELINE ROWS */}
            <div className="mb-4">
              {/* SEGMENT-BASED TWO-ROW TIMELINE */}
{(() => {
  const { row1, row2 } = getSegmentHours(selectedSegment);
  return (
    <>
      {renderTimelineRow(row1)}
      {renderTimelineRow(row2)}
    </>
  );
})()}

            </div>

            {/* SUMMARY / BOOK BUTTON */}
            <div className="border-top pt-3 mt-2 text-center">
              {selectedSlots.length > 0 && totalPrice !== null ? (
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                  <div className="text-start">
                    <div className="text-muted small mb-1">
                      Selected slots
                    </div>
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
