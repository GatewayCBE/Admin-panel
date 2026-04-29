// src/pages/auth/AdminLogin.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
} from "firebase/auth";
import BgImg from "../../assets/BgImg.jpeg";

// ✅ UID → role map
const ADMIN_UID_MAP: Record<string, string> = {
  "OPuLEAEfkiUA0LVoholLaenj0OU2": "super_admin",
  "0BAmu3b2CEYbWzLWfLBAq0LFd1V2": "accounting",
  "74C4TR8mrpdoHGZHRCFJyUSJQff1": "edit",
};

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const recaptchaRef = useRef<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [resolver, setResolver] = useState<any>(null);
  const [verificationId, setVerificationId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Final successful login
  const completeLogin = (uid: string) => {
    const role = ADMIN_UID_MAP[uid];

    if (!role) {
      setError("This account is not authorised as admin.");
      return;
    }

    localStorage.setItem("user_uid", uid);
    localStorage.setItem("user_email", email.trim().toLowerCase());
    localStorage.setItem("user_role", role);
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem("auth_token", "admin_logged_in");

    navigate("/dashboard", { replace: true });
  };

  // ✅ Step 1 Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      // If no MFA
      completeLogin(userCredential.user.uid);

    } catch (err: any) {
      // MFA required
      if (err.code === "auth/multi-factor-auth-required") {
        try {
          const mfaResolver = getMultiFactorResolver(auth, err);
          setResolver(mfaResolver);

          // Destroy old captcha
          if (recaptchaRef.current) {
            recaptchaRef.current.clear();
          }

          // Fresh captcha every login click
          recaptchaRef.current = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
            }
          );

          const phoneProvider = new PhoneAuthProvider(auth);

          const verificationId =
            await phoneProvider.verifyPhoneNumber(
              {
                multiFactorHint: mfaResolver.hints[0],
                session: mfaResolver.session,
              },
              recaptchaRef.current
            );

          setVerificationId(verificationId);
          setShowOtpBox(true);

        } catch (otpErr: any) {
          console.error("OTP Error:", otpErr);
          setError(
            otpErr.message || "Failed to send OTP."
          );
        }
      } else {
        console.error(err);
        setError(
          err.message || "Invalid admin credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2 Verify OTP
  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const cred = PhoneAuthProvider.credential(
        verificationId,
        otp
      );

      const assertion =
        PhoneMultiFactorGenerator.assertion(cred);

      const userCredential =
        await resolver.resolveSignIn(assertion);

      completeLogin(userCredential.user.uid);

    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow p-5"
        style={{
          maxWidth: "450px",
          width: "90vw",
          borderRadius: "30px",
          backgroundImage: `url(${BgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h2 className="text-center text-white mb-4">
          Admin Login
        </h2>

        {error && (
          <div className="alert alert-danger text-center">
            {error}
          </div>
        )}

        {!showOtpBox ? (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        ) : (
          <>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* captcha mount */}
        <div id="recaptcha-container"></div>

        <div className="text-center mt-3">
          <button
            className="btn btn-link text-white text-decoration-none"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;