// src/pages/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminSidebar from "./Analytics/AdminSidebar";
import AdminNavbar from "./Analytics/AdminNavbar";

const Dashboard: React.FC = () => {
  return (
    <div className="admin-page-container">
      <AdminNavbar />
      <div className="row g-4 justify-content-center text-center mt-2">
        {/* Owner Details */}
        <div className="col-12 col-sm-6 col-md-4">
          <Link
            to="/dashboard/owners"
            className="d-block p-4 bg-success text-light rounded shadow text-decoration-none h-100"
          >
            <h3 className="fw-bold">Channel Partner Details</h3>
            <p className="mb-0">View turf channel partner and their information.</p>
          </Link>
        </div>
        {/* Analytics Panel */}
        <div className="col-12 col-sm-6 col-md-4">
          <Link
            to="/admin/reports/*"
            className="d-block p-4 bg-success text-light rounded shadow text-decoration-none h-100"
          >
            <h3 className="fw-bold">Analytics Dashboard</h3>
            <p className="mb-0">View analytics and insights for turfs and bookings.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
