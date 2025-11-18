import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllDatesAndSlots, BookedSlot } from "../../../services/firestoreService";

type Court = {
  court: string;
  slots: BookedSlot[];
};

type SportGroup = {
  sport: string;
  courts: Court[];
};

type DateGroup = {
  date: string;
  sports: SportGroup[];
};

const BookedSlots = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [data, setData] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!turfId) return;

    const fetchData = async () => {
      setLoading(true);
      const result = await getAllDatesAndSlots(turfId);
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [turfId]);

  // Calculating dynamic totals
  const allSlots = data.flatMap(d =>
    d.sports.flatMap(s =>
      s.courts.flatMap(c => c.slots)
    )
  );

  const totalSlots = allSlots.length;
  const bookedSlots = allSlots.filter((slot: BookedSlot) => slot.payment_status === "paymentSuccess").length;
  const totalRevenue = allSlots.reduce((acc: number, slot: BookedSlot) => acc + (slot.paid_amount || 0), 0);
  const pendingAmount = allSlots.reduce((acc: number, slot: BookedSlot) => acc + (slot.unpaid_amount || 0), 0);

  if (loading) return <p>Loading booked slots...</p>;
  if (!data.length) return <p>No bookings found yet.</p>;
  console.log("📥 getAllDatesAndSlots Response:", data);
  console.log("📢 Fetching slots for", turfId);


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Booked Slots - Turf #{turfId}</h4>
      </div>

      {/* Summary */}
      <div className="row g-4">
        <StatCard title="Total Slots" value={totalSlots} bg="primary" />
        <StatCard title="Booked Slots" value={bookedSlots} bg="success" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} bg="info" />
        <StatCard title="Pending Amount" value={`₹${pendingAmount}`} bg="warning" />
      </div>

      <div className="mt-4"></div>

      {/* Display data grouped by date → sport → courts */}
      {data.map(({ date, sports }) => (
        <div key={date} className="mt-4">
          <h5 className="text-primary">{date}</h5>

          {sports.map(({ sport, courts }: any) => (
            <div key={sport} className="mt-3">
              <h6 className="text-secondary ps-3">{sport}</h6>

              {courts.map(({ court, slots }: any) => (
                <div key={court} className="mt-2">
                  <small className="ps-3 fw-bold">{court}</small>
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Booking ID</th>
                        <th>User</th>
                        <th>Time</th>
                        <th>Paid</th>
                        <th>Pending</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot: any) => (
                        <tr key={slot.time}>
                          <td>{slot.booking_id}</td>
                          <td>{slot.booking_username}</td>
                          <td>{slot.time}</td>
                          <td>₹{slot.paid_amount}</td>
                          <td>₹{slot.unpaid_amount}</td>
                          <td>
                            <span
                              className={`badge ${
                                slot.payment_status === "paymentSuccess"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {slot.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, bg }: { title: string; value: any; bg: string }) => (
  <div className="col-md-6 col-lg-3">
    <div className={`card bg-${bg} text-white`}>
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <h3 className="mb-0">{value}</h3>
      </div>
    </div>
  </div>
);

export default BookedSlots;
