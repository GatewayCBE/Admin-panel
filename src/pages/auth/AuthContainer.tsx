// src/components/AuthContainer.tsx
import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { saveUserProfile, isMobileRegistered } from "../../services/firestoreService";

// Fix TypeScript globals
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    grecaptcha?: any;
  }
}

const AuthContainer: React.FC = () => {
  const [isUser, setIsUser] = useState(true);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const currentRole = isUser ? "User" : "Owner";

  // Correct reCAPTCHA setup (auth first!)
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,  // ← First: auth instance
        "recaptcha-container",  // ← Second: container ID
        {  // ← Third: options
          size: "invisible",
          callback: () => console.log("reCAPTCHA solved"),
          "expired-callback": () => console.log("reCAPTCHA expired"),
        }
      );

      // Pre-render (important for reliability)
      window.recaptchaVerifier.render().catch(err => console.error(err));
    }

    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const handleRoleChange = (user: boolean) => {
    setIsUser(user);
    setStep("phone");
    setMobile("");
    setOtp("");
    setError(null);
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const phone = mobile.trim();
    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
      setError("Invalid Indian number");
      setLoading(false);
      return;
    }

    try {
      const exists = await isMobileRegistered(phone);
      if (exists) {
        setError("Already registered");
        setLoading(false);
        return;
      }

      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier!);
      setConfirmationResult(result);
      setStep("otp");
      alert("OTP sent!");
    } catch (err: any) {
      console.error("OTP Error:", err);
      setError(err.message || "Failed to send OTP");
      window.recaptchaVerifier?.render().then(id => window.grecaptcha?.reset(id));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || otp.length !== 6) return;

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const name = prompt("Enter your name:", currentRole)?.trim() || currentRole;

      if (name.length < 3) throw new Error("Name too short");

      await saveUserProfile(isUser ? "user" : "owner", {
        name,
        email: "",
        mobile,
        uid: result.user.uid,
      });

      alert("Registered successfully!");
      setStep("phone");
      setMobile("");
      setOtp("");
    } catch (err: any) {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">

          {/* Role Toggle */}
          <div className="d-flex mb-4 rounded overflow-hidden shadow-sm">
            <button
              className={`btn flex-fill py-3 ${isUser ? "btn-success text-white" : "btn-light"}`}
              onClick={() => handleRoleChange(true)}
              disabled={loading}
            >
              <strong>User</strong>
            </button>
            <button
              className={`btn flex-fill py-3 ${!isUser ? "btn-success text-white" : "btn-light"}`}
              onClick={() => handleRoleChange(false)}
              disabled={loading}
            >
              <strong>Owner</strong>
            </button>
          </div>

          {error && <div className="alert alert-danger text-center">{error}</div>}

          <div className="card shadow">
            <div className="card-body text-center p-5">

              {step === "phone" && (
                <>
                  <h3 className="text-success mb-4">{currentRole} Registration</h3>
                  <form onSubmit={sendOtp}>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="form-control form-control-lg mb-3"
                      placeholder="+919876543210"
                      required
                      disabled={loading}
                    />
                    <button type="submit" className="btn btn-success btn-lg w-100" disabled={loading}>
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                </>
              )}

              {step === "otp" && (
                <>
                  <h3 className="text-success mb-4">Enter OTP</h3>
                  <p className="text-muted">Sent to {mobile}</p>
                  <form onSubmit={verifyOtp}>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="form-control form-control-lg text-center mb-3"
                      placeholder="123456"
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                    <button type="submit" className="btn btn-success btn-lg w-100" disabled={loading}>
                      Verify & Register
                    </button>
                  </form>
                  <button className="btn btn-link" onClick={() => setStep("phone")}>
                    Change Number
                  </button>
                </>
              )}

              {/* REQUIRED for reCAPTCHA */}
              {/* <div id="recaptcha-container"></div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;