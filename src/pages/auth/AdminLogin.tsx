import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Hardcoded credentials check
    if (name === "admin" && password === "Admin@123") {
      localStorage.setItem("user_role", "admin");
      localStorage.setItem("is_logged_in", "true");
      navigate("/dashboard"); // Adjust path as needed
    } else {
      setError("Invalid Admin Credentials");
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-5" style={{ maxWidth: 450, width: "100%" }}>
        <h2 className="text-center text-success mb-4">Admin Login</h2>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter admin name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100 mt-2">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <button className="btn btn-link text-decoration-none" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;