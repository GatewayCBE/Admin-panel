import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Games from "../pages/Games";

import Dashboard from "../pages/admin/Dashboard";
import Owner from "../pages/admin/Owner/Owner";
import Turfowner from "../pages/admin/Owner/Turfowner";
import TurfDetails from "../pages/admin/Owner/TurfDetails";
import TurfBookingsPage from "../pages/admin/Slot/TurfBookingsPage";
import AnalyticsPanel from "../pages/admin/Analytics/AnalyticsPanel";
import RecentBookingsPage from "../pages/admin/Analytics/RecentBookingsPage";
import Turf from "../pages/admin/Turf/Turf";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AuthContainer from "../pages/auth/AuthContainer";

import { PublicLayout, UserLayout, AdminLayout } from "./Layout";
import TurfDetail from "../pages/user/TurfDetail";
import SlotDetails from "../pages/user/SlotDetails";
import OwnerDashboard from "../pages/owner/OwnerDashboard";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 🌍 Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/games" element={<Games />} />
      </Route>

      {/* 👤 User pages */}
      <Route element={<UserLayout />}>
        <Route path="/user/turfs" element={<Turf />} />
        <Route path="/user/turfs/:turfId" element={<TurfDetail />} />
        <Route path="/user/turfs/:turfId/slots" element={<SlotDetails />} />
      </Route>

      {/* 👤 Owner pages */}
      <Route element={<UserLayout />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      </Route>

      {/* 🛠 Admin pages */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/owners" element={<Owner />} />
        <Route path="/dashboard/owners/:ownerId" element={<Turfowner />} />
        <Route path="/dashboard/owners/:ownerId/:turfId" element={<TurfDetails />} />
        <Route path="/dashboard/owners/:ownerId/:turfId/slots" element={<TurfBookingsPage />} />
        <Route path="/admin/reports/*" element={<AnalyticsPanel />} />
        <Route path="/admin/recentbookings" element={<RecentBookingsPage />} />
      </Route>

      {/* 🔐 Auth pages (no navbar/footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<AuthContainer />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
