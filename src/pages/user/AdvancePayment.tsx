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
    <div className="container min-vh-100 d-flex justify-content-center align-items-center mt-5 pt-5">
      <div className="card shadow-sm border-0 rounded-4 p-4" style={{ width: 420 }}>
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
            Pay →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancePayment;
