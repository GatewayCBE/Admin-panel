import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { fetchAllBookings } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";
import AllReports from "./Allreports";

const ReportsPanel: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      console.log("Fetching bookings data...");
      try {
        const bookingsData = await fetchAllBookings("testing");
        console.log(`Loaded ${bookingsData.length} bookings`);
        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings data");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminNavbar/>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
          <div className="text-center">
            <div 
              className="spinner-border text-white" 
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <p className="mt-3 text-white fw-semibold" style={{ fontSize: "1.2rem" }}>
              Loading comprehensive analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminNavbar />
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
          <div className="alert alert-danger shadow-lg" role="alert" style={{ maxWidth: "600px" }}>
            <h4 className="alert-heading">⚠️ Error Loading Data</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please check your Firebase configuration and try again.</p>
            <button 
              className="btn btn-danger mt-3" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div>
        <Tabs defaultActiveKey="overview" id="analytics-tabs" className="mb-0 mt-5 py-4">
          <Tab eventKey="overview" title="📊 Comprehensive Reports">
            <AllReports bookings={bookings} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsPanel;