import React, { useEffect, useState } from "react";
import { useOwner } from "./useOwner";

const Owner: React.FC = () => {
  const { ownersList } = useOwner();

  return (
    <div className="owner-page">
      <h2 className="owner-title">Channel Partner List</h2>
      {ownersList.length === 0 ? (
        <p>No owners available.</p>
      ) : (
        <div className="owner-grid">
          {ownersList.map((owner) => (
            <div key={owner.owner_id} className="owner-card">
              <h3>{owner.owner_name}</h3>
              <p>📧 {owner.owner_email}</p>
              <p>📱 {owner.owner_mobile_number}</p>
              <p>🆔 ID: {owner.owner_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Owner;
