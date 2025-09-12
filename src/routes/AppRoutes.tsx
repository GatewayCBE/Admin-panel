import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Games from "../pages/Games";
import Turf from "../pages/Turf";
import Owner from "../pages/Owner";
import Slot from "../pages/Slot";
// import AdminPanel from "../pages/AdminPanel";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/games" element={<Games />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/turfs" element={<Turf />} />
        <Route path="/dashboard/owners" element={<Owner />} />
        <Route path="/dashboard/slots" element={<Slot />} />
      {/* <Route path="/admin" element={<AdminPanel />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
