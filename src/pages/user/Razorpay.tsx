import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  buildBookingEmailMessage,
  buildSMSBookingMessage,
  sendBookingNotifications,
} from "../../services/firestoreService";

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

    const user_id = localStorage.getItem("user_id") || "WEB_USER";
    const user_name = localStorage.getItem("user_name") || "Web User";
    const user_mobile_number = localStorage.getItem("user_mobile_number") || "";
    const user_email = localStorage.getItem("user_email") || "";

    // ✅ Get turf owner data from localStorage
   const owner_name = localStorage.getItem("owner_name") || "";
const owner_email = localStorage.getItem("owner_email") || "";
const owner_mobile = localStorage.getItem("owner_mobile") || "";

console.log("✅ Retrieved owner data:", {
  owner_name,
  owner_email,
  owner_mobile,
});

    console.log("✅ Retrieved owner data:", { owner_name, owner_email, owner_mobile });

    if (!user_mobile_number) {
      alert("Please login again");
      navigate(-1);
      return;
    }

    async function startPayment() {
      try {
        const selectedSlots = state.bookingPayload.selectedSlots?.map(
          (s: any) => s.startLabel.trim()
        );

        if (!Array.isArray(selectedSlots) || selectedSlots.length === 0) {
          throw new Error("NO_SLOTS_SELECTED");
        }

        // ✅ 1️⃣ CREATE ORDER
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

        if (!res.ok) throw new Error("Failed to create Razorpay order");

        const order = await res.json();
        console.log("✅ Order created:", order);

        // ✅ 2️⃣ RAZORPAY CHECKOUT
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: "INR",
          name: "BookYourTurf",
          description: "Turf Slot Booking",
          order_id: order.order_id,

          handler: async (response: any) => {
            try {
              console.log("✅ Payment successful, verifying...");

              // ✅ 3️⃣ VERIFY PAYMENT
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
                  user_email,

                  sport: state.bookingPayload.selectedSport,
                  court: `court ${state.bookingPayload.selectedCourt}`,
                  date: state.bookingPayload.selectedDate,
                  slots: selectedSlots,
                  payment_type: state.paymentType,
                }),
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                console.error("❌ Verification failed:", errData);
                throw new Error(errData.reason || "Payment verification failed");
              }

              console.log("✅ Payment verified, sending notifications...");

              // ✅ 4️⃣ BUILD & SEND NOTIFICATIONS
              const messageData = {
                bookingUserName: user_name,
                turfName: state.bookingPayload.turf.turf_name,
                turfMobile: user_mobile_number,
                sport: state.bookingPayload.selectedSport,
                court: `Court ${state.bookingPayload.selectedCourt}`,
                bookedOn: new Date().toLocaleString(),
                bookingDate: new Date(
                  state.bookingPayload.selectedDate
                ).toDateString(),
                slots: selectedSlots,
                totalAmount: order.pricing.total_amount || order.pricing.totalAmount,
                paidAmount: order.pricing.paid_amount || order.pricing.paidAmount,
                remainingAmount: order.pricing.remaining_amount || order.pricing.balanceAmount,
              };

              const smsMessage = buildSMSBookingMessage(messageData);
              const emailMessage = buildBookingEmailMessage(messageData);

              // ✅ SEND NOTIFICATIONS TO USER AND TURF OWNER
              await sendBookingNotifications({
                // USER
                userPhone: user_mobile_number,
                userEmail: user_email || null,

                // TURF OWNER (PARTNER) - from localStorage
                partnerPhone: owner_mobile || null,
                partnerEmail: owner_email || null,

                smsMessage,
                emailMessage,
              });

              console.log("✅ Notifications sent to user and owner");

              console.log("✅ All done! Navigating...");

              // ✅ FIX SCROLL LOCK
              document.body.style.overflow = "auto";
              document.documentElement.style.overflow = "auto";

              navigate("/user/bookinghistory");
            } catch (err) {
              console.error("❌ Post-payment error:", err);
              alert("Payment successful but notification failed. Please contact support.");
              navigate("/user/bookinghistory");
            }
          },

          prefill: {
            name: user_name,
            contact: user_mobile_number,
            email: user_email,
          },

          theme: { color: "#198754" },
          
          modal: {
            ondismiss: function () {
              console.log("Payment cancelled by user");
              navigate(-1);
            },
          },
        };

        new window.Razorpay(options).open();
      } catch (err) {
        console.error("❌ Payment initiation failed:", err);
        alert("Unable to complete payment");
        navigate(-1);
      }
    }

    startPayment();
  }, [state, navigate]);

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading payment...</span>
      </div>
      <p className="mt-3">Initializing payment gateway...</p>
    </div>
  );
};

export default RazorpayPage;