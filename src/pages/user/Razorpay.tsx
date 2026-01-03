import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CREATE_ORDER_URL =
  "https://createwebrazorpayorder-4btnxmrc4q-el.a.run.app";
const VERIFY_PAYMENT_URL =
  "https://verifywebrazorpaypayment-4btnxmrc4q-el.a.run.app";

const RazorpayPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) return;

    async function startPayment() {
      try {
        /* 1️⃣ Create Order */
        const res = await fetch(CREATE_ORDER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            turf_id: state.bookingPayload.turf.turf_id,
            slots: state.bookingPayload.selectedSlots.map((s: any) =>
              s.startLabel.replace(/\s/g, "")
            ),
            payment_type: state.paymentType,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create order");
        }

        const order = await res.json();

        /* 2️⃣ Open Razorpay */
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "BookYourTurf",
          description: "Turf Slot Booking",
          order_id: order.order_id,

          handler: async (response: any) => {
            /* 3️⃣ Verify Payment */
            const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature,

  turf_id: state.bookingPayload.turf.turf_id,
  turf_name: state.bookingPayload.turf.turf_name,
  owner_id: state.bookingPayload.turf.owner_id,

  user_id: localStorage.getItem("user_id"),
  user_name: localStorage.getItem("user_name"),
  user_mobile: localStorage.getItem("user_mobile"),

  sport: state.bookingPayload.selectedSport,
  court: `court ${state.bookingPayload.selectedCourt}`,

  date: new Date(state.bookingPayload.selectedDate)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-"),

  slots: state.bookingPayload.selectedSlots.map((s: any) =>
    s.startLabel.replace(/\s/g, "")
  ),

  payment_type: state.paymentType,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            navigate("/success");
          },

          prefill: {
            name: localStorage.getItem("user_name") || "",
          },

          theme: { color: "#198754" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("❌ Payment failed:", err);
        alert("Unable to start payment. Please try again.");
        navigate(-1);
      }
    }

    startPayment();
  }, [state, navigate]);

  return null;
};

export default RazorpayPage;
