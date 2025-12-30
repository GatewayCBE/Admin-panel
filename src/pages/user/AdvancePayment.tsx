import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SERVICE_FEE = 78;
const ADVANCE_PERCENT = 0.27;

const AdvancePayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Hooks must be called unconditionally
  const [paymentType, setPaymentType] =
    useState<"advance" | "full">("advance");

  const state = location.state as any;

  // ✅ Guard AFTER hooks
  if (!state) {
    return (
      <div className="text-center mt-5 text-danger">
        Invalid payment session
      </div>
    );
  }

  const { turf, selectedSlots, selectedDate, totalPrice } = state;

  const advanceAmount = Math.round(totalPrice * ADVANCE_PERCENT);
  const fullAmount = totalPrice + SERVICE_FEE;

  const payableAmount =
    paymentType === "advance" ? advanceAmount : fullAmount;

  return (
    <div className="min-vh-100 bg-black text-white d-flex justify-content-center align-items-center">
      <div className="card bg-dark text-white p-4 shadow-lg" style={{ width: 420 }}>

        {/* Header */}
        <div className="mb-3">
          <h6 className="fw-semibold">{turf.turf_name}</h6>
          <small className="text-secondary">
            {new Date(selectedDate).toDateString()}
          </small>
          <div className="text-secondary small mt-1">
            🏏 {selectedSlots.length} Slot(s)
          </div>
        </div>

        <hr className="border-secondary" />

        {/* Bill Details */}
        <h6 className="mb-3">Bill Details</h6>

        <div className="d-flex justify-content-between text-secondary mb-2">
          <span>Slot Cost</span>
          <span>₹{totalPrice}</span>
        </div>

        <div className="d-flex justify-content-between text-secondary mb-2">
          <span>Service Fee</span>
          <span>₹{SERVICE_FEE}</span>
        </div>

        <div className="d-flex justify-content-between fw-bold mb-3">
          <span>Total</span>
          <span className="text-primary">₹{fullAmount}</span>
        </div>

        <hr className="border-secondary" />

        {/* Payment Options */}
        <h6 className="mb-3">Payment Options</h6>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <button
              className={`btn w-100 ${
                paymentType === "advance"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setPaymentType("advance")}
            >
              Advance <br /> ₹{advanceAmount}
            </button>
          </div>

          <div className="col-6">
            <button
              className={`btn w-100 ${
                paymentType === "full"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setPaymentType("full")}
            >
              Full Amount <br /> ₹{fullAmount}
            </button>
          </div>
        </div>

        <hr className="border-secondary" />

        {/* Cancellation Policy */}
        <h6>Cancellation Policy</h6>
        <p className="text-secondary small">
          Safe cancellation has expired for this game.
          If you cancel, you will lose the entire amount paid.
        </p>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <strong>₹{payableAmount}</strong>
          <button
            className="btn btn-primary px-4"
            onClick={() =>
              navigate("/user/razorpay", {
                state: {
                  amount: payableAmount,
                  paymentType,
                  bookingPayload: state,
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