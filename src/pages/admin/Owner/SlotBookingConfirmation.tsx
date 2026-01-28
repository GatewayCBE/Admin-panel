import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  bookSlot, 
  buildWhatsAppBookingMessage, 
  shareBookingViaWhatsApp,
  buildBookingEmailMessage,
  sendBookingEmail
} from "../../../services/firestoreService";


const SlotBookingConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [paidAmount, setPaidAmount] = useState(0);
  const [markPaid, setMarkPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
 const channelPartnerEmail = localStorage.getItem("user_email") || "";
console.log('channelPartnerEmail',channelPartnerEmail);

  if (!state) return <div className="text-center mt-5">No booking data</div>;

  const {
    turfId,
    turfName,
    bookingName,
    bookingMobile,
    sport,
    court,
    date,
    slot,
    price,
    ownerId
  } = state;

  const remaining = Math.max(price - paidAmount, 0);

const handleConfirmBooking = async () => {
  
  try {
     console.log("🚀 Starting booking process...");
    const bookedOn = new Date().toLocaleString();

    // 1️⃣ Save slot booking to Firestore
    await bookSlot({
      turfId,
      date,
      sport,
      court,
      slot,
      bookingName,
      bookingMobile,
      price,
      paidAmount,
      unpaidAmount: remaining,
      ownerId
    });
 console.log("✅ Slot booking saved to Firestore");
    // 2️⃣ Build Email Message
    const emailMessage = buildBookingEmailMessage({
      bookingUserName: bookingName,
      turfName,
      turfMobile: "N/A",
      sport,
      court,
      bookedOn,
      bookingDate: new Date(date).toDateString(),
      slots: [slot.label],
      totalAmount: price,
      paidAmount,
      remainingAmount: remaining
    });
 console.log("📝 Email message prepared");
    // 3️⃣ Send Email to Channel Partner
    if (channelPartnerEmail) {
      await sendBookingEmail(
        channelPartnerEmail,
        "New Turf Booking Confirmation",
        emailMessage
      );
    }

    // 4️⃣ Show Success Modal
    setShowModal(true);
console.log("🎉 Booking flow completed");
  } catch (err) {
    console.error(err);
    alert("Booking failed");
  }
};


const handleShareWhatsApp = () => {
  const message = buildWhatsAppBookingMessage({
    bookingUserName: bookingName,
    turfName,
    turfMobile: "N/A",
    sport,
    court,
    bookedOn: new Date().toLocaleString(),
    bookingDate: new Date(date).toDateString(),
    slots: [slot.label],
    totalAmount: price,
    paidAmount,
    remainingAmount: remaining
  });

  shareBookingViaWhatsApp(bookingMobile, message);
};




  return (
    <div className="container mt-5 pt-5">
      <div className="card shadow-lg p-4 rounded-4">

        <h3 className="text-success fw-bold text-center mb-4">Booking Confirmation</h3>

        <div className="mb-3"><strong>Booking Date:</strong> {date}</div>
        <div><strong>Turf Name:</strong> {turfName}</div>
        <div><strong>Booking User:</strong> {bookingName}</div>
        <div><strong>Mobile Number:</strong> {bookingMobile}</div>
        <div><strong>Sport:</strong> {sport}</div>
        <div><strong>Court:</strong> {court}</div>

        <div className="card mt-3 p-3 rounded-4 bg-light">
          <h5 className="fw-bold">Selected Date & Time</h5>
          <div>{slot.label}</div>
        </div>

        <hr />

        <h4 className="text-end text-success fw-bold">Total Amount ₹ {price}</h4>

        {/* Paid Amount */}
        <div className="mt-3">
          <label className="fw-semibold">Paid Amount</label>
          <div className="input-group">
            <span className="input-group-text">₹</span>
            <input
              type="number"
              className="form-control"
              value={paidAmount}
              max={price}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Remaining */}
        <h5 className="mt-3 text-danger">
          Remaining Amount ₹ {remaining}
        </h5>

        {/* Mark as Paid */}
        {/* {remaining > 0 && (
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={markPaid}
              onChange={(e) => setMarkPaid(e.target.checked)}
              id="markPaid"
            />
            <label className="form-check-label" htmlFor="markPaid">
              Mark as Fully Paid
            </label>
          </div>
        )} */}

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-danger px-4" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-success px-4" onClick={handleConfirmBooking}>
            Confirm Booking
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="modal show fade d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4 rounded-4">
              <h4 className="text-success fw-bold">Booking Confirmed!</h4>
              <p>Booking successfully </p>
              <button
                className="btn btn-success w-100 me-2"
                // onClick={() => navigate("/owner/slotmanagement")}
  onClick={handleShareWhatsApp}              >
                SHARE VIA WHATSAPP
              </button>
               <button
                className="btn rounded-fill w-100"
                onClick={() => navigate("/owner/channelpartnerdashboard")}
              >
                No, Thanks
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SlotBookingConfirmation;
