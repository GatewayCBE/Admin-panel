import React, { useState } from "react";
import { useTurf } from "./useTurf";
import { deleteTurf, updateTurf } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";
import { uploadTurfImages } from "../../../services/storageService";
import { getAuth } from "firebase/auth"; 
import { useAuth } from "./useAuth";

const ManageTurf: React.FC = () => {
  const { turfs } = useTurf();
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  
  // State for Modal and Editing
  const [selectedTurf, setSelectedTurf] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [previews, setPreviews] = useState<string[]>([]);

// Helper to clear images when closing modal
const clearImageStates = () => {
  setSelectedFiles([]);
  setPreviews([]);
};




const extractSports = (raw: string): string[] => {
  if (!raw) return [];

  return raw
    .toLowerCase()

    // unify separators
    .replace(/&/g, ",")
    .replace(/\//g, ",")

    // split combined strings
    .split(",")

    // clean each token
    .map(s => s.trim())

    // 🚫 remove empty, numeric, short junk, address-like tokens
    .filter(s =>
      s.length >= 3 &&           // ignore very short junk
      !/^\d+$/.test(s) &&        // ignore numbers
      !s.includes("road") &&
      !s.includes("rd") &&
      !s.includes("street") &&
      !s.includes("colony") &&
      !s.includes("nagar") &&
      !s.includes("salem") &&
      !s.includes("tamil") &&
      !s.includes("district")
    )
    .map(s => {
      // 🔧 spelling + variation fixes
      if (s.includes("cricket")) return "Cricket";
      if (s.includes("football") || s === "footbal") return "Football";
      if (s.includes("badminton") || s === "batminton") return "Badminton";
      if (s.includes("pickle")) return "Pickleball";

      // fallback for new sports
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
};

const filteredTurfs = turfs.filter(turf => {
  const matchesSearch =
    turf.turf_name.toLowerCase().includes(search.toLowerCase()) ||
    turf.turf_location.toLowerCase().includes(search.toLowerCase());

const matchesSport =
  selectedSport === "all" ||
  turf.available_sports_list?.some((sport: string) =>
    extractSports(sport).includes(selectedSport)
  );


  return matchesSearch && matchesSport;
});




const availableSports = Array.from(
  new Set(
    turfs.flatMap(turf =>
      turf.available_sports_list?.flatMap((sport: string) =>
        extractSports(sport)
      ) || []
    )
  )
).sort();




  // --- DELETE LOGIC ---
  const handleDelete = async (turfId: string, name: string) => {
  if (!window.confirm(`Delete "${name}"?`)) return;

  if (loading) {
    alert("Auth loading, please wait");
    return;
  }

  if (!user) {
    alert("Session expired. Please login again.");
    return;
  }

  const tokenResult = await user.getIdTokenResult(true);
  console.log("Admin claim:", tokenResult.claims.admin);

  if (!tokenResult.claims.admin) {
    alert("❌ You are not an admin");
    return;
  }

  const token = await user.getIdToken(true);

  const res = await fetch(
    "https://asia-south1-play-arena-e83d8.cloudfunctions.net/deleteTurfByAdmin",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ turfId }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Delete failed");
    return;
  }

  alert("✅ Turf deleted successfully");
  window.location.reload();
};


//   // --- MODIFY LOGIC ---
  const handleModify = (turf: any) => {
    // Ensure we are setting the turf object including the 'id'
  console.log("Setting selected turf for modification:", turf);
    setSelectedTurf({ ...turf }); // Clone the turf data into state
  };

  const handleUpdateSubmit = async () => {
  if (!selectedTurf?.id) return;
  setIsUpdating(true);

  try {
    let finalImageUrls = selectedTurf.turf_images || [];

    // 1. If new files are selected, upload them to Storage
    if (selectedFiles.length > 0) {
      // Pass turfId, ownerId (from selectedTurf), and the files array
      const uploadedUrls = await uploadTurfImages(
        selectedTurf.id, 
        selectedTurf.owner_id, 
        selectedFiles
      );
      // Replace or append? Usually, for a single primary image, we replace:
      finalImageUrls = uploadedUrls; 
    }

    const updatedData = {
      turf_name: selectedTurf.turf_name,
      turf_location: selectedTurf.turf_location,
      turf_mobile_number: selectedTurf.turf_mobile_number,
      available_sports_list: selectedTurf.available_sports_list,
      turf_images: finalImageUrls, // Save the URLs to Firestore
    };

    await updateTurf(selectedTurf.id, updatedData);
    alert("Updated successfully!");
    
    setSelectedTurf(null);
    clearImageStates();
    window.location.reload();
  } catch (error) {
    console.error("Update failed:", error);
    alert("Update failed. Please check permissions.");
  } finally {
    setIsUpdating(false);
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
      {/* UPDATED HEADER WITH COUNT */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="text-success fw-bold mb-0 display-6">Manage Your Turfs</h3>
            <p className="text-muted small mb-0">View, edit, or remove turfs from the main database</p>
          </div>
          
          {/* Total Count Badge */}
          <div className="text-end">
            <div className="card shadow-sm border-0 px-4 py-2 bg-success text-white rounded-pill">
              <span className="small fw-semibold text-uppercase opacity-75 d-block" style={{ fontSize: '0.7rem' }}>
                Total Turfs
              </span>
              <h4 className="fw-bold mb-0">{turfs.length}</h4>
            </div>
          </div>
        </div>

      {/* Search Bar Code remains same... */}
    <div className="row justify-content-center mb-4">
  <div className="col-md-10 col-lg-8">
    <div className="d-flex gap-3 align-items-center">
      
      {/* Search */}
      <div className="input-group input-group-lg shadow-sm rounded-pill flex-grow-1">
        <span className="input-group-text bg-white border-end-0 rounded-start-pill">
          🔍
        </span>
        <input
          type="text"
          className="form-control border-start-0 rounded-end-pill"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Sports Filter */}
<div className="dropdown">
  <button
    className="btn btn-outline-success btn-lg rounded-pill dropdown-toggle"
    data-bs-toggle="dropdown"
  >
    {selectedSport === "all" ? "Filter Sports" : selectedSport}
  </button>

  <ul className="dropdown-menu">
    <li>
      <button
        className="dropdown-item"
        onClick={() => setSelectedSport("all")}
      >
        All Sports
      </button>
    </li>

    {availableSports.map((sport) => (
      <li key={sport}>
        <button
          className="dropdown-item"
          onClick={() => setSelectedSport(sport)}
        >
          {sport}
        </button>
      </li>
    ))}
  </ul>
</div>



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
  <label className="form-label small fw-bold">Update Turf Image</label>
  <div className="d-flex align-items-center gap-3 p-2 border rounded-3 bg-light">
    <img 
      src={previews.length > 0 ? previews[0] : (selectedTurf.turf_images?.[0] || "https://via.placeholder.com/100")} 
      alt="Turf" 
      className="rounded-3 shadow-sm"
      style={{ width: "70px", height: "70px", objectFit: "cover" }}
    />
    
    <div className="flex-grow-1">
      <input
        type="file"
        className="form-control form-control-sm"
        accept="image/*"
        multiple // Remove this if you only want 1 image
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            setSelectedFiles(files);
            // Create temporary browser URLs for preview
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
          }
        }}
      />
      <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
        Select a new file to change the current image.
      </small>
    </div>
  </div>
</div>
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