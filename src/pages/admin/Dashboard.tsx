// src/pages/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center text-center">
        {/* Booked Slots */}
        <div className="col-12 col-sm-6 col-md-4">
          <Link
            to="/dashboard/slots"
            className="d-block p-4 bg-success text-light rounded shadow text-decoration-none h-100"
          >
            <h3 className="fw-bold">Booked Slots</h3>
            <p className="mb-0">View all booked slots.</p>
          </Link>
        </div>

        {/* Turf Details */}
        <div className="col-12 col-sm-6 col-md-4">
          <Link
            to="/dashboard/turfs"
            className="d-block p-4 bg-success text-light rounded shadow text-decoration-none h-100"
          >
            <h3 className="fw-bold">Turf Details</h3>
            <p className="mb-0">Manage and view turf information.</p>
          </Link>
        </div>

        {/* Owner Details */}
        <div className="col-12 col-sm-6 col-md-4">
          <Link
            to="/dashboard/owners"
            className="d-block p-4 bg-success text-light rounded shadow text-decoration-none h-100"
          >
            <h3 className="fw-bold">Owner Details</h3>
            <p className="mb-0">View turf owners and their information.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
