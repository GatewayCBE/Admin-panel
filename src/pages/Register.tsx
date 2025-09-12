import React from "react";

const Register: React.FC = () => {
  return (
    <div>
      <h2>Register</h2>
      <form style={{ display: "flex", flexDirection: "column", maxWidth: "300px", gap: "1rem" }}>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button style={{ background: "#14532d", color: "white", padding: "0.5rem" }}>Register</button>
      </form>
    </div>
  );
};

export default Register;
