import React from "react";

const Login: React.FC = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <form style={{ display: "flex", flexDirection: "column", maxWidth: "300px", gap: "1rem" }}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button style={{ background: "#14532d", color: "white", padding: "0.5rem" }}>Login</button>
      </form>
    </div>
  );
};

export default Login;
