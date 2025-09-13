import React, { useEffect, useState } from "react";
import { getOwners } from "../../services/firestoreService";
import "../Style/Owner.css";

interface OwnerData {
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_mobile_number: string;
}

const Owner: React.FC = () => {
  const [owners, setOwners] = useState<OwnerData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ownerData = await getOwners();
      const formattedOwners: OwnerData[] = ownerData.map((owner: any) => ({
        owner_id: owner.owner_id ?? owner.id ?? "",
        owner_name: owner.owner_name ?? "",
        owner_email: owner.owner_email ?? "",
        owner_mobile_number: owner.owner_mobile_number ?? "",
      }));
      setOwners(formattedOwners);
    };
    fetchData();
  }, []);

  return (
    <div className="owner-page">
      <h2 className="owner-title">Channel Partner List</h2>
      {owners.length === 0 ? (
        <p>No owners available.</p>
      ) : (
        <div className="owner-grid">
          {owners.map((owner) => (
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
