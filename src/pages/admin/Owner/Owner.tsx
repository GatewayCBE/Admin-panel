import React, { useState } from "react";
import { useOwner } from "./useOwner";

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
    <div className="container py-4">
      <h2 className="text-center text-success mb-4 fw-bold">
        Channel Partner List
      </h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control w-50 shadow-lg"
          placeholder="Search by Partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredOwners.length === 0 ? (
        <p className="text-center text-muted">No matching owners found.</p>
      ) : (
        <ul className="list-group shadow-sm">
          {filteredOwners.map((owner) => (
            <li
              key={owner.owner_id}
              className="list-group-item d-flex justify-content-between align-items-center flex-wrap rounded-3 mb-3 border-0 shadow-sm"
              style={{
                backgroundColor: "#02613a",
                color: "#5ad79f",
                cursor: "pointer",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5ad79f";
                e.currentTarget.style.color = "#1b4332";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#02613a";
                e.currentTarget.style.color = "#5ad79f";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div>
                <h5 className="fw-bold mb-1">{owner.owner_name}</h5>
                <p className="mb-1">📧 {owner.owner_email}</p>
                <p className="mb-0">📱 {owner.owner_mobile_number}</p>
                <p className="mb-0">🆔 {owner.owner_id}</p>
              </div>

              <div className="text-center">
                {/* <span className="badge bg-light text-success rounded-pill px-3 py-2 mb-2">
                  ID: {owner.owner_id}
                </span> */}
                <br />
                <button className="btn btn-sm btn-light fw-bold text-success">
                  Activate Channel Partner
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Owner;
