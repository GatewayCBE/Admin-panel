import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Games from "../pages/Games";

import Dashboard from "../pages/admin/Dashboard";
import Owner from "../pages/admin/Owner/Owner";
import Turfowner from "../pages/admin/Owner/Turfowner";
import TurfDetails from "../pages/admin/Owner/TurfDetails";
import TurfBookingsPage from "../pages/admin/Slot/TurfBookingsPage";
import Turf from "../pages/admin/Turf/Turf";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AuthContainer from "../pages/auth/AuthContainer";

import { PublicLayout, AdminLayout, OwnerLayout, UserLayout } from "./Layout";
import TurfDetail from "../pages/user/TurfDetail";
import SlotDetails from "../pages/user/SlotDetails";
// import OwnerDashboard from "../pages/owner/OwnerDashboard";
import AddTurfForm from "../pages/admin/Owner/AddTurf";
import AdminLogin from "../pages/auth/AdminLogin";
import UGames from "../pages/user/UGames";
import ManageTurf from "../pages/admin/Turf/ManageTurf";
import AdvancePayment from "../pages/user/AdvancePayment";
import RazorpayPage from "../pages/user/Razorpay";
import AllTurfs from "../pages/admin/Turf/AllTurfs";
import EditTurf from "../pages/admin/Owner/EditTurf";
import ChannelPartnerDashboard from "../pages/admin/Owner/ChannelPartnerDashboard";
import OwnerProfile from "../pages/admin/Owner/OwnerProfile";
import SlotManagement from "../pages/admin/Owner/SlotManagement";
import SlotBookingConfirmation from "../pages/admin/Owner/SlotBookingConfirmation";
import ViewBookings from "../pages/admin/Owner/ViewBookings";
import UserBookings from "../pages/admin/Analytics/UserBookings";
import UserProfile from "../pages/user/UserProfile";
import UserBookingHistory from "../pages/user/UserBookings";
import UserBookingHistoryPage from "../pages/user/UserBookings";
import ReportsPanel from "../pages/admin/All Reports/ReportsPanel";
import ProtectedRoute from "./ProtectedRoutes";
import OwnerTurfs from "../pages/admin/Owner/OwnerTurfs";
import OwnerTurfEdit from "../pages/admin/Owner/OwnerTurfEdit";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 🌍 Public pages */}
    <Route element={<PublicLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/games" element={<Games />} />
</Route>

<Route path="/login" element={<Login />} />
<Route path="/auth" element={<AuthContainer />} />
<Route path="/register" element={<Register />} />
<Route path="/admin" element={<AdminLogin />} /> 

<Route
  element={
    <ProtectedRoute allowedRoles={["user"]}>
      <UserLayout />
    </ProtectedRoute>
  }
>
  <Route path="/user/turfs" element={<Turf />} />
  <Route path="/user/turfs/:turfId" element={<TurfDetail />} />
  <Route path="/user/turfs/:turfId/slots" element={<SlotDetails />} />
  <Route path="/user/advancepayment" element={<AdvancePayment />} />
  <Route path="/user/razorpay" element={<RazorpayPage />} />
  <Route path="/user/profile" element={<UserProfile />} />
  <Route path="/ugames" element={<UGames/>} />

  <Route path="/user/bookinghistory" element={<UserBookingHistoryPage />} />
</Route>

<Route
  element={
    <ProtectedRoute allowedRoles={["owner"]}>
      <OwnerLayout />
    </ProtectedRoute>
  }
>
  {/* <Route path="/owner/home" element={<OwnerDashboard />} /> */}
  <Route path="/owner/dashboard" element={<AddTurfForm />} />
  <Route path="/owner/channelpartnerdashboard" element={<ChannelPartnerDashboard />} />
  <Route path="/owner/profile" element={<OwnerProfile />} />
  <Route path="/owner/turf/edit/:turfId" element={<OwnerTurfEdit/>} />
  <Route path="/owner/slotmanagement" element={<SlotManagement />} />
  <Route path="/owner/booking-confirmation" element={<SlotBookingConfirmation />} />
  <Route path="/owner/viewbookings" element={<ViewBookings />} />
</Route>

<Route
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/dashboard/turfs" element={<AllTurfs />} />
  <Route path="/dashboard/manageturf" element={<ManageTurf />} />
  <Route path="/dashboard/owners" element={<Owner />} />
  <Route path="/dashboard/owners/:ownerId" element={<Turfowner />} />
    <Route path="/dashboard/owners/:ownerId/turfs/:turfId" element={<TurfDetails />} />
  <Route path="/dashboard/owners/:ownerId/turfs/:turfId/edit" element={<EditTurf />} />
  <Route path="/dashboard/owners/:ownerId/:turfId/slots" element={<TurfBookingsPage />} />
  <Route path="/admin/reportspanel" element={<ReportsPanel />} />
  <Route path="/admin/userbookings" element={<UserBookings />} />
</Route>
    </Routes>
  );
};

export default AppRoutes;