// src/pages/auth/Register.tsx
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { saveUserProfile, isMobileRegisteredForRole } from "../../services/firestoreService";

// AES Encryption (same as Flutter) — MUST be here
const AES_KEY_STRING = "DKBMTVig0646YHDBEOCshssi=73HyeMK";
const textEncoder = new TextEncoder();

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

async function getAesKey(): Promise<CryptoKey> {
  const keyBytes = textEncoder.encode(AES_KEY_STRING);
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, ["encrypt"]);
}

async function encryptPasswordAES(plain: string): Promise<string> {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const data = textEncoder.encode(plain);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, data);
  return `${bufferToBase64(iv)}:${bufferToBase64(encrypted)}`;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as any)?.role || "user";

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setName(u.displayName || "");
      }
    });
    return unsub;
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError("Google login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("Please sign in with Google first");
    if (!name.trim()) return setError("Name required");
    if (!/^\+91[6-9]\d{9}$/.test(mobile)) return setError("Invalid mobile");
    if (password.length < 6) return setError("Password too short");
    if (password !== confirmPassword) return setError("Passwords don't match");
    if (!acceptedTerms) { return setError("You must accept the Terms & Conditions"); }

    setLoading(true);
    try {
      if (await isMobileRegisteredForRole(role, mobile)) {
  return setError(
    role === "user"
      ? "Mobile already registered as Player"
      : "Mobile already registered as Channel Partner"
  );
}

      const encrypted = await encryptPasswordAES(password);

      await saveUserProfile(role as "user" | "owner", {
        name,
        email: user.email || "",
        mobile,
        uid: user.uid,
        password: encrypted,
         acceptedTerms,
      });

      alert("Registration successful!");
      navigate(role === "user" ? "/user/turfs" : "/owner/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-5" style={{ maxWidth: "500px", width: "100%" }}>
        <h3 className="text-center mb-2">Register as {role === "user" ? "Player" : "Channel Partner"}</h3>

        {!user ? (
          <>
            <p className="text-center text-muted mb-4">
              Sign in with Google to continue
            </p>
            <button
              className="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" width="20" alt="G" />
              {loading ? "Signing in..." : "Continue with Google"}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt="Profile"
                className="rounded-circle mb-3"
                width="80"
                height="80"
              />
              <p className="text-success fw-bold">{user.displayName}</p>
              <p className="text-muted">{user.email}</p>
            </div>

            {error && <div className="alert alert-danger mb-3">{error}</div>}

            <form onSubmit={handleSubmit}>
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
              <div className="form-check mb-3">
  <input
    className="form-check-input"
    type="checkbox"
    id="termsCheck"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
  />
  <label className="form-check-label" htmlFor="termsCheck">
    I agree to the{" "}
    <a href="/terms" target="_blank" rel="noopener noreferrer">
      Terms & Conditions
    </a>
  </label>
</div>
              <button className="btn btn-success btn-lg w-100" disabled={loading}>
                {loading ? "Saving..." : "Complete Registration"}
              </button>
            </form>

            <div className="text-center mt-3">
              <button
                className="btn btn-link text-danger"
                onClick={() => auth.signOut()}
              >
                Sign in with different account
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-4">
          <button className="btn btn-link" onClick={() => navigate("/auth")}>
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;