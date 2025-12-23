import React, { useState } from "react";
import { useTurf } from "./useTurf";
import { deleteTurf, updateTurf } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";

const ManageTurf: React.FC = () => {
  const { turfs } = useTurf();
  const [search, setSearch] = useState("");
  
  // State for Modal and Editing
  const [selectedTurf, setSelectedTurf] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredTurfs = turfs.filter((turf) =>
    turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
    turf.turf_location.toLowerCase().includes(search.toLowerCase())
  );

  // --- DELETE LOGIC ---
  const handleDelete = async (id: string, name: string) => {
    // Debugging: This will show you exactly what ID is being passed in the console
  console.log("Received ID for deletion:", id);
  // 1. Check if ID exists (common issue: id vs turf_id)
  if (!id) {
    alert("Error: Could not find the ID for this turf.");
    return;
  }

  const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
  
  if (confirmDelete) {
    try {
      console.log("Attempting to delete turf with ID:", id);
      await deleteTurf(id);
      
      alert("✅ Turf deleted successfully");
      
      // 2. Refresh the window to sync with Firestore
      window.location.reload(); 
      
    } catch (error: any) {
      console.error("Firestore Delete Error:", error);
      alert(`❌ Failed to delete: ${error.message}`);
    }
  }
};

  // --- MODIFY LOGIC ---
  const handleModify = (turf: any) => {
    // Ensure we are setting the turf object including the 'id'
  console.log("Setting selected turf for modification:", turf);
    setSelectedTurf({ ...turf }); // Clone the turf data into state
  };

  const handleUpdateSubmit = async () => {
    if (!selectedTurf?.id){
        alert("Missing Turf ID for update");
        return;
    } 
    try {
      const updatedData = {
        turf_name: selectedTurf.turf_name,
        turf_location: selectedTurf.turf_location,
        turf_mobile_number: selectedTurf.turf_mobile_number,
        turf_available_sports_list: selectedTurf.available_sports_list,
      };
      await updateTurf(selectedTurf.id, updatedData);
      alert("Updated successfully!");
      setSelectedTurf(null); // Close modal
      window.location.reload();
    } catch (error) {
      alert("Update failed.");
    }
  };

  const sportIcon = (sport: string) => {
    sport = sport.toLowerCase();
    if (sport.includes("football")) return "⚽";
    if (sport.includes("cricket")) return "🏏";
    if (sport.includes("badminton")) return "🏸";
    return "🎯";
  };

  const openInGoogleMaps = (address: string) => {
    if (!address) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
  };

  return (
    <div className="admin-page-container">
        <AdminNavbar />
    <div className="container py-1">
      <h3 className="text-center text-success fw-bold mb-4 display-5">Manage Your Turfs</h3>

      {/* Search Bar Code remains same... */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <div className="input-group input-group-lg shadow-sm rounded-pill">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill">🔍</span>
            <input
              type="text"
              className="form-control border-start-0 rounded-end-pill"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredTurfs.map((turf) => (
          <div className="col-12 col-md-6 col-lg-4" key={turf.turf_id}>
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
              {/* Image Section code remains same... */}
              <img 
                 src={turf.turf_images?.[0] || "https://via.placeholder.com/400x200"} 
                 className="w-100" style={{ height: "200px", objectFit: "cover" }} 
                 alt=""
              />

              <div className="card-body bg-white d-flex flex-column">
                <h5 className="fw-bold text-success mb-2">{turf.turf_name}</h5>
                
                {/* Sports Icons */}
                <div className="mb-2">
                  {turf.available_sports_list?.map((sport: string, i: number) => (
                    <span key={i} className="me-2 small text-muted">
                      {sportIcon(sport)} {sport}
                    </span>
                  ))}
                </div>

                <p className="text-muted small mb-4 mt-auto text-truncate" onClick={() => openInGoogleMaps(turf.turf_location)}>
                  📍 {turf.turf_location}
                </p>

                {/* ACTION BUTTONS */}
                <div className="d-flex gap-2">
                  <button
  className="btn btn-outline-primary flex-grow-1 rounded-pill fw-semibold"
  onClick={() => handleModify(turf)}
>
  ✏️ Modify
</button>
                  <button
                    className="btn btn-outline-danger flex-grow-1 rounded-pill fw-semibold"
                    onClick={() => handleDelete(turf.id, turf.turf_name)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- EDIT MODAL --- */}
      {selectedTurf && (
        <div className="modal fade show d-block" id="editModal" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-success">Update Turf Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTurf(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Turf Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={selectedTurf.turf_name}
                    onChange={(e) => setSelectedTurf({ ...selectedTurf, turf_name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={selectedTurf.turf_mobile_number}
                    onChange={(e) => setSelectedTurf({ ...selectedTurf, turf_mobile_number: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-bold">Sports Available</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={selectedTurf.available_sports_list?.join(", ") || ""}
                      onChange={(e) => setSelectedTurf({ ...selectedTurf, available_sports_list: e.target.value.split(",").map(s => s.trim()) })}
                    />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Address</label>
                  <textarea
                    className="form-control rounded-3"
                    rows={3}
                    value={selectedTurf.turf_location}
                    onChange={(e) => setSelectedTurf({ ...selectedTurf, turf_location: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setSelectedTurf(null)}>Cancel</button>
                <button 
                  className="btn btn-success rounded-pill px-4" 
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ManageTurf;