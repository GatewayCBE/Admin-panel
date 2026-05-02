// src/pages/auth/Register.tsx
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { saveUserProfile, isMobileRegisteredForRole } from "../../services/firestoreService";
import BgImg from "../../assets/login_background.jpeg";

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
const [mobileError, setMobileError] = useState("");
const [passwordError, setPasswordError] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  if (mobile.length !== 10) return setError("Valid mobile required");
  if (password.length < 6) return setError("Password too short");
  if (password !== confirmPassword) return setError("Passwords don't match");
  if (!acceptedTerms) return setError("You must accept the Terms & Conditions");

  setLoading(true);
  try {
    const fullMobile = `+91${mobile}`; // ✅ ADD COUNTRY CODE

    if (await isMobileRegisteredForRole(role, fullMobile)) {
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
      mobile: fullMobile, // ✅ STORED WITH +91
      uid: user.uid,
      password: encrypted,
      original_password: password,
      acceptedTerms,
    });

    alert("Registration successful!");
    navigate(role === "user" ? "/user/turfs" : "/owner/channelpartnerdashboard");
  } catch (err: any) {
    setError(err.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  return (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
  <div 
    className="card shadow p-5"  
    style={{ 
      maxWidth: 450,
      width: '90vw',
      borderRadius: '30px',
      backgroundImage: `url(${BgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Blur overlay */}
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1,
        borderRadius: '30px'
      }}
    />

    {/* Content wrapper */}
    <div style={{ position: 'relative', zIndex: 2 }}>
      {/* <h3 className="text-center text-white fw-bold mb-2">Register as {role === "user" ? "User" : "Channel Partner"}</h3> */}

      {!user ? (
        <>
          <p className="text-center text-white mb-4">
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
          {/* <div className="text-center mb-4">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="rounded-circle mb-3"
              width="80"
              height="80"
            />
            <p className="text-white fs-5">{user.displayName}</p>
            <p className="text-white">{user.email}</p>
          </div> */}

          {error && <div className="alert alert-danger mb-3">{error}</div>}

       <form onSubmit={handleSubmit}>
  {/* Name */}
  <div className="mb-2">
    <label className="form-label text-white">Name</label>
    <input
      className="form-control form-control-lg mb-3"
      placeholder="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
  </div>

  {/* Mobile Number */}
  <div className="mb-2">
    <label className="form-label text-white">Mobile Number</label>
    <div className="input-group mb-1">
      <span className="input-group-text">+91</span>
      <input
        className={`form-control form-control-lg ${
          mobileError ? "is-invalid" : ""
        }`}
        value={mobile}
        onChange={(e) => {
          let value = e.target.value.replace(/\D/g, "");
          if (value.length > 10) return;
          setMobile(value);
          setMobileError(
            value.length === 10 ? "" : "Please enter valid mobile number"
          );
        }}
        placeholder="Enter 10 digits"
      />
    </div>
    {mobileError && <small className="text-danger">{mobileError}</small>}
  </div>

  {/* Password */}
  <div className="mb-2">
    <label className="form-label text-white">Create Password</label>
    <div className="input-group mb-1">
      <input
        type={showPassword ? "text" : "password"}
        className={`form-control form-control-lg ${
          passwordError ? "is-invalid" : ""
        }`}
        value={password}
        onChange={(e) => {
          const val = e.target.value;
          setPassword(val);

          if (val.length < 7)
            setPasswordError("Password must be at least 7 characters");
          else if (val.length > 15)
            setPasswordError("Password cannot exceed 15 characters");
          else setPasswordError("");
        }}
        placeholder="Create Password"
      />
      <span
        className="input-group-text bg-white"
        style={{ cursor: "pointer" }}
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
      </span>
    </div>
    {passwordError && <small className="text-danger">{passwordError}</small>}
  </div>

  {/* Confirm Password */}
  <div className="mb-3">
    <label className="form-label text-white">Confirm Password</label>
    <div className="input-group">
      <input
        type={showConfirmPassword ? "text" : "password"}
        className="form-control form-control-lg"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
      />
      <span
        className="input-group-text bg-white"
        style={{ cursor: "pointer" }}
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        <i
          className={`bi ${
            showConfirmPassword ? "bi-eye-slash" : "bi-eye"
          }`}
        ></i>
      </span>
    </div>
  </div>

  {/* Terms & Conditions */}
  <div className="form-check mb-3">
    <input
      className="form-check-input"
      type="checkbox"
      id="termsCheck"
      checked={acceptedTerms}
      onChange={(e) => setAcceptedTerms(e.target.checked)}
    />
    <label className="form-check-label text-white" htmlFor="termsCheck">
      I agree to the{" "}
      <a href="/terms" target="_blank" rel="noopener noreferrer">
        Terms & Conditions
      </a>
    </label>
  </div>

  {/* Submit Button */}
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
        <button className="btn btn-link text-white" onClick={() => navigate("/auth")}>
          ← Back to Role Selection
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default Register;