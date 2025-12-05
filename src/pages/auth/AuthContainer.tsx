// src/pages/auth/AuthContainer.tsx
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../../firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  User,
} from "firebase/auth";
import {
  saveUserProfile,
  isMobileRegistered,
  isEmailLinkedToAnotherMobile,
} from "../../services/firestoreService";
import { useNavigate } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────
   AES Encryption (same as Flutter DataEncryption.encryptData)
────────────────────────────────────────────────────────────── */
const AES_KEY_STRING = "DKBMTVig0646YHDBEOCshssi=73HyeMK"; // must match Flutter key
const textEncoder = new TextEncoder();

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

async function getAesKey(): Promise<CryptoKey> {
  const keyBytes = textEncoder.encode(AES_KEY_STRING);
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptPasswordAES(plain: string): Promise<string> {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const data = textEncoder.encode(plain);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    data
  );

  const ivBase64 = bufferToBase64(iv);
  const cipherBase64 = bufferToBase64(encrypted);
  return `${ivBase64}:${cipherBase64}`; // matches Flutter format
}

/* ────────────────────────────────────────────────────────────── */

const AuthContainer: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<
    "pickRole" | "googleLogin" | "profile"
  >("pickRole");

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<"user" | "owner" | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ──────────────────────────────
     Listen to Firebase auth state
  ────────────────────────────── */
  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (step !== "googleLogin") return;  // <-- important

    if (user) {
      setFirebaseUser(user);
      setStep("profile");
      try {
        if (!user.emailVerified) {
          await sendEmailVerification(user);
        }
      } catch {}
    }
  });

  return unsub;
}, [step]);

  /* ──────────────────────────────
     Step 1 — Role Selection
  ────────────────────────────── */
  if (step === "pickRole") {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow p-5 text-center">
              <h3>Select Account Type</h3>
              <p className="text-muted">Continue as:</p>

              <div className="d-flex gap-3 mt-4">
                <button
                  className={`btn btn-lg flex-fill ${
                    role === "user"
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                  onClick={() => {
                    setRole("user");
                    setStep("googleLogin");
                  }}
                >
                  User
                </button>

                <button
                  className={`btn btn-lg flex-fill ${
                    role === "owner"
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                  onClick={() => {
                    setRole("owner");
                    setStep("googleLogin");
                  }}
                >
                  Channel Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────
     Step 2 — Google Login Screen
  ────────────────────────────── */
  if (step === "googleLogin" && !firebaseUser) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow p-5 text-center">
              <h2 className="text-success mb-4">Continue with Google</h2>

              <button
                className="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-3"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signInWithPopup(auth, googleProvider);
                  } catch (err: any) {
                    setError(err.message);
                  }
                  setLoading(false);
                }}
                disabled={loading}
              >
                <img src="https://www.google.com/favicon.ico" width="24" />
                {loading ? "Signing In..." : "Sign In with Google"}
              </button>

              {error && (
                <div className="alert alert-danger mt-3">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────
     Step 3 — Registration Form
  ────────────────────────────── */
  if (step === "profile" && firebaseUser) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow p-5 position-relative">
              <button
                className="btn btn-outline-danger btn-sm position-absolute top-0 end-0"
                onClick={async () => {
                  await auth.signOut();
                  setFirebaseUser(null);
                  setStep("pickRole");
                }}
              >
                Logout
              </button>

              <h4 className="mb-3">Complete Your Registration</h4>
              <p className="text-muted">{firebaseUser.email}</p>

              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");

                  if (!name.trim()) return setError("Name is required.");
                  if (!/^\+91[6-9]\d{9}$/.test(mobile))
                    return setError("Enter valid Indian mobile number.");

                  if (password.length < 6)
                    return setError("Password must be at least 6 chars.");
                  if (password !== confirmPassword)
                    return setError("Passwords do not match.");

                  const email = firebaseUser.email || "";

                  // Prevent email → multiple mobiles
                  const emailConflict =
                    await isEmailLinkedToAnotherMobile(email, mobile);
                  if (emailConflict) {
                    return setError(
                      "This email is already linked to another mobile."
                    );
                  }

                  // Prevent mobile → multiple users
                  const mobileExists = await isMobileRegistered(mobile);
                  if (mobileExists) {
                    return setError(
                      "This mobile number is already registered!"
                    );
                  }

                  // Encrypt password like Flutter
                  const encryptedPassword = await encryptPasswordAES(
                    password
                  );

                  setLoading(true);
                  try {
                    await saveUserProfile(role!, {
                      name,
                      email,
                      mobile,
                      uid: firebaseUser.uid,
                      password: encryptedPassword,
                    });

                    alert("Registration Complete!");

                    navigate(
                      role === "owner"
                        ? "/owner/dashboard"
                        : "/login"
                    );
                  } catch (err: any) {
                    setError(err.message);
                  }
                  setLoading(false);
                }}
              >
                <input
                  className="form-control form-control-lg mb-3"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  className="form-control form-control-lg mb-3"
                  placeholder="+91XXXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />

                <input
                  type="password"
                  className="form-control form-control-lg mb-3"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <input
                  type="password"
                  className="form-control form-control-lg mb-4"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  className="btn btn-success btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Continue"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthContainer;
