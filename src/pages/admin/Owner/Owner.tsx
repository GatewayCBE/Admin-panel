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

      {/* PAGE TITLE */}
      <div className="container pt-5 mt-4">
        <h2 className="text-center text-success mb-4 fw-bold">
          Channel Partner List
        </h2>

        {/* SEARCH BAR */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
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
          <button className="btn btn-success btn-lg w-50">
              Total Channel Partners: {ownersList.length}
            </button>
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
