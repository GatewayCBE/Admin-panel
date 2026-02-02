import React, { useEffect, useState } from "react";
import {
  createBooking,
  getAllBookedSlots,
  getTurfsByOwner,
} from "../../../services/firestoreService";
import pickleballImg from "../../../assets/PickleImg.png";
import badmintonImg from "../../../assets/badminton.png";
import boxcricketImg from "../../../assets/boxcricket_football.png";
import { useNavigate } from "react-router-dom";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  isBooked: boolean;
}

const SlotManagement: React.FC = () => {
  const ownerId = localStorage.getItem("user_id") || "";
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState<any[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<any>(null);
  const [sportsList, setSportsList] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [courts, setCourts] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("");

  const [operatingHours, setOperatingHours] = useState({
    open: "",
    close: "",
    dayStart: "",
    dayEnd: "",
    nightStart: "",
    nightEnd: "",
  });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Record<string, string[]>>({});

  const [bookingName, setBookingName] = useState<string>("");
  const [bookingMobile, setBookingMobile] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  // ✅ Changed to array for multiple slot selection
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  // Load turfs on mount
  useEffect(() => {
    const loadTurfs = async () => {
      const data = await getTurfsByOwner(ownerId);
      setTurfs(data);
      if (data.length > 0) setSelectedTurf(data[0]);
    };
    loadTurfs();
  }, [ownerId]);

  // Load sports when turf changes
  useEffect(() => {
    if (!selectedTurf) return;
    const sports = selectedTurf.available_sports_list || [];
    setSportsList(sports);
    if (sports.length > 0) setSelectedSport(sports[0]);
  }, [selectedTurf]);

  // Load timing and courts when sport changes
  useEffect(() => {
    if (!selectedTurf || !selectedSport) return;

    const sportKey = selectedSport.toLowerCase();
    const timing = selectedTurf.sport_specific_timing?.[sportKey];

    if (!timing) {
      console.warn(`No timing found for sport: ${sportKey}`);
      return;
    }

    setOperatingHours({
      open: timing.opening_time || "",
      close: timing.closing_time || "",
      dayStart: timing.day_start_time || "",
      dayEnd: timing.day_end_time || "",
      nightStart: timing.night_start_time || "",
      nightEnd: timing.night_end_time || "",
    });

    const personCount = selectedTurf.sports_specific_person_count?.[selectedSport] || 4;
    const courtCount = Math.max(1, Math.ceil(personCount / 4));
    const courtList = Array.from({ length: courtCount }, (_, i) => `Court ${i + 1}`);
    setCourts(courtList);
    if (courtList.length > 0) setSelectedCourt(courtList[0]);

    generateSlots(timing.opening_time, timing.closing_time);
  }, [selectedSport, selectedTurf]);

  const convertTo24 = (time12h: string) => {
    if (!time12h) return "00:00";

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

  const generateSlots = (open: string, close: string) => {
    if (!open || !close) return;

    const open24 = convertTo24(open);
    const close24 = convertTo24(close);

    const start = new Date(`1970-01-01T${open24}:00`);
    let end = new Date(`1970-01-01T${close24}:00`);
    if (end <= start) end.setDate(end.getDate() + 1);

    const tempSlots: TimeSlot[] = [];

    while (start < end) {
      const next = new Date(start.getTime() + 60 * 60 * 1000);

      const startLabel = start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endLabel = next.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      tempSlots.push({
        id: `${startLabel}-${selectedCourt}`,
        startTime: startLabel,
        endTime: endLabel,
        label: `${startLabel} - ${endLabel}`,
        isBooked: false,
      });

      start.setHours(start.getHours() + 1);
    }

    setSlots(tempSlots);
  };

  // Fetch booked slots – improved version with better logging
  useEffect(() => {
  // Early return – prevent unnecessary runs
  if (!selectedTurf?.turf_id || !selectedSport || !selectedCourt || !bookingDate) {
    console.log("[BOOKED] Skipping – incomplete selection", {
      turf: !!selectedTurf?.turf_id,
      sport: !!selectedSport,
      court: !!selectedCourt,
      date: !!bookingDate,
    });
    // Optional: reset slots to all available when selection incomplete
    setSlots(prev => prev.map(s => ({ ...s, isBooked: false })));
    return;
  }

  const loadBooked = async () => {
    console.log("[BOOKED] Starting fetch with CURRENT values:", {
      turfId: selectedTurf.turf_id,
      date: bookingDate,
      sport: selectedSport,
      court: selectedCourt,                // ← must show correct court here
    });

    try {
      const booked = await getAllBookedSlots(
        selectedTurf.turf_id,
        bookingDate,
        selectedSport,
        selectedCourt                        // ← pass the current value
      );

      console.log(`[BOOKED] Received ${booked.length} docs for ${selectedCourt}`);

      const activeBookings = booked.filter((b: any) => {
        const status = (b.paymentStatus || b.payment_status || "").toUpperCase();
        return status !== "CANCELLED" && !b.cancelledAt;
      });

      console.log(`[BOOKED] ${activeBookings.length} active after filter`);

      const bookedStartTimes = activeBookings
        .map((b: any) => (b.slotStartTime || b.slot_start_time || "").trim())
        .filter(Boolean);

      console.log("[BOOKED] Blocked start times:", bookedStartTimes);

      setSlots(prev =>
        prev.map(slot => ({
          ...slot,
          isBooked: bookedStartTimes.includes(slot.startTime.trim()),
        }))
      );
    } catch (err) {
      console.error("[BOOKED] Fetch failed:", err);
    }
  };

  loadBooked();

  // Cleanup (optional) – reset when unmount or deps change
  return () => {
    console.log("[BOOKED] Cleaning up previous fetch");
  };
}, [selectedTurf?.turf_id, bookingDate, selectedSport, selectedCourt]);

  // ────────────────────────────────────────────────
  // The rest of the file remains unchanged
  // ────────────────────────────────────────────────

  const isPastSlot = (slotStart: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (bookingDate !== todayStr) return false;

    const slot24 = convertTo24(slotStart);
    const [slotHour, slotMinute] = slot24.split(":").map(Number);

    const open24 = convertTo24(operatingHours.open);
    const close24 = convertTo24(operatingHours.close);
    const [openHour] = open24.split(":").map(Number);
    const [closeHour] = close24.split(":").map(Number);

    const isNextDaySlot = closeHour < openHour && slotHour < openHour;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (isNextDaySlot) {
      if (currentHour < openHour) {
        return (
          currentHour > slotHour ||
          (currentHour === slotHour && currentMinute > slotMinute)
        );
      }
      return false;
    }

    return (
      currentHour > slotHour ||
      (currentHour === slotHour && currentMinute > slotMinute)
    );
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!selectedTurf || !selectedSport || !selectedCourt) return;

    const key = `${selectedTurf.turf_id}_${selectedSport}_${selectedCourt}_${bookingDate}`;
    const blockedForThisCourt = blockedSlots[key] || [];

    if (
      !slot.isBooked &&
      !blockedForThisCourt.includes(slot.id) &&
      !isPastSlot(slot.startTime)
    ) {
      // Toggle slot selection
      setSelectedTimeSlots(prev => {
        if (prev.includes(slot.id)) {
          // Deselect
          return prev.filter(id => id !== slot.id);
        } else {
          // Select
          return [...prev, slot.id];
        }
      });
    }
  };

  const handleSlotUnavailable = () => {
    if (selectedTimeSlots.length === 0) return alert("Select at least one slot first");

    const key = `${selectedTurf.turf_id}_${selectedSport}_${selectedCourt}_${bookingDate}`;

    setBlockedSlots((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...selectedTimeSlots]
    }));

    setSelectedTimeSlots([]);
  };

  const handleBookSlot = () => {
    if (!bookingName || !bookingMobile || selectedTimeSlots.length === 0) {
      return alert("Please fill in all fields and select at least one slot");
    }

    // Get all selected slot details
    const selectedSlotDetails = slots.filter(s => selectedTimeSlots.includes(s.id));
    
    if (selectedSlotDetails.length === 0) return;

    // Calculate total price for all selected slots
    const totalPrice = selectedSlotDetails.reduce((sum, slot) => {
      return sum + getSlotPrice(slot.startTime);
    }, 0);

    navigate("/owner/booking-confirmation", {
      state: {
        turfId: selectedTurf.turf_id,
        turfName: selectedTurf.turf_name,
        bookingName,
        bookingMobile,
        sport: selectedSport,
        court: selectedCourt,
        date: bookingDate,
        slots: selectedSlotDetails, // Pass all selected slots
        totalPrice,
        ownerId
      }
    });
  };

  useEffect(() => {
  const reload = () => {
    console.log("🔄 Slots refresh triggered");
    // re-fetch booked slots
    setSelectedTimeSlots([]);
  };

  window.addEventListener("slotsUpdated", reload);
  return () => window.removeEventListener("slotsUpdated", reload);
}, []);


// Add this useEffect to listen for slot updates
useEffect(() => {
  const unsubscribe = onSlotUpdate(() => {
    console.log("🔄 SlotManagement: Refreshing slots after cancellation");
    // Re-fetch booked slots
    loadBooked();
  });

  return () => unsubscribe();
}, [selectedTurf, selectedSport, selectedCourt, bookingDate]);

// Extract the loadBooked logic into a separate function
const loadBooked = async () => {
  if (!selectedTurf || !selectedSport || !selectedCourt || !bookingDate) return;

  const booked = await getAllBookedSlots(
    selectedTurf.turf_id,
    bookingDate,
    selectedSport,
    selectedCourt
  );

  const bookedTimes = booked.map(b => b.slot_start_time);

  setSlots(prev =>
    prev.map(slot => ({
      ...slot,
      isBooked: bookedTimes.includes(slot.startTime)
    }))
  );
};

// Update the existing useEffect to use loadBooked
useEffect(() => {
  loadBooked();
}, [selectedSport, selectedCourt, selectedTurf, bookingDate]);

  const getSportImage = (sport: string) => {
    const name = sport.toLowerCase();
    if (name.includes("pickle")) return pickleballImg;
    if (name.includes("badminton")) return badmintonImg;
    if (name.includes("boxcricket") || name.includes("football")) return boxcricketImg;
    return "";
  };

  const getSlotPrice = (slotStart: string) => {
    if (!selectedTurf || !selectedSport) return 0;

    const sportKey = selectedSport.toLowerCase();
    const prices = selectedTurf.sport_specific_price?.[sportKey];
    if (!prices) return 0;

    const dayName = new Date(bookingDate)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const hour = parseInt(convertTo24(slotStart).split(":")[0]);
    const nightStartHour = parseInt(convertTo24(operatingHours.nightStart).split(":")[0]);
    const isNight = hour >= nightStartHour;

    return isNight ? prices[dayName]?.night || 0 : prices[dayName]?.day || 0;
  };

  // ✅ Calculate total price for selected slots
  const getTotalPrice = () => {
    return selectedTimeSlots.reduce((sum, slotId) => {
      const slot = slots.find(s => s.id === slotId);
      if (slot) {
        return sum + getSlotPrice(slot.startTime);
      }
      return sum;
    }, 0);
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="mt-5 pt-5">
      <div className="">
        <h3 className="mb-0 text-center text-success fw-bold">Slot Management</h3>
      </div>

      <div className="container py-4">
        {/* Turf Dropdown */}
        <div className="mb-3">
          <select
            className="form-select mb-3"
            value={selectedTurf?.turf_id || ""}
            onChange={(e) => setSelectedTurf(turfs.find((t) => t.turf_id === e.target.value))}
          >
            {turfs.map((turf) => (
              <option key={turf.turf_id} value={turf.turf_id}>
                {turf.turf_name}
              </option>
            ))}
          </select>
        </div>

        {/* Operating Hours */}
        <div
          className="mb-4 p-3 rounded"
          style={{ backgroundColor: "#f5f5dc", border: "2px solid #9adf07" }}
        >
          <div className="d-flex align-items-center mb-2">
            <span style={{ color: "#9adf07", fontSize: "20px", marginRight: "10px" }}>🕐</span>
            <h6 className="mb-0" style={{ color: "#9adf07" }}>
              Operating Hours
            </h6>
          </div>
          <h4 className="mb-1" style={{ fontWeight: "bold" }}>
            {operatingHours.open && operatingHours.close
              ? `${operatingHours.open} - ${operatingHours.close}`
              : ""}
          </h4>
          <small className="text-muted d-block mt-1">
            Users can book any slot within these hours
          </small>
        </div>

        {/* Sport Selection */}
        <div className="mb-4">
          <h4 className="fw-bold mb-3">Sport</h4>
          <div className="shadow-sm border-0 d-inline-block px-2 py-2">
            <img
              src={getSportImage(selectedSport)}
              alt={selectedSport}
              style={{ width: "90px", height: "90px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Booking User Name & Mobile */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Booking User Name *"
            value={bookingName}
            onChange={(e) => setBookingName(e.target.value)}
            style={{ padding: "15px" }}
          />
        </div>

        <div className="mb-4">
          <input
            type="tel"
            className="form-control"
            placeholder="Booking User Mobile Number *"
            value={bookingMobile}
            onChange={(e) => setBookingMobile(e.target.value)}
            style={{ padding: "15px" }}
          />
        </div>

        {/* Choose Court */}
        <div className="mb-4">
          <h2 className="fw-bold mb-4">Choose Court</h2>
          <div className="row g-3">
            {courts.slice(0, 10).map((court) => (
              <div key={court} className="col-6 col-md-4 col-lg-2">
                <button
                  type="button"
                  className={`btn w-100 py-3 fs-6 fw-semibold rounded-4 shadow-sm ${
                    selectedCourt === court ? "btn-success" : "btn-outline-success"
                  }`}
                  onClick={() => setSelectedCourt(court)}
                >
                  {court}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Choose Booking Date */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2">Choose Booking Date</h6>
          <input
            type="date"
            className="form-control"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={{
              padding: "12px",
              backgroundColor: "#f5f5dc",
              border: "2px solid #9adf07",
              color: "#9adf07",
              fontWeight: "500",
            }}
          />
        </div>

        {/* All Available Slots */}
        <div className="mb-4">
          <h6 className="fw-bold mb-1">All Available Slots</h6>
          <small className="text-muted d-block mb-3">
            🔴 Booked | ⚫ Unavailable | ⏳ Past Time | ✅ Available | 🟢 Selected ({selectedTimeSlots.length})
          </small>

          <div className="row g-2">
            {slots.map((slot) => {
              const key = `${selectedTurf?.turf_id}_${selectedSport}_${selectedCourt}_${bookingDate}`;
              const blockedForThisCourt = blockedSlots[key] || [];

              const isBlocked = blockedForThisCourt.includes(slot.id);
              const isSelected = selectedTimeSlots.includes(slot.id);
              const isPast = isPastSlot(slot.startTime);

              let buttonStyle = {
                fontSize: "12px",
                fontWeight: "500",
                border: "none",
                backgroundColor: "",
                color: "white",
                cursor: "pointer",
                opacity: 1,
              };

              if (slot.isBooked) {
                buttonStyle.backgroundColor = '#dc3545';
                buttonStyle.cursor = 'not-allowed';
              } else if (isBlocked) {
                buttonStyle.backgroundColor = '#6c757d';
                buttonStyle.cursor = 'not-allowed';
              } else if (isPast) {
                buttonStyle.backgroundColor = '#adb5bd';
                buttonStyle.cursor = 'not-allowed';
                buttonStyle.opacity = 0.6;
              } else if (isSelected) {
                buttonStyle.backgroundColor = '#198754';
                buttonStyle.border = '2px solid #146c43';
              } else {
                buttonStyle.backgroundColor = '#e9fbe5';
                buttonStyle.border = '2px solid #9adf07';
                buttonStyle.color = '#146c43';
              }

              return (
                <div key={slot.id} className="col-4">
                  <button
                    className="btn w-100 py-3"
                    onClick={() => handleSlotClick(slot)}
                    disabled={slot.isBooked || isBlocked || isPast}
                    style={buttonStyle}
                  >
                    <div style={{ fontSize: '11px' }}>{slot.label}</div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Slots Info */}
          {selectedTimeSlots.length > 0 && (
            <div className="mt-4 p-4 rounded-4 shadow-sm" style={{ background: "#f5f5dc" }}>
              <h5 className="text-success fw-bold mb-3">
                Selected Slots ({selectedTimeSlots.length})
              </h5>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {slots
                  .filter(s => selectedTimeSlots.includes(s.id))
                  .map(s => (
                    <span key={s.id} className="badge bg-success fs-6 px-3 py-2 rounded-pill">
                      {s.label}
                    </span>
                  ))}
              </div>
              <h4 className="mt-3 fw-bold">
                Total Price: ₹{getTotalPrice()}
              </h4>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="row g-2">
          <div className="col-6">
            <button
              className="btn w-100 py-3"
              onClick={handleSlotUnavailable}
              disabled={selectedTimeSlots.length === 0}
              style={{ 
                backgroundColor: '#198754', 
                color: 'white',
                border: 'none',
                fontWeight: '500',
                opacity: selectedTimeSlots.length > 0 ? 1 : 0.6
              }}
            >
              Mark Unavailable ({selectedTimeSlots.length})
            </button>
          </div>
          <div className="col-6">
            <button
              className="btn w-100 py-3"
              onClick={handleBookSlot}
              disabled={selectedTimeSlots.length === 0 || !bookingName || !bookingMobile}
              style={{ 
                backgroundColor: '#198754', 
                color: 'white',
                border: 'none',
                fontWeight: '500',
                opacity: (selectedTimeSlots.length > 0 && bookingName && bookingMobile) ? 1 : 0.6
              }}
            >
              Book Slots ({selectedTimeSlots.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotManagement;