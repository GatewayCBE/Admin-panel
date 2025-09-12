// src/pages/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./Style/Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-links">
        <Link to="/dashboard/slots" className="dashboard-card">
          <h3>Booked Slots</h3>
          <p>View all booked slots.</p>
        </Link>

        <Link to="/dashboard/turfs" className="dashboard-card">
          <h3>Turf Details</h3>
          <p>Manage and view turf information.</p>
        </Link>

        <Link to="/dashboard/owners" className="dashboard-card">
          <h3>Owner Details</h3>
          <p>View turf owners and their information.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
