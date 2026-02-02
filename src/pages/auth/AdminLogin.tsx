import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import BgImg from "../../assets/BgImg.jpeg";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const auth = getAuth();
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    navigate("/dashboard");
  } catch (err) {
    setError("Invalid admin credentials");
  }
};

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-5"  style={{
                  maxWidth: '450px',
                  width: '90vw',
                  borderRadius: '30px',
              backgroundImage: `url(${BgImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
                }}>
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

          <button type="submit" className="btn btn-success w-100 mt-2">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;