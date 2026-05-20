import React, { useEffect, useState } from "react";
import {
  getDeletedUsers,
  getDeletedOwners,
  getDeletedTurfs,
} from "../../../services/firestoreService";

const DeletedCountsSummary = () => {
  const [deletedUsersCount, setDeletedUsersCount] = useState(0);
  const [deletedOwnersCount, setDeletedOwnersCount] = useState(0);
  const [deletedTurfsCount, setDeletedTurfsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeletedCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch actual data
        const [users, owners, turfs] = await Promise.all([
          getDeletedUsers(),
          getDeletedOwners(),
          getDeletedTurfs(),
        ]);
        
        console.log("Users data:", users);
        console.log("Owners data:", owners);
        console.log("Turfs data:", turfs);
        
        setDeletedUsersCount(users.length);
        setDeletedOwnersCount(owners.length);
        setDeletedTurfsCount(turfs.length);
      } catch (error: any) {
        console.error("Error fetching deleted counts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedCounts();
  }, []);

  const flattenObject = (obj: any, prefix = ""): any => {
    let result: any = {};

    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
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
      alert(`No ${filename} data available to download`);
      return;
    }

    const flattenedData = data.map((item) => flattenObject(item));

    const headerSet = new Set<string>();
    flattenedData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        headerSet.add(key);
      });
    });

    const headers = Array.from(headerSet);
    const rows = flattenedData.map((item) =>
      headers
        .map((header) => {
          const value = item[header] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}_deleted_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDeletedUsers = async () => {
    console.log("📥 Downloading Deleted Users...");
    const data = await getDeletedUsers();
    downloadCSV(data, "deleted_users");
  };

  const handleDownloadDeletedOwners = async () => {
    console.log("📥 Downloading Deleted Channel Partners...");
    const data = await getDeletedOwners();
    downloadCSV(data, "deleted_channel_partners");
  };

  const handleDownloadDeletedTurfs = async () => {
    console.log("📥 Downloading Deleted Turfs...");
    const data = await getDeletedTurfs();
    downloadCSV(data, "deleted_turfs");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-3 px-md-4 mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Deleted Data</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please check the console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 mt-4">
      <div className="mb-4">
        <h3 className="fw-bold">🗑️ Deleted Items Overview</h3>
        <p className="text-muted mb-0">Track all deleted records from the platform</p>
      </div>

      <div className="row g-4 mx-0">
        <div className="col-12 col-sm-6 col-lg-4">
          <div
            className="card text-white p-4 border-0 shadow-sm h-100 stat-card"
            onClick={handleDownloadDeletedUsers}
            style={{
              background: "linear-gradient(135deg, #eb3349, #f45c43)",
              borderRadius: "16px",
              cursor: "pointer",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 small">Deleted Users</p>
                <h2 className="fw-bold mb-0">{deletedUsersCount}</h2>
                <small className="opacity-75">Click to download</small>
              </div>
              <i className="bi bi-person-x-fill fs-2"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div
            className="card text-white p-4 border-0 shadow-sm h-100 stat-card"
            onClick={handleDownloadDeletedOwners}
            style={{
              background: "linear-gradient(135deg, #f09819, #ff5858)",
              borderRadius: "16px",
              cursor: "pointer",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 small">Deleted Channel Partners</p>
                <h2 className="fw-bold mb-0">{deletedOwnersCount}</h2>
                <small className="opacity-75">Click to download</small>
              </div>
              <i className="bi bi-building-x fs-2"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div
            className="card text-white p-4 border-0 shadow-sm h-100 stat-card"
            onClick={handleDownloadDeletedTurfs}
            style={{
              background: "linear-gradient(135deg, #232526, #414345)",
              borderRadius: "16px",
              cursor: "pointer",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 small">Deleted Turfs</p>
                <h2 className="fw-bold mb-0">{deletedTurfsCount}</h2>
                <small className="opacity-75">Click to download</small>
              </div>
              <i className="bi bi-building-slash fs-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletedCountsSummary;