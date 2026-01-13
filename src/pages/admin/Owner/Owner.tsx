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

  return (
    <div className="admin-page-container">
      <AdminNavbar />
      <h2 className="text-center text-success mt-5 pt-4 mb-4 fw-bold">
        Channel Partner List
      </h2>

      <div className="mb-4"
       style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
        }}>
        <input
          type="text"
          className="form-control shadow-sm"
          placeholder="Search by Partners..."
          value={searchTerm}
                    style={{ width: "100%", paddingRight: "40px" }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
          <span
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#888",
          }}
        >
          🔍
        </span>
      </div>

      {filteredOwners.length === 0 ? (
        <p className="text-center text-muted">No matching owners found.</p>
      ) : (
        <ul className="list-group shadow-sm">
          {filteredOwners.map((owner) => (
            <div
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap rounded-3 mb-3 border-0 shadow-sm"
              style={{
                marginLeft: "130px",
                width: "80%",
                backgroundColor: "#5ad79f",
                color: "#02613a",
              }}
            >
              <div>
                <h5 className="fw-bold mb-1">{owner.owner_name}</h5>
                <p className="mb-1">📧 {owner.owner_email}</p>
                <p className="mb-0">📱 {owner.owner_mobile_number}</p>
                {/* <p className="mb-0">🆔 {owner.owner_id}</p> */}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <Link
                  className="badge bg-light text-success rounded-pill px-3 py-2 me-3" // add me-3 for margin
                  key={owner.owner_id}
                  to={`/dashboard/owners/${owner.owner_id}`}
                  style={{ textDecoration: "none" }}
                >
                  View Turf →
                </Link>
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Owner;
