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
            to="/owner/viewbookings"
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
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
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
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
    <path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/>
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