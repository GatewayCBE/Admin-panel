import React, { useEffect, useState } from "react";
import { getUsers, getOwners, getTurfs, subscribeToCounts } from "../../../services/firestoreService";
import { useTurf } from "../Turf/useTurf";
import { exportTurfsExcel } from "../../../utils/exportTurfsExcel";

const CountsSummary = () => {
  const { turfs } = useTurf();
  const [usersCount, setUsersCount] = useState(0);
  const [ownersCount, setOwnersCount] = useState(0);
const turfsCount = turfs.length;

  useEffect(() => {
    const unsubscribe = subscribeToCounts("testing", {
      onUsers: setUsersCount,
      onOwners: setOwnersCount,
    });

    return () => unsubscribe();
  }, []);

  const avgTurfsPerOwner =
    ownersCount > 0 ? (turfsCount / ownersCount).toFixed(1) : "0";

    const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data available");
    return;
  }

  const headers = Object.keys(data[0]);

  const rows = data.map((item) =>
    headers.map((key) => `"${item[key] ?? ""}"`).join(",")
  );

  const csv =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows].join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDownloadUsers = async () => {
  console.log("📥 Downloading Users...");
  const data = await getUsers();
  downloadCSV(data, "users");
};

const handleDownloadOwners = async () => {
  console.log("📥 Downloading Channel Partners...");
  const data = await getOwners();
  downloadCSV(data, "channel_partners");
};

  return (
    <div className="container-fluid px-3 px-md-4 mt-4">

      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold">📊 System Overview</h3>
        <p className="text-muted mb-0">Real-time platform statistics</p>
      </div>

      {/* Cards */}
      <div className="row g-4 mx-0">

        {/* Users */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card text-white p-4 border-0 shadow-sm h-100 stat-card"
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "16px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div onClick={handleDownloadUsers}
style={{ cursor: "pointer" }}>
                <p className="mb-1 small">Users</p>
                <h2 className="fw-bold mb-0">{usersCount}</h2>
                <small className="opacity-75">Registered accounts</small>
              </div>
              <i className="bi bi-people-fill fs-2"></i>
            </div>
          </div>
        </div>

        {/* Channel Partners */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card text-dark p-4 border-0 shadow-sm h-100 stat-card"
            onClick={handleDownloadOwners}
            style={{
              background: "linear-gradient(135deg, #f7971e, #ffd200)",
              borderRadius: "16px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 small">Channel Partners</p>
                <h2 className="fw-bold mb-0">{ownersCount}</h2>
                <small className="opacity-75">Active partners</small>
              </div>
              <i className="bi bi-person-badge-fill fs-2"></i>
            </div>
          </div>
        </div>

        {/* Turfs */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card text-white p-4 border-0 shadow-sm h-100 stat-card"
            onClick={() => exportTurfsExcel(turfs)}
            style={{
              background: "linear-gradient(135deg, #43cea2, #185a9d)",
              borderRadius: "16px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 small">Turfs</p>
                <h2 className="fw-bold mb-0">{turfsCount}</h2>
                <small className="opacity-75">Total listed turfs</small>
              </div>
              <i className="bi bi-building fs-2"></i>
            </div>
          </div>
        </div>

        {/* Avg Turfs per Partner */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card text-white p-4 border-0 shadow-sm h-100 stat-card"
            style={{
              background: "linear-gradient(135deg, #232526, #414345)",
              borderRadius: "16px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 small">Avg Turfs / Partner</p>
                <h2 className="fw-bold mb-0">{avgTurfsPerOwner}</h2>
                <small className="opacity-75">Distribution ratio</small>
              </div>
              <i className="bi bi-bar-chart-fill fs-2"></i>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CountsSummary;