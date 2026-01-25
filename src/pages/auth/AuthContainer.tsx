// src/pages/auth/AuthContainer.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AuthContainer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-4 fw-bold text-success mb-5">BookYourTurf</h1>

        <div className="card shadow p-5" style={{ maxWidth: "500px" }}>
          <h3 className="mb-4">Choose Your Role</h3>

          <div className="d-grid gap-3">
            <button
              className="btn btn-success btn-lg fw-bold"
              onClick={() => navigate("/login", { state: { role: "user" } })}
            >
              User
            </button>

            <button
              className="btn btn-outline-success btn-lg fw-bold"
              onClick={() => navigate("/login", { state: { role: "owner" } })}
            >
              Channel Partner (Owner)
            </button>
          </div>

          <div className="mt-4">
            <button
              className="btn btn-link"
              onClick={() => navigate("/login", { state: { role: "user" } })}
            >
              Already have an account? <strong>Login here</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
