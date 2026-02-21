// src/pages/admin/Owner/OwnerTurfEdit.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // adjust your firebase config path
import { uploadTurfImages } from "../../../services/storageService";
import { getTurfById } from "../../../services/firestoreService";
// import { hour12ToMinutes } from '../../../utils/dateUtils';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Sport {
  id: string;
  name: string;
  openingTime: string;
  closingTime: string;
  daySlotStart: string;
  daySlotEnd: string;
  nightSlotStart: string;
  nightSlotEnd: string;
  dayPrices: { [key: string]: string };
  nightPrices: { [key: string]: string };
  maxPersons: string;
  courtCount: string;
}

interface TurfData {
  turfName: string;
  turfAddress: string;
  turfDescription: string;
  dimensionUnit: "feet" | "meter";
  turfLength: string;
  turfBreadth: string;
  turfHeight: string;
  facilities: string[];
  hasBadmintonCourt: boolean;
  badmintonCourtType?: "synthetic" | "wooden";
}
type VenueType = "turf" | "badminton" | "pickleball" | "mixed" | null;

const OwnerTurfEdit: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]); // new images to upload
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // all images (existing + new)

  const [formData, setFormData] = useState<TurfData>({
    turfName: "",
    turfAddress: "",
    turfDescription: "",
    dimensionUnit: "feet",
    turfLength: "",
    turfBreadth: "",
    turfHeight: "",
    facilities: [],
    hasBadmintonCourt: false,
    badmintonCourtType: undefined,
  });

  const [sports, setSports] = useState<Sport[]>([]);
  const [turf, setTurf] = useState<any>(null);
  const [venueType, setVenueType] = useState<VenueType>(null);

  const facilitiesList = [
    "Parking",
    "Drinking water",
    "Rest room",
    "Dressing room",
    "Sports Kits",
    "CCTV",
    "Music systems",
  ];

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const timeStringToDate = (time: string | null) => {
  if (!time) return null;

  const [hoursStr, minutesStr] = time.split(':');

  const date = new Date();
  date.setHours(parseInt(hoursStr));
  date.setMinutes(parseInt(minutesStr));
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

const dateToTimeString = (date: Date | null) => {
  if (!date) return '';

  const hours = date.getHours(); // no padStart (removes leading zero)
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};




const convert12To24 = (time: string): string => {
  if (!time) return '';

  const match = time.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i);
  if (!match) return time;

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};


  // Fetch existing turf data
  useEffect(() => {
    if (!turfId) return;

    const fetchTurf = async () => {
      try {
        const turfData = await getTurfById(turfId);
        if (!turfData) {
          alert("Turf not found");
          navigate(-1);
          return;
        }
        if (turfData) {
          setTurf(turfData);
          setFormData({
            turfName: turfData.turf_name || "",
            //   turfMobileNumber: turfData.turf_mobile_number || '',
            turfAddress: turfData.turf_location || "",
            turfDescription: turfData.turf_description || "",
            dimensionUnit: (turfData as any).dimensionUnit || "feet",
            turfLength: turfData.turf_length || "",
            turfBreadth: turfData.turf_breadth || "",
            turfHeight: turfData.turf_height || "",
            facilities: turfData.amenities || [],
            hasBadmintonCourt: !!(turfData as any).hasBadmintonCourt,
            badmintonCourtType: (turfData as any).badmintonCourtType,
          });

          setImagePreviews(turfData.turf_images || []);

          let loadedSports: Sport[] = [];
        if (turfData.available_sports_list && turfData.sport_specific_timing) {
          loadedSports = turfData.available_sports_list.map((name: string, idx: number) => {
            const timing = turfData.sport_specific_timing?.[name.toLowerCase()] || {};
            const prices = turfData.sport_specific_price?.[name.toLowerCase()] || {};
            return {
              id: `sport-${idx}`,
              name,
              openingTime: convert12To24(timing.opening_time || ''),
                closingTime: convert12To24(timing.closing_time || ''),
                daySlotStart: convert12To24(timing.day_start_time || ''),
                daySlotEnd: convert12To24(timing.day_end_time || ''),
                nightSlotStart: convert12To24(timing.night_start_time || ''),
                nightSlotEnd: convert12To24(timing.night_end_time || ''),
              dayPrices: daysOfWeek.reduce((acc, day) => ({
                ...acc,
                [day]: prices[day]?.day?.toString() || ""
              }), {} as any),
              nightPrices: daysOfWeek.reduce((acc, day) => ({
                ...acc,
                [day]: prices[day]?.night?.toString() || ""
              }), {} as any),
              maxPersons: turfData.sports_specific_person_count?.[name]?.toString() || "",
              courtCount: timing.court_count?.toString() || "1",
            };
          });
        }
        setSports(loadedSports);

          // Detect venue type
          let detectedType: VenueType = null;
          const sportNames = loadedSports.map((s) =>
            s.name.toLowerCase().trim(),
          );

          if (sportNames.length === 0) {
            const nameLower = (turfData.turf_name || "").toLowerCase();
            if (nameLower.includes("badminton")) detectedType = "badminton";
            else if (nameLower.includes("pickle")) detectedType = "pickleball";
            else detectedType = "turf";
          } else if (sportNames.every((n) => n.includes("badminton"))) {
            detectedType = "badminton";
          } else if (sportNames.every((n) => n.includes("pickle"))) {
            detectedType = "pickleball";
          } else if (
            sportNames.some(
              (n) =>
                n.includes("cricket") ||
                n.includes("football") ||
                n.includes("box") ||
                n.includes("soccer") ||
                n.includes("turf"),
            )
          ) {
            detectedType = "turf";
          } else {
            detectedType = "mixed";
          }

          setVenueType(detectedType);

          // Auto-expand sections
        const expanded: { [key: string]: boolean } = {};
        loadedSports.forEach(s => {
          expanded[`${s.id}-day`] = true;
          expanded[`${s.id}-night`] = true;
        });
        setExpandedSections(expanded);

          if (detectedType !== "turf") {
            setFormData((prev) => ({
              ...prev,
              turfLength: "",
              turfBreadth: "",
              turfHeight: "",
            }));
          }
        }
      } catch (err) {
        console.error("Error loading turf:", err);
        alert("Failed to load turf");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [turfId, navigate]);

  const timeToMinutes = (time: string): number | null => {
  if (!time) return null;
  // const [hours, minutes] = time.split(':');
  const [hours, minutes] = time.split(':');

  return parseInt(hours) * 60 + parseInt(minutes);
};

const validateSportTimes = (sport: Sport, index: number) => {
    const errors: Record<string, string> = {};

const open = timeToMinutes(sport.openingTime);
const close = timeToMinutes(sport.closingTime);
const dayStart = timeToMinutes(sport.daySlotStart);
const dayEnd = timeToMinutes(sport.daySlotEnd);
const nightStart = timeToMinutes(sport.nightSlotStart);
let nightEnd = timeToMinutes(sport.nightSlotEnd);


    if (!sport.openingTime) errors[`openingTime-${index}`] = "Opening time is required";
    if (!sport.closingTime) errors[`closingTime-${index}`] = "Closing time is required";
    if (open == null || close == null) return errors;

    // if (close <= open) errors[`closingTime-${index}`] = "Closing must be after opening";
    // if (dayStart != null && dayStart < open) errors[`dayStart-${index}`] = "Day start cannot be before opening";
    // if (dayEnd != null && dayEnd > close) errors[`dayEnd-${index}`] = "Day end cannot be after closing";
    // if (dayStart != null && dayEnd != null && dayEnd <= dayStart) errors[`dayEnd-${index}`] = "Day end must be after day start";
    // if (nightStart != null && nightStart < open) errors[`nightStart-${index}`] = "Night start cannot be before opening";
    // if (nightEnd != null) {
    //   if (nightEnd < nightStart!) nightEnd += 1440;
    //   if (nightEnd > close) errors[`nightEnd-${index}`] = "Night end cannot be after closing";
    // }
    // if (dayEnd != null && nightStart != null && nightStart < dayEnd) errors[`nightStart-${index}`] = "Night must start after day ends";

    return errors;
  };

  const validatePrice = (value: string) => {
    if (!value.trim()) return "Price required";
    const num = Number(value);
    if (isNaN(num) || num <= 0) return "Invalid price";
    if (num > 99999) return "Price cannot exceed ₹99999";
    return "";
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.turfName.trim()) newErrors.turfName = "Venue name is required";
    if (!formData.turfAddress.trim()) newErrors.turfAddress = "Address is required";
    if (!formData.turfDescription.trim()) newErrors.turfDescription = "Description is required";
    else if (formData.turfDescription.trim().length < 30) newErrors.turfDescription = "Minimum 30 characters required";

    if (imagePreviews.length === 0) newErrors.images = "At least 1 image is required";

    if (venueType === "turf") {
      if (!formData.turfLength.trim()) newErrors.turfLength = "Turf Length is required";
      if (!formData.turfBreadth.trim()) newErrors.turfBreadth = "Turf Breadth is required";
      if (!formData.turfHeight.trim()) newErrors.turfHeight = "Turf Height is required";
    }

    if (formData.facilities.length === 0) newErrors.facilities = "At least one facility is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors: Record<string, string> = {};

    if (sports.length === 0) newErrors.sports = "At least one sport is required";

    sports.forEach((sport, index) => {
      if (!sport.name.trim()) newErrors[`sportName-${index}`] = "Sport name is required";

      newErrors = { ...newErrors, ...validateSportTimes(sport, index) };

      Object.entries(sport.dayPrices).forEach(([day, price]) => {
        const err = validatePrice(price);
        if (err) newErrors[`dayPrice-${day}-${index}`] = err;
      });

      Object.entries(sport.nightPrices).forEach(([day, price]) => {
        const err = validatePrice(price);
        if (err) newErrors[`nightPrice-${day}-${index}`] = err;
      });

      if (!sport.maxPersons.trim()) newErrors[`maxPersons-${index}`] = "Max persons is required";
      if (!sport.courtCount.trim()) newErrors[`courtCount-${index}`] = "Court count is required";
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 5) {
      setErrors(prev => ({ ...prev, images: "Maximum 5 images allowed" }));
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const updateSportField = (sportId: string, field: keyof Sport, value: any) => {
    setSports(sports.map(s => s.id === sportId ? { ...s, [field]: value } : s));
  };

  const updateSportPrice = (sportId: string, type: 'dayPrices' | 'nightPrices', day: string, value: string) => {
    setSports(sports.map(s =>
      s.id === sportId ? { ...s, [type]: { ...s[type], [day]: value } } : s
    ));
  };

  const toggleSection = (sportId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${sportId}-${section}`]: !prev[`${sportId}-${section}`]
    }));
  };

  const handleUpdate = async () => {
    if (!validateStep1() || !validateStep2() || !turfId) return;

    setSaving(true);

    try {
      let finalImages = imagePreviews.filter(url => !url.startsWith("blob:"));

      if (selectedImages.length > 0) {
        const ownerId = localStorage.getItem("user_id") || "";
        const newUrls = await uploadTurfImages(turfId, ownerId, selectedImages);
        finalImages = [...finalImages, ...newUrls];
      }

      const updateData = {
        turf_name: formData.turfName.trim(),
        turf_location: formData.turfAddress.trim(),
        turf_description: formData.turfDescription.trim(),
        amenities: formData.facilities,
        turf_length: formData.turfLength,
        turf_breadth: formData.turfBreadth,
        turf_height: formData.turfHeight,
        turf_images: finalImages.length > 0 ? finalImages : [],
        updated_at: new Date(),
        // Add sports update if needed (similar to add form)
      };

      const turfRef = doc(db, "environment", "testing", "turfs", turfId);
      await updateDoc(turfRef, updateData);

      alert("Turf updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update turf");
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-container mt-5">
      <button
        className="btn-back"
        onClick={() => navigate(-1)}
      >
        <svg width="26" height="26" fill="black" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H3.707l4.147-4.146a.5.5 0 1 0-.708-.708l-5 5a.5.5 0 0 0 0 .708l5 5a.5.5 0 0 0 .708-.708L3.707 8.5H14.5A.5.5 0 0 0 15 8z" />
        </svg>
      </button>

      <h1 className="header-title fw-bold fs-3 text-success text-center">
        Edit {venueType ? venueType.charAt(0).toUpperCase() + venueType.slice(1) : ""} Venue
      </h1>

      {/* Images */}
      <div className="mb-4">
        <label className="form-label text-muted">
          Venue Images (existing + new)
          <span className="text-danger">*</span>
        </label>
        <div className="d-flex justify-content-center mb-3">
          <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
            <div className="image-upload-box">
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <svg width="40" height="40" fill="#999" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
                </svg>
                <small className="text-muted mt-2">Add New Photos</small>
              </div>
            </div>
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className="row g-2 mb-4">
            {imagePreviews.map((src, i) => (
              <div key={i} className="col-4 col-md-3 position-relative">
                <img
                  src={src}
                  alt="preview"
                  className="img-fluid rounded shadow-sm"
                  style={{ height: "120px", objectFit: "cover" }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                  onClick={() => removeImage(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.images && <small className="text-danger d-block mt-1">{errors.images}</small>}
      </div>

      {/* Venue Name */}
      <div className="mb-3">
        <input
          type="text"
          className={`form-control custom-input ${errors.turfName ? "is-invalid" : ""}`}
          placeholder="Venue Name *"
          value={formData.turfName}
          onChange={e => {
            setFormData(prev => ({ ...prev, turfName: e.target.value }));
            if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfName: "" }));
            else setErrors(prev => ({ ...prev, turfName: "Venue name is required" }));
          }}
        />
        {errors.turfName && <small className="text-danger d-block mt-1">{errors.turfName}</small>}
      </div>

      {/* Venue Address */}
      <div className="mb-3">
        <input
          type="text"
          className={`form-control custom-input ${errors.turfAddress ? "is-invalid" : ""}`}
          placeholder="Enter City *"
          value={formData.turfAddress}
          onChange={e => {
            setFormData(prev => ({ ...prev, turfAddress: e.target.value }));
            if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfAddress: "" }));
            else setErrors(prev => ({ ...prev, turfAddress: "City is required" }));
          }}
        />
        {errors.turfAddress && <small className="text-danger d-block mt-1">{errors.turfAddress}</small>}
      </div>

      {/* Description */}
      <div className="mb-4">
        <textarea
          className={`form-control custom-input ${errors.turfDescription ? "is-invalid" : ""}`}
          placeholder={venueType === "turf" ? "Turf Description & Achievements *" : "Description & Achievements *"}
          value={formData.turfDescription}
          onChange={e => {
            setFormData(prev => ({ ...prev, turfDescription: e.target.value }));
            if (e.target.value.trim().length >= 30) setErrors(prev => ({ ...prev, turfDescription: "" }));
            else setErrors(prev => ({ ...prev, turfDescription: e.target.value.trim() ? "Minimum 30 characters required" : "Description is required" }));
          }}
          rows={6}
        />
        {errors.turfDescription && <small className="text-danger d-block mt-1">{errors.turfDescription}</small>}
      </div>

      {/* Dimensions - only for turf */}
      {venueType === "turf" && (
        <div className="mb-3">
          <h6 className="mb-3">Turf Dimensions <span className="text-danger">*</span></h6>
          <div className="d-flex gap-4 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="dimensionUnit"
                id="feet"
                checked={formData.dimensionUnit === "feet"}
                onChange={() => setFormData(prev => ({ ...prev, dimensionUnit: "feet" }))}
              />
              <label className="form-check-label" htmlFor="feet"><strong>Feet</strong></label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="dimensionUnit"
                id="meter"
                checked={formData.dimensionUnit === "meter"}
                onChange={() => setFormData(prev => ({ ...prev, dimensionUnit: "meter" }))}
              />
              <label className="form-check-label" htmlFor="meter"><strong>Meter</strong></label>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <input
                type="number"
                className={`form-control custom-input ${errors.turfLength ? "is-invalid" : ""}`}
                placeholder="Turf Length *"
                value={formData.turfLength}
                onChange={e => {
                  setFormData(prev => ({ ...prev, turfLength: e.target.value }));
                  if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfLength: "" }));
                  else setErrors(prev => ({ ...prev, turfLength: "Turf Length is required" }));
                }}
              />
              {errors.turfLength && <small className="text-danger d-block mt-1">{errors.turfLength}</small>}
            </div>

            <div className="col-6">
              <input
                type="number"
                className={`form-control custom-input ${errors.turfBreadth ? "is-invalid" : ""}`}
                placeholder="Turf Breadth *"
                value={formData.turfBreadth}
                onChange={e => {
                  setFormData(prev => ({ ...prev, turfBreadth: e.target.value }));
                  if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfBreadth: "" }));
                  else setErrors(prev => ({ ...prev, turfBreadth: "Turf Breadth is required" }));
                }}
              />
              {errors.turfBreadth && <small className="text-danger d-block mt-1">{errors.turfBreadth}</small>}
            </div>
          </div>

          <div className="mb-3">
            <input
              type="number"
              className={`form-control custom-input ${errors.turfHeight ? "is-invalid" : ""}`}
              placeholder="Turf Height *"
              value={formData.turfHeight}
              onChange={e => {
                setFormData(prev => ({ ...prev, turfHeight: e.target.value }));
                if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfHeight: "" }));
                else setErrors(prev => ({ ...prev, turfHeight: "Turf Height is required" }));
              }}
            />
            {errors.turfHeight && <small className="text-danger d-block mt-1">{errors.turfHeight}</small>}
          </div>
        </div>
      )}

      {/* Facilities */}
      <div className="mb-4">
        <h6 className="mb-3">Facilities <span className="text-danger">*</span></h6>
        <div className="row">
          {facilitiesList.map((facility, idx) => (
            <div key={facility} className="col-6 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`facility-${idx}`}
                  checked={formData.facilities.includes(facility)}
                  onChange={() => handleFacilityToggle(facility)}
                />
                <label className="form-check-label facility-label" htmlFor={`facility-${idx}`}>
                  {facility}
                </label>
              </div>
            </div>
          ))}
        </div>
        {errors.facilities && <small className="text-danger d-block mt-2">{errors.facilities}</small>}
      </div>

      {/* Next Button */}
      <div className="text-center">
        <button
          className="btn btn-next"
          onClick={() => {
            if (validateStep1()) {
              setStep(2);
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <>
      <button className="btn-back" onClick={() => setStep(1)}>
        <svg width="26" height="26" fill="black" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H3.707l4.147-4.146a.5.5 0 1 0-.708-.708l-5 5a.5.5 0 0 0 0 .708l5 5a.5.5 0 0 0 .708-.708L3.707 8.5H14.5A.5.5 0 0 0 15 8z" />
        </svg>
      </button>

      <div className="step-container">
        <div className="mb-4">
          <div className="d-flex gap-2 align-items-center mb-4">
            <h3 className="text-capitalize">
              {venueType === "turf" ? "Football & Boxcricket" : venueType}
            </h3>
          </div>

          {sports.map((sport, index) => (
            <div key={sport.id} className="sport-card mb-3">
              <div className="sport-content">
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="input-group-vertical">
                      <label className="time-label">
                        Opening Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className={`form-control custom-input ${errors[`openingTime-${index}`] ? "is-invalid" : ""}`}
                        value={sport.openingTime}
                        onChange={(e) =>
                          updateSportField(
                            sport.id,
                            "openingTime",
                            e.target.value,
                          )
                        }
                      />
                      <div className="field-error">
                        {errors[`openingTime-${index}`]}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group-vertical">
                      <label className="time-label">
                        Closing Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className={`form-control custom-input ${errors[`closingTime-${index}`] ? "is-invalid" : ""}`}
                        value={sport.closingTime}
                        onChange={(e) =>
                          updateSportField(
                            sport.id,
                            "closingTime",
                            e.target.value,
                          )
                        }
                      />
                      <div className="field-error">
                        {errors[`closingTime-${index}`]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day Split & Prices */}
                <div className="price-section mb-3">
                  <div
                    className="section-header"
                    onClick={() => toggleSection(sport.id, "day")}
                  >
                    <span>Day (split) & Day Prices</span>
                    <span>
                      {expandedSections[`${sport.id}-day`] ? "▲" : "▼"}
                    </span>
                  </div>
                  {expandedSections[`${sport.id}-day`] && (
                    <div className="section-content">
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">
                              Day Start <span className="text-danger">*</span>
                            </label>
                            <input
                              type="time"
                              className={`form-control custom-input ${errors[`dayStart-${index}`] ? "is-invalid" : ""}`}
                              value={sport.daySlotStart}
                              onChange={(e) =>
                                updateSportField(
                                  sport.id,
                                  "daySlotStart",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="field-error">
                              {errors[`dayStart-${index}`]}
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">
                              Day End <span className="text-danger">*</span>
                            </label>
                            <input
                              type="time"
                              className={`form-control custom-input ${errors[`dayEnd-${index}`] ? "is-invalid" : ""}`}
                              value={sport.daySlotEnd}
                              onChange={(e) =>
                                updateSportField(
                                  sport.id,
                                  "daySlotEnd",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="field-error">
                              {errors[`dayEnd-${index}`]}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row g-2">
                        {daysOfWeek.map((day) => (
                          <div className="col-6" key={day}>
                            <div className="input-group-vertical">
                              <div className="price-input-wrapper">
                                <span className="rupee-symbol">₹</span>
                                <input
                                  type="number"
                                  className={`form-control price-input ${errors[`dayPrice-${day}-${index}`] ? "is-invalid" : ""}`}
                                  placeholder={
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                  }
                                  value={
                                    sport.dayPrices[
                                      day as keyof typeof sport.dayPrices
                                    ]
                                  }
                                  onChange={(e) =>
                                    updateSportPrice(
                                      sport.id,
                                      "dayPrices",
                                      day,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="field-error">
                                {errors[`dayPrice-${day}-${index}`]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Night Split & Prices */}
                <div className="price-section mb-3">
                  <div
                    className="section-header"
                    onClick={() => toggleSection(sport.id, "night")}
                  >
                    <span>Night (split) & Night Prices</span>
                    <span>
                      {expandedSections[`${sport.id}-night`] ? "▲" : "▼"}
                    </span>
                  </div>
                  {expandedSections[`${sport.id}-night`] && (
                    <div className="section-content">
                      {/* Night start/end */}
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">
                              Night Start <span className="text-danger">*</span>
                            </label>
                            <input
                              type="time"
                              className={`form-control custom-input ${errors[`nightStart-${index}`] ? "is-invalid" : ""}`}
                              value={sport.nightSlotStart}
                              onChange={(e) =>
                                updateSportField(
                                  sport.id,
                                  "nightSlotStart",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="field-error">
                              {errors[`nightStart-${index}`]}
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">
                              Night End <span className="text-danger">*</span>
                            </label>
                            <input
                              type="time"
                              className={`form-control custom-input ${errors[`nightEnd-${index}`] ? "is-invalid" : ""}`}
                              value={sport.nightSlotEnd}
                              onChange={(e) =>
                                updateSportField(
                                  sport.id,
                                  "nightSlotEnd",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="field-error">
                              {errors[`nightEnd-${index}`]}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Night prices */}
                      <div className="row g-2">
                        {daysOfWeek.map((day) => (
                          <div className="col-6" key={day}>
                            <div className="input-group-vertical">
                              <div className="price-input-wrapper">
                                <span className="rupee-symbol">₹</span>
                                <input
                                  type="number"
                                  className={`form-control price-input ${errors[`nightPrice-${day}-${index}`] ? "is-invalid" : ""}`}
                                  placeholder={
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                  }
                                  value={
                                    sport.nightPrices[
                                      day as keyof typeof sport.nightPrices
                                    ]
                                  }
                                  onChange={(e) =>
                                    updateSportPrice(
                                      sport.id,
                                      "nightPrices",
                                      day,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="field-error">
                                {errors[`nightPrice-${day}-${index}`]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Max Persons & Court Count */}
                <div className="row g-2">
                  <div className="col-7">
                    <div className="person-input-wrapper">
                      <span className="person-icon">👤</span>
                      <input
                        type="number"
                        className={`form-control custom-input ${errors[`maxPersons-${index}`] ? "is-invalid" : ""}`}
                        placeholder="Max persons *"
                        value={sport.maxPersons}
                        onChange={(e) =>
                          updateSportField(
                            sport.id,
                            "maxPersons",
                            e.target.value,
                          )
                        }
                      />
                      <div className="field-error">
                        {errors[`maxPersons-${index}`]}
                      </div>
                    </div>
                  </div>
                  <div className="col-5">
                    <div className="position-relative">
                      <label className="court-label">
                        Court count <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control custom-input ${errors[`courtCount-${index}`] ? "is-invalid" : ""}`}
                        value={sport.courtCount}
                        onChange={(e) =>
                          updateSportField(
                            sport.id,
                            "courtCount",
                            e.target.value,
                          )
                        }
                      />
                      <div className="field-error">
                        {errors[`courtCount-${index}`]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-4">
            <button
              className="btn btn-success btn-lg px-5 fw-bold"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3">Loading turf details...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="content">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f0f2f5;
        }

        .app-container {
          max-width: 800px;
          margin: 0 auto;
          min-height: 100vh;
          background-color: #ffffff;
          box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
.input-group-vertical {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.field-error {
  min-height: 18px;        /* Keeps layout stable */
  font-size: 12px;
  color: #dc3545;
  margin-top: 4px;
  line-height: 1.2;
}


        .header {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
        //   padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: sticky;
          margin-top: 15px;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .btn-back {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .btn-back:hover {
          background-color: rgba(255,255,255,0.1);
        }

        .header-title {
          font-size: 22px;
          font-weight: 600;
          margin: 0;
        }

        .content {
          padding: 40px 24px;
          background-color: #f8f9fa;
          min-height: calc(100vh - 80px);
        }

        .step-container {
          max-width: 650px;
          margin: 0 auto;
          background-color: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .image-upload-box {
          width: 140px;
          height: 140px;
          border: 2px dashed #dee2e6;
          border-radius: 16px;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .image-upload-box:hover {
          border-color: #198754;
          background-color: #e7f5ed;
        }

        .custom-input {
          border: 2px solid #dee2e6;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 15px;
          transition: all 0.3s;
        }

        .custom-input:focus {
          border-color: #198754;
          box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15);
          outline: none;
        }

        .location-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          pointer-events: none;
        }

        .form-check-input {
          cursor: pointer;
          width: 20px;
          height: 20px;
        }

        .form-check-input:checked {
          background-color: #198754;
          border-color: #198754;
        }

        .form-check-input:focus {
          border-color: #198754;
          box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
        }

        .form-check-label {
          cursor: pointer;
          margin-left: 8px;
        }

        .facility-label {
          color: #198754;
          font-weight: 500;
        }

        .btn-next {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
          border: none;
          padding: 14px 70px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
        }

        .btn-next:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 135, 84, 0.4);
        }

        .btn-add {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s;
        }

        .btn-add:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(25, 135, 84, 0.3);
        }

        h6 {
          font-weight: 600;
          color: #212529;
          font-size: 17px;
        }

        .text-danger {
          color: #dc3545 !important;
        }

        textarea.custom-input {
          min-height: 140px;
          resize: vertical;
        }

        .court-type-btn {
          flex: 1;
          padding: 12px 20px;
          border: 2px solid #dee2e6;
          border-radius: 10px;
          background-color: white;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .court-type-btn.active {
          background-color: #198754;
          color: white;
          border-color: #198754;
          box-shadow: 0 2px 8px rgba(25, 135, 84, 0.3);
        }

        .court-type-btn:hover {
          border-color: #198754;
          background-color: #f8f9fa;
        }

        .court-type-btn.active:hover {
          background-color: #157347;
        }

        .sport-card {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .sport-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .sport-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 14px 18px;
          border-bottom: 2px solid #e9ecef;
        }

        .sport-name {
          font-size: 17px;
          font-weight: 600;
          color: #198754;
        }

        .sport-content {
          padding: 18px;
        }

        .price-section {
          border: 2px solid #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .price-section:hover {
          border-color: #dee2e6;
        }

        .section-header {
          background-color: #f8f9fa;
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 15px;
          transition: background-color 0.2s;
        }

        .section-header:hover {
          background-color: #e9ecef;
        }

        .section-content {
          padding: 18px;
        }

        .price-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .rupee-symbol {
          position: absolute;
          left: 16px;
          font-size: 16px;
          color: #495057;
          font-weight: 600;
          z-index: 1;
        }

        .price-input {
          padding-left: 38px !important;
          padding-right: 30px !important;
          border: 2px solid #dee2e6;
          border-radius: 10px;
        }

        .price-input:focus {
          border-color: #198754;
          box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15);
          outline: none;
        }

        .required-star {
          position: absolute;
          right: 16px;
          color: #dc3545;
          font-size: 16px;
        }

        .person-input-wrapper {
          position: relative;
        }

        .person-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          z-index: 1;
        }

        .person-input-wrapper input {
          padding-left: 45px !important;
        }

        .court-label {
          position: absolute;
          top: -10px;
          left: 12px;
          background: white;
          padding: 0 8px;
          font-size: 12px;
          color: #6c757d;
          font-weight: 600;
          z-index: 1;
        }

        .time-label {
          display: block;
          font-size: 13px;
          color: #6c757d;
          margin-bottom: 8px;
          font-weight: 600;
        }

        input[type="time"] {
          cursor: pointer;
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          padding: 4px;
          filter: invert(0.5);
        }

        input[type="time"]:hover::-webkit-calendar-picker-indicator {
          filter: invert(0.3);
        }

        .flex-1 {
          flex: 1;
        }

        @media (max-width: 768px) {
          .content {
            padding: 24px 16px;
          }

          .step-container {
            padding: 24px 20px;
          }

          .header {
            padding: 16px 20px;
          }
        }
          .time-label {
          display: block;
          font-size: 13px;
          color: #6c757d;
          margin-bottom: 8px;
          font-weight: 600;
        }

        input[type="time"] {
          cursor: pointer;
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          padding: 4px;
          filter: invert(0.5);
        }

        input[type="time"]:hover::-webkit-calendar-picker-indicator {
          filter: invert(0.3);
        }

        .flex-1 {
          flex: 1;
        }

        @media (max-width: 768px) {
          .content {
            padding: 24px 16px;
          }

          .step-container {
            padding: 24px 20px;
          }

          .header {
            padding: 16px 20px;
          }
        }
            `}</style>
    </div>
  );
};

export default OwnerTurfEdit;
