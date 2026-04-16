import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOwnerById } from "../../services/firestoreService";

const ADVANCE_PER_SLOT = 200;

const AdvancePayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ALWAYS declare hooks first
  const [paymentType, setPaymentType] =
    useState<"advance" | "full">("advance");

  // ✅ Safe access to state
  const state = location.state as any | null;

  const turf = state?.turf;
  console.log('turfs',turf);
  
  const selectedSlots = state?.selectedSlots || [];
  const selectedDate = state?.selectedDate;
  const totalPrice = state?.totalPrice || 0;

  // ✅ STORE OWNER DATA (SAFE)

useEffect(() => {
  if (!turf?.owner_id) return;

  const loadOwner = async () => {
    const owner = await getOwnerById(turf.owner_id);

    if (!owner) {
      console.warn("⚠️ Owner not found for turf:", turf.turf_name);
      return;
    }

    localStorage.setItem("owner_name", owner.owner_name);
    localStorage.setItem("owner_email", owner.owner_email || "");
    localStorage.setItem("owner_mobile", owner.owner_mobile_number);

    console.log("✅ Stored owner data in localStorage:", {
      name: owner.owner_name,
      email: owner.owner_email,
      mobile: owner.owner_mobile_number,
    });
  };

  loadOwner();
}, [turf]);

  // ✅ NOW conditional UI is allowed
  if (!state || !turf || !selectedDate) {
    return (
      <div className="text-center mt-5 text-danger">
        Invalid payment session
      </div>
    );
  }

  const slotCount = selectedSlots.length;
  const fullAmount = totalPrice;
  const advanceAmount = ADVANCE_PER_SLOT * slotCount;

  const payableAmount =
    paymentType === "advance" ? advanceAmount : fullAmount;

  return (
  <div className="container py-4" style={{ maxWidth: "600px" }}>
    
    {/* 🔙 Back */}
    <div className="mb-3">
      <button className="btn btn-link text-success p-0" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>

    {/* 🟢 Booked On */}
    <div className="p-3 mb-3 rounded-4 border" style={{ background: "#f6f9f3" }}>
      <div className="text-muted small">Booked On</div>
      <div className="fw-bold">
        {new Date(selectedDate).toDateString()}
      </div>
    </div>

    {/* 📅 Booking Details */}
    <div className="p-3 mb-4 rounded-4 shadow-sm border">
      <h6 className="fw-bold mb-2">Booking Date & Time</h6>

      <div className="mb-1">
        📅 {new Date(selectedDate).toDateString()}
      </div>

      <div>
        ⏰ {selectedSlots[0]?.startLabel} - {selectedSlots[selectedSlots.length - 1]?.endLabel}
      </div>
    </div>

    {/* 💳 Payment Options */}
    <div className="d-flex gap-3 mb-4">
      
      {/* FULL */}
      <div
        onClick={() => setPaymentType("full")}
        style={{
          flex: 1,
          cursor: "pointer",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
          background:
            paymentType === "full" ? "#7aa52c" : "#f5f5f5",
          color: paymentType === "full" ? "#fff" : "#000",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="fw-bold">Pay Full Amount</div>
        <div className="fs-5 fw-bold">₹ {fullAmount}</div>
        <small>(incl. ₹0 fee/slot)</small>
      </div>

      {/* ADVANCE */}
      <div
        onClick={() => setPaymentType("advance")}
        style={{
          flex: 1,
          cursor: "pointer",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
          background:
            paymentType === "advance" ? "#7aa52c" : "#f5f5f5",
          color: paymentType === "advance" ? "#fff" : "#000",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="fw-bold">Pay Advance Amount</div>
        <div className="fs-5 fw-bold">₹ {advanceAmount}</div>
        <small>(incl. ₹0 fee/slot)</small>
      </div>
    </div>

    {/* 💰 Bill Breakdown */}
    <div className="p-3 rounded-4 border mb-4">
      <div className="d-flex justify-content-between mb-2">
        <span>Turf Amount:</span>
        <span>₹ {fullAmount}</span>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span>Gateway Fee (₹0 × {slotCount} slots):</span>
        <span>₹ 0</span>
      </div>

      <hr />

      <div className="d-flex justify-content-between fw-bold">
        <span>Total Pay Now</span>
        <span className="text-success">₹ {payableAmount}</span>
      </div>
    </div>

    {/* ✅ Confirm */}
    <button
      className="btn w-100 mb-3"
      style={{
        background: "#7aa52c",
        color: "#fff",
        padding: "12px",
        borderRadius: "12px",
        fontWeight: 600,
      }}
      onClick={() =>
        navigate("/user/razorpay", {
          state: {
            amount: payableAmount,
            paymentType,
            bookingPayload: {
              ...state,
              date: new Date(selectedDate)
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(/ /g, "-"),
            },
          },
        })
      }
    >
      CONFIRM BOOKING
    </button>

    {/* ❌ Cancel */}
    <button
      className="btn w-100"
      style={{
        background: "#e53935",
        color: "#fff",
        padding: "12px",
        borderRadius: "12px",
        fontWeight: 600,
      }}
      onClick={() => navigate(-1)}
    >
      CANCEL
    </button>
  </div>
);
};

export default AdvancePayment;
