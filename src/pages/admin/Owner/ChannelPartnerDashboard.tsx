import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ChannelPartnerDashboard: React.FC = () => {
  return (
    <div className="container mt-5 py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-success">Channel Partner Dashboard</h1>
        <p className="text-muted">Manage your bookings and sports venues</p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* View Bookings Card */}
        <div className="col-lg-5 col-md-6">
          <Link
            to="/dashboard/bookings"
            className="text-decoration-none"
          >
            <div
              className="card shadow-lg border-0 h-100 dashboard-card"
              style={{
                background: "linear-gradient(135deg, #67a521ff)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px #67a521ff)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px #67a521ff)";
              }}
            >
              <div className="card-body text-center p-5">
                <div
                  className="icon-container mb-4"
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    fill="white"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                  </svg>
                </div>
                <h3 className="fw-bold text-white mb-3">View Bookings</h3>
                <p className="text-white-50 mb-4">
                  Check all your customer bookings, schedules, and reservation details
                </p>
                <div
                  className="badge bg-white text-purple px-4 py-2"
                  style={{ fontSize: "14px", color: "#67a521ff" }}
                >
                  View Bookings →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Sports Venues Card */}
        <div className="col-lg-5 col-md-6">
          <Link
            to="/owner/dashboard"
            className="text-decoration-none"
          >
            <div
              className="card shadow-lg border-0 h-100 dashboard-card"
              style={{
                background: "linear-gradient(135deg, #67a521ff)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px #67a521ff)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px #67a521ff";
              }}
            >
              <div className="card-body text-center p-5">
                <div
                  className="icon-container mb-4"
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    fill="white"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                  </svg>
                </div>
                <h3 className="fw-bold text-white mb-3">Sports Venues</h3>
                <p className="text-white-50 mb-4">
                  View and manage all your sports venues, facilities, and amenities
                </p>
                <div
                  className="badge bg-white text-pink px-4 py-2"
                  style={{ fontSize: "14px", color: "#67a521ff" }}
                >
                  Sports Venues →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

    

      <style>{`
        .dashboard-card:hover {
          cursor: pointer;
        }
        
        .card {
          border-radius: 20px;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .card-body {
            padding: 2rem !important;
          }
          
          .icon-container {
            width: 80px !important;
            height: 80px !important;
          }
          
          .icon-container svg {
            width: 40px !important;
            height: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChannelPartnerDashboard;