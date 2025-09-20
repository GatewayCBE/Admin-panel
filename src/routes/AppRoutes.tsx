import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Games from "../pages/Games";
import Dashboard from "../pages/admin/Dashboard";
import Turf from "../pages/admin/Turf/Turf";
import Owner from "../pages/admin/Owner/Owner";
import Slot from "../pages/admin/Slot";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Layout from "./Layout";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes with Header + Footer */}
      <Route element={<Layout/>}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/games" element={<Games />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/turfs" element={<Turf />} />
        <Route path="/dashboard/owners" element={<Owner />} />
        <Route path="/dashboard/slots" element={<Slot />} />
      </Route>

      {/* Auth Routes (no Navbar/Footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
