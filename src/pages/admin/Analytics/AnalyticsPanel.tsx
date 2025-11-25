import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Tab } from "react-bootstrap";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "../Analytics/AdminSidebar";

import {
  getGlobalAnalytics,
  getDailyAnalytics,
  getTurfAnalytics,
  getUserAnalytics,
} from "../../../services/firestoreService";

import OverviewReport from "./reports/OverviewReport";
import TimeSplitReport from "./reports/TimeSplitReport";
import WeekSplitReport from "./reports/WeekSplitReport";
import SingleDayReport from "./reports/SingleDayReport";
import MonthlyReport from "./reports/MonthlyReport";
import TurfReport from "./reports/TurfReport";
import UserReport from "./reports/UserReport";

const AnalyticsPanel: React.FC = () => {
  const [global, setGlobal] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [turfs, setTurfs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      console.log("Fetching analytics data...");
      try {
        const [g, d, t, u] = await Promise.all([
          getGlobalAnalytics(),
          getDailyAnalytics(),
          getTurfAnalytics(),
          getUserAnalytics(),
        ]);

        console.log("Analytics data received:", { g, d, t, u });
        setGlobal(g);
        setDaily(d);
        setTurfs(t);
        setUsers(u);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: "60vh" }}>
        <AdminSidebar isOpen={false} closeSidebar={() => {}} />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-secondary"></div>
            <p className="mt-2">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("Analytics loaded:", { global, daily, turfs, users });

  return (
    <div>
      <AdminNavbar />
      <div className="container-fluid py-4">
        <h2 className="h4 mb-4 fw-bold">Analytics Dashboard</h2>

        <Tabs defaultActiveKey="overview" id="analytics-tabs" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <OverviewReport
              global={global}
              daily={daily}
              turfs={turfs}
              users={users}
            />
          </Tab>

          <Tab eventKey="timesplit" title="Time Split">
            <TimeSplitReport daily={daily} />
          </Tab>

          <Tab eventKey="datewise" title="Single Day Report">
            <SingleDayReport daily={daily} />
          </Tab>

          <Tab eventKey="weeksplit" title="Week Split">
  <WeekSplitReport daily={daily} />
</Tab>

          <Tab eventKey="monthly" title="Monthly">
            <MonthlyReport daily={daily} />
          </Tab>

          <Tab eventKey="turf" title="Turf Report">
            <TurfReport turfs={turfs} />
          </Tab>

          <Tab eventKey="users" title="User Report">
            <UserReport users={users} />
          </Tab>

        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
