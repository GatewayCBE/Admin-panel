import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SERVICE_FEE_PER_SLOT = 10;
const ADVANCE_PER_SLOT = 1;

const AdvancePayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentType, setPaymentType] =
    useState<"advance" | "full">("advance");

  const state = location.state as any;

  if (!state) {
    return (
      <div className="text-center mt-5 text-danger">
        Invalid payment session
      </div>
    );
  }

  const {
    turf,
    selectedSlots,
    selectedDate,
    totalPrice,
  } = state;

  const slotCount = selectedSlots.length;

  /* ===============================
     💰 Price Calculations
     =============================== */
  const serviceFee = SERVICE_FEE_PER_SLOT * slotCount;
  const fullAmount = totalPrice + serviceFee;
  const advanceAmount = ADVANCE_PER_SLOT * slotCount;

  const payableAmount =
    paymentType === "advance" ? advanceAmount : fullAmount;

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card shadow-sm border-0 rounded-4 p-4"
        style={{ width: 420 }}
      >
        {/* Header */}
        <div className="mb-3">
          <h5 className="fw-bold text-success mb-1">
            {turf.turf_name}
          </h5>
          <small className="text-muted">
            {new Date(selectedDate).toDateString()}
          </small>
          <div className="text-muted small mt-1">
            🎟 {slotCount} Slot(s)
          </div>
        </div>

        <hr />

        {/* Bill Details */}
        <h6 className="fw-semibold mb-3">Bill Details</h6>

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Slot Cost</span>
          <span>₹{totalPrice}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">
            Service Fee (₹{SERVICE_FEE_PER_SLOT} × {slotCount})
          </span>
          <span>₹{serviceFee}</span>
        </div>

        <div className="d-flex justify-content-between fw-bold mt-2">
          <span>Total</span>
          <span className="text-success">₹{fullAmount}</span>
        </div>

        <hr />

        {/* Payment Options */}
        <h6 className="fw-semibold mb-3">Payment Options</h6>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <button
              className={`btn w-100 ${
                paymentType === "advance"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => setPaymentType("advance")}
            >
              Advance
              <div className="small">₹{advanceAmount}</div>
            </button>
          </div>

          <div className="col-6">
            <button
              className={`btn w-100 ${
                paymentType === "full"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => setPaymentType("full")}
            >
              Full Amount
              <div className="small">₹{fullAmount}</div>
            </button>
          </div>
        </div>

        <hr />

        {/* Cancellation Policy */}
        <h6 className="fw-semibold">Cancellation Policy</h6>
        <p className="text-muted small mb-4">
          Safe cancellation has expired for this game.
          If you cancel, the paid amount will not be refunded.
        </p>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center">
          <strong>₹{payableAmount}</strong>
          <button
            className="btn btn-success px-4"
            onClick={() =>
              navigate("/user/razorpay", {
                state: {
                  amount: payableAmount,
                  paymentType,
                  bookingPayload: {
      ...state,
      date: new Date(state.selectedDate)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-"), // ✅ "04-Jan-2026"
    },
                },
              })
            }
          >
            Pay →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancePayment;
