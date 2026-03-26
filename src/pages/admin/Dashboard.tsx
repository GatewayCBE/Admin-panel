// Dashboard.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminNavbar from "./Analytics/AdminNavbar";
import { getTurfs } from "../../services/firestoreService";
import Swal from "sweetalert2";

const Dashboard: React.FC = () => {
  const [totalTurfs, setTotalTurfs] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const role = localStorage.getItem("user_role") ?? "";

  const handleAccess = (allowedRoles: string[], path: string) => {
    if (allowedRoles.includes(role)) {
      navigate(path);
    } else {
      Swal.fire({
  icon: "error",
  title: "Access Denied",
  text: "You don't have permission to access this section.",
  confirmButtonColor: "#67a521",  // matches your dashboard green
  confirmButtonText: "OK",
});
    }
  };

  useEffect(() => {
    getTurfs()
      .then(turfs => setTotalTurfs(turfs.length))
      .catch(() => setTotalTurfs(0))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminNavbar />

      <div className="container py-5 mt-5">
        <h2 className="text-center mb-5 fw-bold text-success">Admin Dashboard</h2>

        <div className="row g-4 justify-content-center">

          {/* All Turfs — super_admin + edit */}
          <div
            className="col-12 col-md-6 col-lg-5"
            onClick={() => handleAccess(["super_admin", "edit"], "/dashboard/turfs")}
            style={{ cursor: "pointer" }}
          >
            <div
              className="card border-0 shadow-lg h-100 text-white"
              style={{
                background: "linear-gradient(135deg, #67a521ff 0%, #5a8f1c 100%)",
                borderRadius: "16px",
                minHeight: "220px",
              }}
            >
              <div className="card-body d-flex flex-column p-4 p-md-5">
                <h3 className="card-title fw-bold mb-3">All Turfs</h3>
                <div className="display-6 mb-2">
                  {loading ? "..." : `${totalTurfs.toLocaleString()} TURFS`}
                </div>
                <div className="mt-auto">
                  <span className="btn btn-light text-dark px-4 py-2 rounded-pill">
                    View All →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Turfs — super_admin only */}
          <div
            className="col-12 col-md-6 col-lg-5"
            onClick={() => handleAccess(["super_admin"], "/dashboard/manageturf")}
            style={{ cursor: "pointer" }}
          >
            <div
              className="card border-0 shadow-lg h-100 text-white"
              style={{
                background: "linear-gradient(135deg, #67a521ff 0%, #5a8f1c 100%)",
                borderRadius: "16px",
                minHeight: "220px",
              }}
            >
              <div className="card-body d-flex flex-column p-4 p-md-5">
                <h3 className="card-title fw-bold mb-3">Manage Turfs</h3>
                <p className="lead mb-4">Edit • Delete • Control</p>
                <div className="mt-auto">
                  <span className="btn btn-light text-dark px-4 py-2 rounded-pill">
                    Manage →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Partners — super_admin only */}
          <div
            className="col-12 col-md-6 col-lg-5"
            onClick={() => handleAccess(["super_admin"], "/dashboard/owners")}
            style={{ cursor: "pointer" }}
          >
            <div
              className="card border-0 shadow h-100 text-white"
              style={{
                backgroundColor: "#67a521ff",
                borderRadius: "16px",
                minHeight: "180px",
              }}
            >
              <div className="card-body p-4 d-flex flex-column">
                <h4 className="card-title fw-bold mb-3">Channel Partners</h4>
                <p className="mb-auto opacity-90">View partners • details</p>
              </div>
            </div>
          </div>

          {/* Analytics — super_admin + accounting */}
          <div
            className="col-12 col-md-6 col-lg-5"
            onClick={() => handleAccess(["super_admin", "accounting"], "/admin/reportspanel")}
            style={{ cursor: "pointer" }}
          >
            <div
              className="card border-0 shadow h-100 text-white"
              style={{
                backgroundColor: "#67a521ff",
                borderRadius: "16px",
                minHeight: "180px",
              }}
            >
              <div className="card-body p-4 d-flex flex-column">
                <h4 className="card-title fw-bold mb-3">Analytics</h4>
                <p className="mb-auto opacity-90">Insights • Reports • Trends</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;