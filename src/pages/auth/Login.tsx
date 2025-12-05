// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getUserDocByEmail } from "../../services/firestoreService";

/* ─────────────────────────────────────────────
   AES Encryption / Decryption (MATCH FLUTTER)
────────────────────────────────────────────── */
const AES_KEY_STRING = "DKBMTVig0646YHDBEOCshssi=73HyeMK";
const textEncoder = new TextEncoder();

function base64ToBytes(base64: string) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function bufferToText(buffer: ArrayBuffer) {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

async function getAesKey(): Promise<CryptoKey> {
  const keyBytes = textEncoder.encode(AES_KEY_STRING);
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function decryptPasswordAES(encryptedData: string): Promise<string> {
  const parts = encryptedData.split(":");
  if (parts.length !== 2) throw new Error("Invalid encrypted format");

  const iv = base64ToBytes(parts[0]);
  const cipherBytes = base64ToBytes(parts[1]);

  const key = await getAesKey();

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    cipherBytes
  );

  return bufferToText(decryptedBuffer);
}

/* ───────────────────────────────────────────── */

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ─────────────────────────────────────────────
     EMAIL + PASSWORD LOGIN
  ───────────────────────────────────────────── */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Fetch Firestore document for this email
      const userDoc = await getUserDocByEmail(email);
      if (!userDoc) {
        setError("No account found with this email.");
        setLoading(false);
        return;
      }

      const { user_password, user_mobile_number } = userDoc;

      if (!user_password) {
        setError("This account has no password. Please login using Google.");
        setLoading(false);
        return;
      }

      // 2️⃣ Decrypt stored password (AES-CBC)
      const storedPlaintext = await decryptPasswordAES(user_password);

      // 3️⃣ Compare with user input
      if (storedPlaintext !== password) {
        setError("Incorrect password");
        setLoading(false);
        return;
      }

      // 4️⃣ Firebase login (optional, to maintain Firebase auth session)
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseErr) {
        // ignore, because Firebase does NOT know our AES password
        console.warn("Firebase email login skipped:", firebaseErr);
      }

      // 5️⃣ Successful login → navigate to user turf page
      navigate("/user/turfs");
    } catch (err: any) {
      console.error(err);
      setError("Login failed: " + err.message);
    }

    setLoading(false);
  };

  /* ─────────────────────────────────────────────
     GOOGLE LOGIN
  ───────────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;

      if (!userEmail) {
        setError("Google account returned no email.");
        setLoading(false);
        return;
      }

      // 1️⃣ Check Firestore account exists
      const exists = await getUserDocByEmail(userEmail);

      if (!exists) {
        // Not registered → go to full registration flow
        navigate("/auth");
      } else {
        // Already registered → go to turf page
        navigate("/user/turfs");
      }
    } catch (err: any) {
      console.error(err);
      setError("Google login failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">

          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Login</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleEmailLogin}>
              <input
                type="email"
                className="form-control form-control-lg mb-3"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="form-control form-control-lg mb-4"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                className="btn btn-success btn-lg w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <hr className="my-4" />

            <button
              className="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" width="22" alt="g" />
              Login with Google
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
