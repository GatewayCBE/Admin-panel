import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RazorpayPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) return;

    const options = {
      key: "RAZORPAY_KEY_ID", // test or live key
      amount: state.amount * 100, // paise
      currency: "INR",
      name: "Turf Booking",
      description: "Advance Payment",
      handler: function (response: any) {
        console.log("Payment Success", response);

        // ✅ After success → create booking
        navigate("/success");
      },
      prefill: {
        name: localStorage.getItem("user_name") || "",
        email: "test@email.com",
      },
      theme: {
        color: "#198754",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [state, navigate]);

  return null;
};

export default RazorpayPage;
