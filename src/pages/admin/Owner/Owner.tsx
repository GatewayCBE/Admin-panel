import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOwner } from "./useOwner";
import AdminNavbar from "../Analytics/AdminNavbar";

const Owner: React.FC = () => {
  const { ownersList } = useOwner();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter owners based on search
  const filteredOwners = ownersList.filter(
    (owner) =>
      owner.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.owner_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.owner_mobile_number.includes(searchTerm) ||
      owner.owner_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
  if (!ownersList || ownersList.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = ["Name", "Email", "Mobile"];

  const rows = ownersList.map((owner) => [
    owner.owner_name,
    owner.owner_email,
    owner.owner_mobile_number,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "channel_partners.csv");
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="admin-page-container">
      <AdminNavbar />

      {/* PAGE TITLE */}
      <div className="container pt-5 mt-4">
        <h2 className="text-center text-success mb-4 fw-bold">
          Channel Partner List
        </h2>

<div className="row justify-content-center align-items-center mb-4 g-2">

  {/* SEARCH */}
  <div className="col-12 col-md-6">
    <div className="position-relative">
      <input
        type="text"
        className="form-control form-control-lg shadow-sm"
        placeholder="Search by name, email, mobile..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ paddingRight: "45px" }}
      />
      <span
        className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
        style={{ pointerEvents: "none" }}
      >
        🔍
      </span>
    </div>
  </div>

  {/* COUNT */}
  <div className="col-6 col-md-3">
    <button className="btn btn-success w-100">
      Total: {ownersList.length}
    </button>
  </div>

  {/* DOWNLOAD CSV */}
  <div className="col-6 col-md-3">
    <button
      className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2"
      onClick={downloadCSV}
    >
      ⬇️ Download
    </button>
  </div>

</div>
        {/* OWNER LIST */}
        {filteredOwners.length === 0 ? (
          <p className="text-center text-muted">
            No matching owners found.
          </p>
        ) : (
          <div className="row g-3">
            {filteredOwners.map((owner) => (
              <div
                key={owner.owner_id}
                className="col-12 col-md-6 col-lg-4"
              >
                <div
                  className="card h-100 border-0 shadow-sm rounded-4"
                  style={{
                    backgroundColor: "#5ad79f",
                    color: "#02613a",
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="fw-bold mb-2">
                        {owner.owner_name}
                      </h5>
                      <p className="mb-1 small">
                        📧 {owner.owner_email}
                      </p>
                      <p className="mb-0 small">
                        📱 {owner.owner_mobile_number}
                      </p>
                    </div>

                    <div className="mt-3">
                      <Link
                        to={`/dashboard/owners/${owner.owner_id}`}
                        className="btn btn-light btn-sm text-success fw-semibold rounded-pill w-100"
                        style={{ textDecoration: "none" }}
                      >
                        View Turf →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Owner;
