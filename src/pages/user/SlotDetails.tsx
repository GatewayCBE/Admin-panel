import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTurfById } from "../../services/firestoreService";

const SlotDetails: React.FC = () => {
  const { turfId } = useParams();
  const [turf, setTurf] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTurfById(turfId!);
      setTurf(data);

      // Set default selected date → Today
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    };
    fetchData();
  }, [turfId]);

  if (!turf)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success"></div>
      </div>
    );

  const timings = turf.sport_specific_timing ?? {};
  const prices = turf.sport_specific_price ?? {};
  const images = turf.turf_images ?? [];

  // Utility • Generate time slots based on opening & closing time
  const generateSlots = (start: string, end: string) => {
    if (!start || !end) return [];

    const slots = [];
    let [hour, min] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    while (hour < endHour || (hour === endHour && min < endMin)) {
      const startTime = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;

      let nextHour = hour;
      let nextMin = min + 60;
      if (nextMin >= 60) {
        nextMin -= 60;
        nextHour += 1;
      }

      const endTime = `${nextHour.toString().padStart(2, "0")}:${nextMin
        .toString()
        .padStart(2, "0")}`;

      slots.push({ start: startTime, end: endTime });

      hour = nextHour;
      min = nextMin;
    }

    return slots;
  };

  // Use the FIRST available sport for booking UI
  const firstSport = Object.keys(timings)[0];
  const sportTiming = timings[firstSport];

  const allSlots = [
    ...generateSlots(sportTiming.day_start_time, sportTiming.day_end_time),
    ...generateSlots(sportTiming.night_start_time, sportTiming.night_end_time),
  ];

  return (
    <div className="container py-4">

      {/* Turf Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-success">{turf.turf_name}</h2>
        <p className="text-muted">{turf.turf_location}</p>
      </div>

      {/* Turf Image */}
      {images.length > 0 && (
        <img
          src={images[0]}
          className="img-fluid rounded mb-4 shadow-sm"
          alt=""
          style={{ maxHeight: "280px", objectFit: "cover", width: "100%" }}
        />
      )}

      {/* Date Picker */}
      <div className="mb-4">
        <h4 className="fw-bold">Select Date</h4>
        <input
          type="date"
          className="form-control form-control-lg"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Slots Section */}
      <div className="mb-4">
        <h4 className="fw-bold">Available Slots ({firstSport})</h4>

        <div className="row g-3 mt-2">
          {allSlots.length === 0 ? (
            <p className="text-muted">No slots available</p>
          ) : (
            allSlots.map((slot, index) => {
              const isSelected =
                selectedSlot &&
                selectedSlot.start === slot.start &&
                selectedSlot.end === slot.end;

              return (
                <div className="col-6 col-md-4 col-lg-3" key={index}>
                  <div
                    className={`border rounded p-3 text-center selectable-slot 
                      ${isSelected ? "bg-success text-white" : "bg-light"}
                    `}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <strong>{slot.start}</strong> - {slot.end}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <h4 className="fw-bold">Pricing</h4>

        {prices[firstSport] && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Day</th>
                <th>Day Price</th>
                <th>Night Price</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(prices[firstSport]).map(
                ([day, price]: any, index) => (
                  <tr key={index}>
                    <td className="fw-bold">{day}</td>
                    <td>₹{price.day}</td>
                    <td>₹{price.night}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Book Now */}
      <div className="text-center my-5">
        <button
          className="btn btn-success btn-lg px-5"
          disabled={!selectedSlot}
          onClick={() =>
            alert(
              `Booking confirmed for ${selectedDate} from ${selectedSlot.start} to ${selectedSlot.end}`
            )
          }
        >
          {selectedSlot ? "Book Slot →" : "Select a Slot"}
        </button>
      </div>
    </div>
  );
};

export default SlotDetails;
