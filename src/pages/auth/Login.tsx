// src/pages/auth/Login.tsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getUserDocByEmail,
  getOwnerDocByEmail,
} from "../../services/firestoreService";

/* AES CONFIG (MUST MATCH FLUTTER EXACTLY) */
const AES_KEY_STRING = "DKBMTVig0646YHDBEOCshssi=73HyeMK";
const encoder = new TextEncoder();

const base64ToBytes = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const decryptAES = async (encrypted: string) => {
  const [ivB64, dataB64] = encrypted.split(":");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(AES_KEY_STRING),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: base64ToBytes(ivB64) },
    key,
    base64ToBytes(dataB64)
  );

  return new TextDecoder().decode(decrypted);
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const role: "user" | "owner" = state?.role || "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const account =
        role === "user"
          ? await getUserDocByEmail(email)
          : await getOwnerDocByEmail(email);

      if (!account) {
        setError("No account found for this role");
        return;
      }

      const encryptedPassword =
        role === "user"
          ? account.user_password
          : account.owner_password;

      const plain = await decryptAES(encryptedPassword);

      if (plain !== password) {
        setError("Incorrect password");
        return;
      }

      /* STORE SESSION */
      localStorage.setItem(
        "user_id",
        role === "user" ? account.user_id : account.owner_id
      );
      localStorage.setItem(
        "user_name",
        role === "user" ? account.user_name : account.owner_name
      );
      localStorage.setItem(
        "user_email",
        role === "user" ? account.user_email : account.owner_email
      );
      localStorage.setItem("user_mobile_number",
        role === "user"
          ? account.user_mobile_number
          : account.owner_mobile_number
      );
      localStorage.setItem("user_role", role);
      localStorage.setItem("is_logged_in", "true");

      navigate(role === "user" ? "/user/turfs" : "/owner/channelpartnerdashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user.email;
    if (!email) return;

    const account =
      role === "user"
        ? await getUserDocByEmail(email)
        : await getOwnerDocByEmail(email);

    if (!account) return navigate("/auth");

    localStorage.setItem(
      "user_id",
      role === "user" ? account.user_id : account.owner_id
    );
    localStorage.setItem(
      "user_name",
      role === "user" ? account.user_name : account.owner_name
    );
    localStorage.setItem(
      "user_email",
      role === "user" ? account.user_email : account.owner_email
    );
    localStorage.setItem("user_role", role);
    localStorage.setItem("is_logged_in", "true");

    navigate(role === "user" ? "/user/turfs" : "/owner/channelpartnerdashboard");
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-5" style={{ maxWidth: 450 }}>
        <h2 className="text-center text-success mb-4">
          Login as {role === "user" ? "User" : "Channel Partner"}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-3"
            placeholder="Email / Mobile Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="input-group mb-1">

     <input
    type={showPassword ? "text" : "password"}
    className={`form-control form-control-lg ${passwordError ? "is-invalid" : ""}`}
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

          <button className="btn btn-success w-100" disabled={loading}>
            Login
          </button>
        </form>

        <hr />

        <button
          className="btn btn-danger w-100"
          onClick={handleGoogleLogin}
        >
          Login with Google
        </button>

        <div className="text-center mt-3">
  <button
    className="btn btn-link"
    onClick={() => navigate("/register", { state: { role } })}
  >
    Don't have an account? <strong>Register</strong>
  </button>
</div>
      </div>
    </div>
  );
};

export default Login;
