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
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.bookingPayload) {
      alert("Invalid booking data");
      navigate(-1);
      return;
    }
    

    /* ===============================
       👤 USER (SINGLE SOURCE OF TRUTH)
    =============================== */
    const user_id = localStorage.getItem("user_id") || "WEB_USER";
    const user_name = localStorage.getItem("user_name") || "Web User";
    const user_mobile_number = localStorage.getItem("user_mobile_number") || "";

    if (!user_mobile_number) {
      alert("Please login again");
      navigate(-1);
      return;
    }

    async function startPayment() {
      try {
        /* ===============================
           1️⃣ CREATE RAZORPAY ORDER
        =============================== */
        const selectedSlots = state.bookingPayload.selectedSlots?.map(
          (s: any) => s.startLabel.trim()
        );

        if (!Array.isArray(selectedSlots) || selectedSlots.length === 0) {
          throw new Error("NO_SLOTS_SELECTED");
        }

        const res = await fetch(CREATE_ORDER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            turf_id: state.bookingPayload.turf.turf_id,
            turf_name: state.bookingPayload.turf.turf_name,
            sport: state.bookingPayload.selectedSport,
            date: state.bookingPayload.selectedDate,
            slots: selectedSlots,
            payment_type: state.paymentType,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create Razorpay order");
        }

        const order = await res.json();
        console.log("Backend pricing snapshot:", order.pricing);

        /* ===============================
           2️⃣ RAZORPAY CHECKOUT
        =============================== */
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: "INR",
          name: "BookYourTurf",
          description: "Turf Slot Booking",
          order_id: order.order_id,

          handler: async (response: any) => {
            /* ===============================
               3️⃣ VERIFY PAYMENT
            =============================== */
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

                user_id,
                user_name,
                user_mobile_number,

                sport: state.bookingPayload.selectedSport,
                court: `court ${state.bookingPayload.selectedCourt}`,
                date: state.bookingPayload.selectedDate,
                slots: state.bookingPayload.selectedSlots.map(
                  (s: any) => s.startLabel
                ),

                payment_type: state.paymentType,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            // ✅ FIX SCROLL LOCK
  document.body.style.overflow = "auto";
  document.documentElement.style.overflow = "auto";

            navigate("/admin/recentbookings");
          },

          prefill: {
            name: user_name,
            contact: user_mobile_number,
          },

          theme: { color: "#198754" },
        };

        new window.Razorpay(options).open();
      } catch (err) {
        console.error(err);
        alert("Unable to complete payment");
        navigate(-1);
      }
    }

    startPayment();
  }, [state, navigate]);

  return null;
};

export default RazorpayPage;
