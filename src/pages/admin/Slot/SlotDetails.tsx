import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

interface SlotData {
  id: string;
  slot_start_time?: string;
  booking_username?: string;
  payment_status?: string;
  booked_sports_name?: string;
  booking_id?: string;
  court?: string;
  sport?: string;
  date?: string;
  paid_amount?: number;
  total_amount?: number;
  turf_name?: string;
  owner_id?: string;
  [key: string]: any;
}

const SlotDetails: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isDateFiltered, setIsDateFiltered] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!turfId) {
        setError("Turf ID is missing");
        setLoading(false);
        return;
      }

      try {
        const slotsArr: SlotData[] = [];
        const today = new Date();
        const dateRange: string[] = [];

        for (let i = -60; i <= 60; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const day = String(date.getDate()).padStart(2, "0");
          const month = date.toLocaleString("en-US", { month: "short" });
          const year = date.getFullYear();
          dateRange.push(`${day}-${month}-${year}`);
        }

        const sportsToCheck = [
          "volleyball",
          "cricket",
          "football",
          "badminton",
          "tennis",
          "basketball",
        ];
        const courtPatterns = [
          "court 1",
          "court 2",
          "court 3",
          "court 4",
          "court 5",
        ];

        for (const dateId of dateRange) {
          for (const sportId of sportsToCheck) {
            const promises = courtPatterns.map(async (courtName) => {
              const slotPath = `environment/testing/all_turfs_slot_booking/${turfId}/${dateId}/${sportId}/${courtName}`;
              const slotsRef = collection(db, slotPath);
              const snapshot = await getDocs(slotsRef);
              snapshot.forEach((doc) => {
                slotsArr.push({
                  id: doc.id,
                  ...doc.data(),
                  date: dateId,
                  sport: sportId,
                  court: courtName,
                } as SlotData);
              });
            });
            await Promise.all(promises);
          }
        }

        setSlots(slotsArr);
        setFilteredSlots(slotsArr);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [turfId]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleApplyFilter = () => {
    if (selectedDate && selectedDate.length === 10) {
      const formattedDate = formatDate(selectedDate);
      const filtered = slots.filter((slot) => slot.date === formattedDate);
      setFilteredSlots(filtered);
      setIsDateFiltered(true);
    }
  };

  const handleBackToAllSlots = () => {
    setSelectedDate("");
    setFilteredSlots(slots);
    setIsDateFiltered(false);
  };

  // Get background color based on slot status
  const getCardColor = (slot: SlotData) => {
    if (slot.booking_username) return "bg-danger text-white";
    if (slot.payment_status === "unavailable") return "bg-secondary text-white";
    return "bg-success text-white";
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h2 className="text-center text-success fw-bold mb-4">
          Loading Slots...
        </h2>
        <div className="row">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm h-100 p-3">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 mb-2"></span>
                  <span className="placeholder col-7 mb-2"></span>
                  <span className="placeholder col-4 mb-2"></span>
                  <span className="placeholder col-8 mb-2"></span>
                  <span className="placeholder col-5"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (filteredSlots.length === 0 && isDateFiltered) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning mb-3">No slots found for this date.</div>
        <button className="btn btn-success" onClick={handleBackToAllSlots}>
          🔙 Back to All Slots
        </button>
      </div>
    );
  }

  const getSlotTimeRange = (startTime?: string): string => {
    if (!startTime) return "Time not available";

    try {
      // If time is in 24-hour format (e.g., "15:00")
      if (/^\d{1,2}:\d{2}$/.test(startTime)) {
        const [h, m] = startTime.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m);
        date.setMinutes(date.getMinutes() + 60);

        const endHours = date.getHours().toString().padStart(2, "0");
        const endMinutes = date.getMinutes().toString().padStart(2, "0");

        return `${startTime} - ${endHours}:${endMinutes}`;
      }

      // If time is in 12-hour format (e.g., "3:00 PM")
      const [time, meridian] = startTime.trim().split(" ");
      if (!time || !meridian) return startTime;

      let [hours, minutes] = time.split(":").map(Number);
      if (meridian.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes);
      date.setMinutes(date.getMinutes() + 60);

      let endHours = date.getHours();
      const endMeridian = endHours >= 12 ? "PM" : "AM";
      endHours = endHours % 12 || 12;
      const endMinutes = date.getMinutes().toString().padStart(2, "0");

      const endTime = `${endHours}:${endMinutes} ${endMeridian}`;
      return `${startTime} - ${endTime}`;
    } catch {
      return startTime;
    }
  };





  return (
    <div className="container py-4">
      <h2 className="text-center text-success fw-bold mb-4">Slots for Turf</h2>

      {/* Date Filter */}
      <div className="d-flex justify-content-center mb-4 gap-3 align-items-center flex-wrap">
        <h2 className="text-success mb-0">Choose Booking Date</h2>
        <input
          type="date"
          className="form-control w-auto border-success"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <button
          className="btn btn-success"
          onClick={handleApplyFilter}
          disabled={!selectedDate || selectedDate.length !== 10}
        >
          🔍 Filter
        </button>
        {isDateFiltered && (
          <button className="btn btn-outline-success" onClick={handleBackToAllSlots}>
            Reset
          </button>
        )}
      </div>

      {/* Slot Cards */}
      <div className="row">
        {filteredSlots.map((slot, idx) => (
          <div key={idx} className="col-md-6 col-lg-4 mb-3">
            <div
              className={`card shadow-sm h-100 cursor-pointer ${getCardColor(slot)}`}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedSlot(slot)}
            >
              <div className="card-header bg-light text-dark">
                <strong>⏰ {getSlotTimeRange(slot.slot_start_time)}</strong>
              </div>
              <div className="card-body">
                <div className="mb-1">
                  <strong>Sport:</strong> {slot.sport}
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Slot Details */}
      {selectedSlot && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setSelectedSlot(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Slot Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedSlot(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  {Object.entries(selectedSlot).map(([key, value]) => (
                    <div key={key} className="col-md-6">
                      <div className="border rounded p-2 bg-light">
                        <strong className="text-capitalize">
                          {key.replace(/_/g, " ")}:
                        </strong>
                        <div className="text-secondary">{String(value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedSlot(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotDetails;