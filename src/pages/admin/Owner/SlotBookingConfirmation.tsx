import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  bookSlot,
  buildWhatsAppBookingMessage,
  shareBookingViaWhatsApp,
  buildBookingEmailMessage,
  buildSMSBookingMessage,
  sendBookingNotifications,
} from "../../../services/firestoreService";

interface BookingSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

const SlotBookingConfirmation = () => {
  const location = useLocation();
  const state = location.state as {
    turfId: string;
    turfName: string;
    bookingName: string;
    bookingMobile: string;
    sport: string;
    court: string;
    date: string;
    slots: BookingSlot[];
    totalPrice: number;
    ownerId: string;
  };

  const navigate = useNavigate();

  const [paidAmount, setPaidAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const channelPartnerEmail = localStorage.getItem("user_email") || "";
  const channelPartnerPhone = localStorage.getItem("user_mobile_number") || "";

  if (!state) return <div className="text-center mt-5">No booking data</div>;

  const {
    turfId,
    turfName,
    bookingName,
    bookingMobile,
    sport,
    court,
    date,
    slots = [],
    totalPrice = 0,
    ownerId,
  } = state;

  const remaining = Math.max(totalPrice - paidAmount, 0);

  const handleConfirmBooking = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const bookedOn = new Date().toLocaleString();
      const bookingDate = new Date(date).toDateString();

      console.log("📝 Creating bookings for slots:", slots);

      // ✅ FIX: Book all slots together (not individually)
      const allSlotsData = {
        turfId,
        date,
        sport,
        court,
        slots: slots,
        bookingName,
        bookingMobile,
        price: totalPrice,
        paidAmount: paidAmount,
        unpaidAmount: remaining,
        ownerId,
      };

      await bookSlot(allSlotsData);

      // ✅ Build messages with VALIDATED data
      const messageData = {
        bookingUserName: bookingName,
        turfName,
        turfMobile: bookingMobile,
        sport,
        court,
        bookedOn,
        bookingDate,
        slots: slots.map((s) => s.label),
        totalAmount: totalPrice,
        paidAmount: paidAmount,
        remainingAmount: remaining,
      };

      const smsMessage = buildSMSBookingMessage(messageData);
      const emailMessage = buildBookingEmailMessage(messageData);

      // ✅ Send notifications
      console.log("📤 Sending notifications...");
      
      await sendBookingNotifications({
        userPhone: bookingMobile,
        userEmail: channelPartnerEmail || null,
        partnerPhone: channelPartnerPhone || undefined,
        partnerEmail: channelPartnerEmail || null,
        smsMessage,
        emailMessage,
      });

      console.log("✅ Booking and notifications completed");
      
      // Show WhatsApp share modal
      setShowModal(true);
    } catch (err) {
      console.error("❌ Booking failed:", err);
      alert("Booking failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = buildWhatsAppBookingMessage({
      bookingUserName: bookingName,
      turfName,
      turfMobile: bookingMobile,
      sport,
      court,
      bookedOn: new Date().toLocaleString(),
      bookingDate: new Date(date).toDateString(),
      slots: slots.map((s) => s.label),
      totalAmount: totalPrice,
      paidAmount,
      remainingAmount: remaining,
    });

    shareBookingViaWhatsApp(bookingMobile, message);
    
    // Close modal and navigate
    setShowModal(false);
    navigate("/owner/channelpartnerdashboard");
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="card shadow-lg p-4 rounded-4">
        <h3 className="text-success fw-bold text-center mb-4">
          Booking Confirmation
        </h3>

        <div>
          <strong>Booking Date:</strong> {date}
        </div>
        <div>
          <strong>Turf Name:</strong> {turfName}
        </div>
        <div>
          <strong>Booking User:</strong> {bookingName}
        </div>
        <div>
          <strong>Mobile Number:</strong> {bookingMobile}
        </div>
        <div>
          <strong>Sport:</strong> {sport}
        </div>
        <div>
          <strong>Court:</strong> {court}
        </div>

        {/* ✅ MULTIPLE SLOTS DISPLAY */}
        <div className="card mt-3 p-3 rounded-4 bg-light">
          <h5 className="fw-bold">Selected Time Slots ({slots.length})</h5>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {slots.map((s, i) => (
              <span
                key={i}
                className="badge bg-success fs-6 px-3 py-2 rounded-pill"
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <hr />

        <h4 className="text-end text-success fw-bold">
          Total Amount ₹{totalPrice}
        </h4>

        <div className="mt-3">
          <label className="fw-semibold">Paid Amount</label>
          <div className="input-group">
            <span className="input-group-text">₹</span>
            <input
              type="number"
              className="form-control"
              value={paidAmount}
              max={totalPrice}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
          </div>
        </div>

        <h5 className="mt-3 text-danger">Remaining Amount ₹{remaining}</h5>

        <div className="d-flex justify-content-between mt-4">
          <button
            className="btn btn-danger px-4"
            onClick={() => navigate(-1)}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="btn btn-success px-4"
            onClick={handleConfirmBooking}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Booking"}
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show fade d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4 rounded-4">
              <h4 className="text-success fw-bold">Booking Confirmed!</h4>
              <p>{slots.length} slot(s) booked successfully</p>
              {/* <p className="text-muted small">
                SMS and Email notifications have been sent
              </p> */}

              <button
                className="btn btn-success w-100 mb-2"
                onClick={handleShareWhatsApp}
              >
                📱 SHARE VIA WHATSAPP
              </button>

              <button
                className="btn btn-outline-secondary w-100"
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