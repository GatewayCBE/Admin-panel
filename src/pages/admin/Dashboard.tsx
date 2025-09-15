import React from "react";
import { Link } from "react-router-dom";
import "../Style/Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-links">
        <Link to="/dashboard/turfs" className="dashboard-card">
          <h3>Turf Details</h3>
          <p>Manage Turf information.</p>
        </Link>

        <Link to="/dashboard/owners" className="dashboard-card">
          <h3>Channel Partner List</h3>
          <p>View Turf Channel Partner and their information.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
