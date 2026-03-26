// src/pages/auth/AdminLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import BgImg from "../../assets/BgImg.jpeg";

// ✅ UID → role map (accounting and edit UIDs swapped to match Firebase console)
const ADMIN_UID_MAP: Record<string, string> = {
  "coGUbxu4mLZVpJhDmAl2aqG8zsj2": "super_admin",
  "zGWf5MR0k6bCgFE7zWoK8Gtu0lI3": "accounting",  // ← swapped
  "bVvLILbnsSPJBQEhUiztgMQ5Cre2": "edit",         // ← swapped
};

const AdminLogin: React.FC = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = getAuth();

      // Step 1: Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      // Step 2: Look up role by UID
      const role = ADMIN_UID_MAP[uid];

      if (!role) {
        setError("This account is not authorised as an admin.");
        setLoading(false);
        return;
      }

      // Step 3: Store in localStorage
      localStorage.setItem("user_uid",     uid);
      localStorage.setItem("user_email",   email.trim().toLowerCase());
      localStorage.setItem("user_role",    role);   // "super_admin" | "accounting" | "edit"
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("auth_token",   "admin_logged_in");

      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError("Invalid admin credentials");
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
        <h2 className="text-center text-white mb-4">Admin Login</h2>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-white">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 mt-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

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