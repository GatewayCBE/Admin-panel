import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", formData);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              backgroundColor: "rgb(26, 135, 84)",
              border: "none",
              color: "white",
              borderRadius: "5px",
              padding: "5px 15px",
              width: "100%",
            }}
          >
            Login
          </button>
        </form>

        {/* Register link */}
        <p className="text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/register" className="text-decoration-none">
            <span style={{ color: "rgb(26, 135, 84)" }}>Register</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
