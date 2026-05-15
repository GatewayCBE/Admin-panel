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

    const flattenObject = (obj: any, prefix = ""): any => {
  let result: any = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      result = {
        ...result,
        ...flattenObject(value, newKey),
      };
    } else if (Array.isArray(value)) {
      result[newKey] = value.join(" | ");
    } else {
      result[newKey] = value ?? "";
    }
  }

  return result;
};

const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data available");
    return;
  }

  // ✅ Flatten all documents
  const flattenedData = data.map((item) => flattenObject(item));

  // ✅ Get ALL unique headers from ALL docs
  const headerSet = new Set<string>();

flattenedData.forEach((item) => {
  Object.keys(item).forEach((key) => {
    headerSet.add(key);
  });
});

const headers = Array.from(headerSet);

console.log("ALL CSV HEADERS:", headers);

  // ✅ Create rows
  const rows = flattenedData.map((item) =>
    headers
      .map((header) => {
        const value = item[header] ?? "";
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  // ✅ Build CSV
  const csvContent = [
    headers.join(","),
    ...rows,
  ].join("\n");

  // ✅ UTF-8 BOM Fix for Excel
  const blob = new Blob(
    ["\uFEFF" + csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `${filename}_${
    new Date().toISOString().split("T")[0]
  }.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const handleDownloadUsers = async () => {
  console.log("📥 Downloading Users...");
  const data = await getUsers();
  downloadCSV(data, "users");
};

const handleDownloadOwners = async () => {
  console.log("📥 Downloading Channel Partners...");
  const data = await getOwners();
   console.log("OWNERS DATA:", data);
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