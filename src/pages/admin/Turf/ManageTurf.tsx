import React, { useState } from "react";
import { useTurf } from "./useTurf";
import { deleteTurf, updateTurf } from "../../../services/firestoreService";
import AdminNavbar from "../Analytics/AdminNavbar";
import { uploadTurfImages } from "../../../services/storageService";
import { getAuth } from "firebase/auth"; 
import { useAuth } from "./useAuth";
import * as XLSX from "xlsx";

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
        s.length >= 3 &&
        !/^\d+$/.test(s) &&
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

  // --- EXPORT TO EXCEL LOGIC ---
  const handleExportToExcel = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // 1. MAIN TURF DATA SHEET
    const mainData = turfs.map((turf, index) => ({
      'S.No': index + 1,
      'Turf ID': turf.id || turf.turf_id || '',
      'Turf Name': turf.turf_name || '',
      'Active Status': turf.turf_active_status ? 'Active' : 'Inactive',
      'Booking Type': turf.booking_type || '',
      
      // Location & Contact
      'Location': turf.turf_location || '',
      'Turf Mobile': turf.turf_mobile_number || '',
      
      // Timing
      'Opening Hour': turf.turf_opening_hour || '',
      'Closing Hour': turf.turf_closing_hour || '',
      
      // Dimensions
      'Length': turf.turf_length || '',
      'Breadth': turf.turf_breadth || '',
      'Height': turf.turf_height || '',
      
      // Owner Details
      'Owner ID': turf.owner_id || '',
      'Owner Name': turf.owner_name || '',
      'Owner Mobile': turf.owner_mobile_number || '',
      'Owner Email': turf.owner_email || '',
      
      // Sports & Amenities
      'Available Sports': turf.available_sports_list?.join(", ") || '',
      'Amenities': turf.amenities?.join(", ") || '',
      
      // Description & Images
      'Description': turf.turf_description || '',
      'Total Images': turf.turf_images?.length || 0,
      'Primary Image URL': turf.turf_images?.[0] || turf.turf_image_url || '',
    }));

    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    mainSheet['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 25 }, // Turf ID
      { wch: 25 }, // Turf Name
      { wch: 12 }, // Active Status
      { wch: 12 }, // Booking Type
      { wch: 40 }, // Location
      { wch: 15 }, // Turf Mobile
      { wch: 12 }, // Opening Hour
      { wch: 12 }, // Closing Hour
      { wch: 10 }, // Length
      { wch: 10 }, // Breadth
      { wch: 10 }, // Height
      { wch: 25 }, // Owner ID
      { wch: 20 }, // Owner Name
      { wch: 15 }, // Owner Mobile
      { wch: 25 }, // Owner Email
      { wch: 30 }, // Available Sports
      { wch: 30 }, // Amenities
      { wch: 50 }, // Description
      { wch: 12 }, // Total Images
      { wch: 50 }, // Primary Image URL
    ];
    XLSX.utils.book_append_sheet(workbook, mainSheet, "Main Data");

    // 2. SPORT PRICING SHEET
    const pricingData: any[] = [];
    turfs.forEach((turf) => {
      if (turf.sport_specific_price) {
        Object.entries(turf.sport_specific_price).forEach(([sport, days]) => {
          Object.entries(days).forEach(([day, prices]) => {
            pricingData.push({
              'Turf ID': turf.id || turf.turf_id,
              'Turf Name': turf.turf_name,
              'Sport': sport,
              'Day': day,
              'Day Price': prices.day || '',
              'Night Price': prices.night || '',
            });
          });
        });
      }
    });

    if (pricingData.length > 0) {
      const pricingSheet = XLSX.utils.json_to_sheet(pricingData);
      pricingSheet['!cols'] = [
        { wch: 25 }, // Turf ID
        { wch: 25 }, // Turf Name
        { wch: 15 }, // Sport
        { wch: 12 }, // Day
        { wch: 12 }, // Day Price
        { wch: 12 }, // Night Price
      ];
      XLSX.utils.book_append_sheet(workbook, pricingSheet, "Sport Pricing");
    }

    // 3. SPORT TIMING SHEET
    const timingData: any[] = [];
    turfs.forEach((turf) => {
      if (turf.sport_specific_timing) {
        Object.entries(turf.sport_specific_timing).forEach(([sport, timing]) => {
          timingData.push({
            'Turf ID': turf.id || turf.turf_id,
            'Turf Name': turf.turf_name,
            'Sport': sport,
            'Opening Time': timing.opening_time || '',
            'Closing Time': timing.closing_time || '',
            'Day Start': timing.day_start_time || '',
            'Day End': timing.day_end_time || '',
            'Night Start': timing.night_start_time || '',
            'Night End': timing.night_end_time || '',
            'Available': timing.sport_available ? 'Yes' : 'No',
            'Court Count': timing.court_count || '',
          });
        });
      }
    });

    if (timingData.length > 0) {
      const timingSheet = XLSX.utils.json_to_sheet(timingData);
      timingSheet['!cols'] = [
        { wch: 25 }, // Turf ID
        { wch: 25 }, // Turf Name
        { wch: 15 }, // Sport
        { wch: 12 }, // Opening Time
        { wch: 12 }, // Closing Time
        { wch: 12 }, // Day Start
        { wch: 12 }, // Day End
        { wch: 12 }, // Night Start
        { wch: 12 }, // Night End
        { wch: 10 }, // Available
        { wch: 12 }, // Court Count
      ];
      XLSX.utils.book_append_sheet(workbook, timingSheet, "Sport Timing");
    }

    // 4. PERSON COUNT SHEET
    const personCountData: any[] = [];
    turfs.forEach((turf) => {
      if (turf.sports_specific_person_count) {
        Object.entries(turf.sports_specific_person_count).forEach(([sport, count]) => {
          personCountData.push({
            'Turf ID': turf.id || turf.turf_id,
            'Turf Name': turf.turf_name,
            'Sport': sport,
            'Person Count': count,
          });
        });
      }
    });

    if (personCountData.length > 0) {
      const personCountSheet = XLSX.utils.json_to_sheet(personCountData);
      personCountSheet['!cols'] = [
        { wch: 25 }, // Turf ID
        { wch: 25 }, // Turf Name
        { wch: 15 }, // Sport
        { wch: 12 }, // Person Count
      ];
      XLSX.utils.book_append_sheet(workbook, personCountSheet, "Person Count");
    }

    // 5. ALL IMAGES SHEET
    const imagesData: any[] = [];
    turfs.forEach((turf) => {
      if (turf.turf_images && turf.turf_images.length > 0) {
        turf.turf_images.forEach((imageUrl, index) => {
          imagesData.push({
            'Turf ID': turf.id || turf.turf_id,
            'Turf Name': turf.turf_name,
            'Image Number': index + 1,
            'Image URL': imageUrl,
          });
        });
      }
    });

    if (imagesData.length > 0) {
      const imagesSheet = XLSX.utils.json_to_sheet(imagesData);
      imagesSheet['!cols'] = [
        { wch: 25 }, // Turf ID
        { wch: 25 }, // Turf Name
        { wch: 12 }, // Image Number
        { wch: 60 }, // Image URL
      ];
      XLSX.utils.book_append_sheet(workbook, imagesSheet, "All Images");
    }

    // Generate filename with current date
    const date = new Date();
    const filename = `Turfs_Complete_Data_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, filename);
  };

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

  // --- MODIFY LOGIC ---
  const handleModify = (turf: any) => {
    console.log("Setting selected turf for modification:", turf);
    setSelectedTurf({ ...turf });
  };

  const handleUpdateSubmit = async () => {
    if (!selectedTurf?.id) return;
    setIsUpdating(true);

    try {
      let finalImageUrls = selectedTurf.turf_images || [];

      // 1. If new files are selected, upload them to Storage
      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadTurfImages(
          selectedTurf.id, 
          selectedTurf.owner_id, 
          selectedFiles
        );
        finalImageUrls = uploadedUrls; 
      }

      const updatedData = {
        turf_name: selectedTurf.turf_name,
        turf_location: selectedTurf.turf_location,
        turf_mobile_number: selectedTurf.turf_mobile_number,
        available_sports_list: selectedTurf.available_sports_list,
        turf_images: finalImageUrls,
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
    <>
      <style>{`
        /* Reset and Base Styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .manage-turf-container {
          min-height: 100vh;
          background-color: #f8f9fa;
          padding-top: 70px;
          width: 100%;
          overflow-x: hidden;
        }

        /* Container Responsive */
        .content-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem;
        }

        @media (min-width: 768px) {
          .content-wrapper {
            padding: 1.5rem;
          }
        }

        @media (min-width: 1200px) {
          .content-wrapper {
            padding: 2rem;
          }
        }

        /* Header Section */
        .header-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 992px) {
          .header-section {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
          }
        }

        .header-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #198754;
          margin-bottom: 0.25rem;
        }

        @media (min-width: 768px) {
          .header-content h1 {
            font-size: 2rem;
          }
        }

        @media (min-width: 1200px) {
          .header-content h1 {
            font-size: 2.5rem;
          }
        }

        .header-content p {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0;
        }

        @media (min-width: 768px) {
          .header-content p {
            font-size: 1rem;
          }
        }

        /* Header Right Section */
        .header-right {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        @media (min-width: 576px) {
          .header-right {
            flex-direction: row;
            align-items: center;
          }
        }

        /* Export Button */
        .export-button {
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          color: white;
          border: none;
          border-radius: 2rem;
          padding: 0.875rem 1.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .export-button:hover {
          background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.3);
        }

        .export-button:active {
          transform: translateY(0);
        }

        @media (min-width: 992px) {
          .export-button {
            padding: 1rem 1.75rem;
            font-size: 0.95rem;
          }
        }

        /* Total Count Badge */
        .total-badge {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
          border-radius: 1rem;
          padding: 1rem 1.5rem;
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
          text-align: center;
          min-width: 150px;
        }

        .total-badge-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          opacity: 0.9;
          letter-spacing: 1px;
          font-weight: 600;
          display: block;
          margin-bottom: 0.25rem;
        }
           .excel-badge-label {
          font-size: 30px;
          text-transform: uppercase;
          opacity: 0.9
          padding-left: 15px;
          font-weight: 600;
          display: block;
        }

        .total-badge-count {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        /* Search and Filter Section */
        .search-filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .search-filter-section {
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 2rem;
          }
        }

        .search-wrapper {
          flex: 1;
          position: relative;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .search-input-group:focus-within {
          border-color: #198754;
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.15);
        }

        .search-icon {
          padding: 0 1rem;
          font-size: 1.25rem;
          color: #6c757d;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          background: transparent;
        }

        @media (max-width: 576px) {
          .search-input {
            font-size: 0.875rem;
            padding: 0.75rem 0.5rem;
          }
        }

        /* Filter Dropdown */
        .filter-dropdown {
          position: relative;
          width: 100%;
        }

        @media (min-width: 768px) {
          .filter-dropdown {
            width: auto;
            min-width: 180px;
          }
        }

        .filter-button {
          width: 100%;
          background: white;
          border: 2px solid #198754;
          color: #198754;
          border-radius: 2rem;
          padding: 0.875rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .filter-button:hover {
          background: #198754;
          color: white;
        }

        .filter-button:active {
          transform: scale(0.98);
        }

        .filter-dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
          display: none;
        }

        .filter-dropdown-menu.show {
          display: block;
        }

        .filter-dropdown-item {
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          transition: background 0.2s ease;
          font-size: 0.95rem;
        }

        .filter-dropdown-item:hover {
          background: #f8f9fa;
        }

        .filter-dropdown-item.active {
          background: #e7f5ec;
          color: #198754;
          font-weight: 600;
        }

        .filter-divider {
          height: 1px;
          background: #e9ecef;
          margin: 0.5rem 0;
        }

        /* Results Count */
        .results-count {
          text-align: center;
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        /* Turf Cards Grid */
        .turf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 576px) {
          .turf-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }

        @media (min-width: 992px) {
          .turf-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 1400px) {
          .turf-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Turf Card */
        .turf-card {
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .turf-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .turf-card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          overflow: hidden;
        }

        .turf-card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .turf-card:hover .turf-card-image {
          transform: scale(1.05);
        }

        .turf-card-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #198754;
          color: white;
          padding: 0.375rem 0.875rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .turf-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        @media (max-width: 576px) {
          .turf-card-body {
            padding: 1rem;
          }
        }

        .turf-card-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #198754;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        @media (max-width: 576px) {
          .turf-card-title {
            font-size: 1rem;
          }
        }

        .turf-card-sports {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .sport-badge {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          padding: 0.375rem 0.75rem;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .sport-badge-icon {
          font-size: 1rem;
        }

        @media (max-width: 576px) {
          .sport-badge {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
          }
        }

        .turf-card-location {
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          margin-top: auto;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          cursor: pointer;
          transition: color 0.2s ease;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .turf-card-location:hover {
          color: #0d6efd;
        }

        .location-icon {
          flex-shrink: 0;
          font-size: 1rem;
        }

        .turf-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        @media (max-width: 400px) {
          .turf-card-actions {
            grid-template-columns: 1fr;
          }
        }

        .action-button {
          padding: 0.75rem 1rem;
          border: 2px solid;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }

        .action-button:active {
          transform: scale(0.96);
        }

        .action-button-modify {
          background: white;
          color: #0d6efd;
          border-color: #0d6efd;
        }

        .action-button-modify:hover {
          background: #0d6efd;
          color: white;
        }

        .action-button-delete {
          background: white;
          color: #dc3545;
          border-color: #dc3545;
        }

        .action-button-delete:hover {
          background: #dc3545;
          color: white;
        }

        /* Empty State */
        .empty-state {
          background: white;
          border-radius: 1.25rem;
          padding: 3rem 1.5rem;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .empty-state-icon {
          font-size: 4rem;
          opacity: 0.3;
          margin-bottom: 1.5rem;
        }

        .empty-state-title {
          font-size: 1.5rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .empty-state-text {
          color: #adb5bd;
          font-size: 1rem;
        }

        /* Modal Styles */
        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
          backdrop-filter: blur(4px);
        }

        .modal-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
        }

        .modal-dialog-custom {
          width: 100%;
          max-width: 600px;
          margin: auto;
        }

        .modal-content-custom {
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header-custom {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .modal-title-custom {
          font-size: 1.5rem;
          font-weight: 700;
          color: #198754;
          margin: 0;
        }

        @media (max-width: 576px) {
          .modal-title-custom {
            font-size: 1.25rem;
          }
        }

        .modal-close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .modal-close-button:hover {
          background: #f8f9fa;
          color: #212529;
        }

        .modal-body-custom {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .modal-footer-custom {
          padding: 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        @media (max-width: 576px) {
          .modal-footer-custom {
            flex-direction: column-reverse;
          }
        }

        /* Form Styles */
        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label-custom {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: #212529;
          margin-bottom: 0.5rem;
        }

        .form-input-custom {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 0.75rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input-custom:focus {
          border-color: #198754;
          box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1);
        }

        .form-textarea-custom {
          resize: vertical;
          min-height: 100px;
        }

        .form-hint {
          font-size: 0.75rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        /* Image Upload Section */
        .image-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 0.75rem;
          border: 2px dashed #dee2e6;
        }

        .image-preview {
          width: 80px;
          height: 80px;
          border-radius: 0.75rem;
          object-fit: cover;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 576px) {
          .image-preview {
            width: 60px;
            height: 60px;
          }
        }

        .image-upload-input-wrapper {
          flex: 1;
        }

        .file-input-custom {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        /* Modal Buttons */
        .modal-button {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .modal-button:active {
          transform: scale(0.96);
        }

        .modal-button-cancel {
          background: #f8f9fa;
          color: #6c757d;
        }

        .modal-button-cancel:hover {
          background: #e9ecef;
        }

        .modal-button-primary {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
        }

        .modal-button-primary:hover {
          background: linear-gradient(135deg, #157347 0%, #146c43 100%);
        }

        .modal-button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Scrollbar Styles */
        .modal-body-custom::-webkit-scrollbar,
        .filter-dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body-custom::-webkit-scrollbar-track,
        .filter-dropdown-menu::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .modal-body-custom::-webkit-scrollbar-thumb,
        .filter-dropdown-menu::-webkit-scrollbar-thumb {
          background: #198754;
          border-radius: 10px;
        }

        .modal-body-custom::-webkit-scrollbar-thumb:hover,
        .filter-dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: #157347;
        }

        /* Loading State */
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .spinner-large {
          width: 3rem;
          height: 3rem;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #198754;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="manage-turf-container">
        <AdminNavbar />
        
        <div className="content-wrapper">
          {/* Header Section */}
          <div className="header-section">
            <div className="header-content">
              <h1>Manage Your Turfs</h1>
              <p>View, edit, or remove turfs from the main database</p>
            </div>
            
            <div className="header-right">
            
              
              <div className="total-badge">
                <span className="total-badge-label">Total Turfs</span>
                <h2 className="total-badge-count">{turfs.length}</h2>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-wrapper">
              <div className="search-input-group">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-dropdown">
              <button
                className="filter-button"
                onClick={() => {
                  const menu = document.getElementById('filter-menu');
                  menu?.classList.toggle('show');
                }}
              >
                <span>{selectedSport === "all" ? "Filter Sports" : selectedSport}</span>
                <span>▼</span>
              </button>

              <div id="filter-menu" className="filter-dropdown-menu">
                <button
                  className={`filter-dropdown-item ${selectedSport === "all" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSport("all");
                    document.getElementById('filter-menu')?.classList.remove('show');
                  }}
                >
                  All Sports
                </button>
                <div className="filter-divider"></div>
                {availableSports.map((sport) => (
                  <button
                    key={sport}
                    className={`filter-dropdown-item ${selectedSport === sport ? "active" : ""}`}
                    onClick={() => {
                      setSelectedSport(sport);
                      document.getElementById('filter-menu')?.classList.remove('show');
                    }}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
              <button className="btn btn-success " onClick={handleExportToExcel}>
                <span className="excel-badge-label"><i className="fa-solid fa-file-excel"></i></span>
              </button>
          </div>

          {/* Results Count */}
          {(search || selectedSport !== "all") && (
            <div className="results-count">
              Showing {filteredTurfs.length} of {turfs.length} turfs
            </div>
          )}

          {/* Turf Cards Grid */}
          {filteredTurfs.length > 0 ? (
            <div className="turf-grid">
              {filteredTurfs.map((turf) => (
                <div className="turf-card" key={turf.turf_id}>
                  <div className="turf-card-image-wrapper">
                    <img 
                      src={turf.turf_images?.[0] || "https://via.placeholder.com/400x250/67a521/ffffff?text=Turf+Image"} 
                      className="turf-card-image"
                      alt={turf.turf_name}
                    />
                    <div className="turf-card-badge">Active</div>
                  </div>

                  <div className="turf-card-body">
                    <h3 className="turf-card-title">{turf.turf_name}</h3>
                    
                    <div className="turf-card-sports">
                      {turf.available_sports_list?.slice(0, 3).map((sport: string, i: number) => (
                        <div key={i} className="sport-badge">
                          <span className="sport-badge-icon">{sportIcon(sport)}</span>
                          <span>{sport}</span>
                        </div>
                      ))}
                    </div>

                    <div 
                      className="turf-card-location"
                      onClick={() => openInGoogleMaps(turf.turf_location)}
                      title="Click to open in Google Maps"
                    >
                      <span className="location-icon">📍</span>
                      <span>{turf.turf_location}</span>
                    </div>

                    {/* <div className="turf-card-actions">
                      <button
                        className="action-button action-button-modify"
                        onClick={() => handleModify(turf)}
                      >
                        <span>✏️</span>
                        <span>Modify</span>
                      </button>
                      <button
                        className="action-button action-button-delete"
                        onClick={() => handleDelete(turf.id, turf.turf_name)}
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏟️</div>
              <h3 className="empty-state-title">No Turfs Found</h3>
              <p className="empty-state-text">
                {search || selectedSport !== "all" 
                  ? "Try adjusting your filters" 
                  : "No turfs available in the database"}
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {selectedTurf && (
          <>
            <div 
              className="modal-backdrop-custom"
              onClick={() => {
                setSelectedTurf(null);
                clearImageStates();
              }}
            />
            
            <div className="modal-wrapper">
              <div className="modal-dialog-custom">
                <div className="modal-content-custom">
                  <div className="modal-header-custom">
                    <h2 className="modal-title-custom">Update Turf Details</h2>
                    <button 
                      className="modal-close-button"
                      onClick={() => {
                        setSelectedTurf(null);
                        clearImageStates();
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-body-custom">
                    {/* Image Upload */}
                    <div className="form-group">
                      <label className="form-label-custom">Update Turf Image</label>
                      <div className="image-upload-wrapper">
                        <img 
                          src={previews.length > 0 ? previews[0] : (selectedTurf.turf_images?.[0] || "https://via.placeholder.com/100")} 
                          alt="Turf" 
                          className="image-preview"
                        />
                        <div className="image-upload-input-wrapper">
                          <input
                            type="file"
                            className="file-input-custom"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                setSelectedFiles(files);
                                const newPreviews = files.map(file => URL.createObjectURL(file));
                                setPreviews(newPreviews);
                              }
                            }}
                          />
                          <div className="form-hint">Select new file(s) to replace current image</div>
                        </div>
                      </div>
                    </div>

                    {/* Turf Name */}
                    <div className="form-group">
                      <label className="form-label-custom">Turf Name</label>
                      <input
                        type="text"
                        className="form-input-custom"
                        value={selectedTurf.turf_name}
                        onChange={(e) => setSelectedTurf({ ...selectedTurf, turf_name: e.target.value })}
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="form-group">
                      <label className="form-label-custom">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-input-custom"
                        value={selectedTurf.turf_mobile_number}
                        onChange={(e) => setSelectedTurf({ ...selectedTurf, turf_mobile_number: e.target.value })}
                      />
                    </div>

                    {/* Sports Available */}
                    <div className="form-group">
                      <label className="form-label-custom">Sports Available</label>
                      <input
                        type="text"
                        className="form-input-custom"
                        value={selectedTurf.available_sports_list?.join(", ") || ""}
                        onChange={(e) => setSelectedTurf({ 
                          ...selectedTurf, 
                          available_sports_list: e.target.value.split(",").map(s => s.trim()) 
                        })}
                        placeholder="e.g., Cricket, Football, Badminton"
                      />
                      <div className="form-hint">Separate sports with commas</div>
                    </div>

                    {/* Address */}
                    <div className="form-group">
                      <label className="form-label-custom">Address</label>
                      <textarea
                        className="form-input-custom form-textarea-custom"
                        value={selectedTurf.turf_location}
                        onChange={(e) => setSelectedTurf({ ...selectedTurf, turf_location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="modal-footer-custom">
                    <button 
                      className="modal-button modal-button-cancel"
                      onClick={() => {
                        setSelectedTurf(null);
                        clearImageStates();
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-button modal-button-primary"
                      onClick={handleUpdateSubmit}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <div className="spinner" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ManageTurf;