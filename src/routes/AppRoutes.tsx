import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Games from "../pages/Games";
import Turf from "../pages/admin/Turf";
import Owner from "../pages/admin/Owner";
import Slot from "../pages/admin/Slot";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/games" element={<Games />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/turfs" element={<Turf />} />
      <Route path="/dashboard/owners" element={<Owner />} />
      <Route path="/slots/:turfId" element={<Slot />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
