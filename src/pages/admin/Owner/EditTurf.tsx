// src/pages/admin/Owner/EditTurf.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { getTurfById, normalizeSportKeyFormate, to12HourFormate } from '../../../services/firestoreService';
import { uploadTurfImages } from '../../../services/storageService';
import { formatHourOnly12, hour12ToMinutes } from '../../../utils/dateUtils';
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

type VenueType = 'turf' | 'badminton' | 'pickleball' | 'mixed' | null;

const EditTurf: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentSport, setCurrentSport] = useState('');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addedViaWeb, setAddedViaWeb] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    turfName: '',
    turfMobileNumber: '',
    turfAddress: '',
    turfDescription: '',
    dimensionUnit: 'feet',
    turfLength: '',
    turfBreadth: '',
    turfHeight: '',
    facilities: [] as string[],
    hasBadmintonCourt: false,
    badmintonCourtType: undefined as 'synthetic' | 'wooden' | undefined,
  });

  const [sports, setSports] = useState<Sport[]>([]);
  const [turf, setTurf] = useState<any>(null);
  const [venueType, setVenueType] = useState<VenueType>(null);

  const facilitiesList = [
    'Parking', 'Drinking water', 'Rest room', 'Dressing room',
    'Sports Kits', 'CCTV', 'Music systems'
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // // Convert any time format to 12-hour format
  // const convertTo12Hour = (time: string): string => {
  //   if (!time) return '';
    
  //   // If already in 12-hour format (e.g., "09:00 AM"), return as is
  //   if (/^(0[1-9]|1[0-2]):00\s?(AM|PM)$/i.test(time)) {
  //     return time.toUpperCase();
  //   }
    
  //   // If in 24-hour format (e.g., "09:00" or "21:00"), convert
  //   const match24 = time.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  //   if (match24) {
  //     let hours = parseInt(match24[1]);
  //     const minutes = match24[2];
  //     const period = hours >= 12 ? 'PM' : 'AM';
      
  //     if (hours === 0) hours = 12;
  //     else if (hours > 12) hours -= 12;
      
  //     return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  //   }
    
  //   return time;
  // };
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

  useEffect(() => {
    if (!turfId) return;

    const fetchTurf = async () => {
      try {
        const turfData = await getTurfById(turfId);
        if (turfData) {
          setTurf(turfData);
          setFormData({
            turfName: turfData.turf_name || '',
            turfMobileNumber: turfData.turf_mobile_number || '',
            turfAddress: turfData.turf_location || '',
            turfDescription: turfData.turf_description || '',
            dimensionUnit: (turfData as any).dimensionUnit || 'feet',
            turfLength: turfData.turf_length || '',
            turfBreadth: turfData.turf_breadth || '',
            turfHeight: turfData.turf_height || '',
            facilities: turfData.amenities || [],
            hasBadmintonCourt: !!(turfData as any).hasBadmintonCourt,
            badmintonCourtType: (turfData as any).badmintonCourtType,
          });

          setImagePreviews(turfData.turf_images || []);

          if (turfData.sport_specific_timing && turfData.sport_specific_price) {
            const loaded = Object.keys(turfData.sport_specific_timing!).map((name) => {
              const timing = turfData.sport_specific_timing![name];
              const prices = turfData.sport_specific_price![name] || {};
              
              return {
                id: Date.now().toString() + name,
                name,
                // Convert all times to 12-hour format
               openingTime: convert12To24(timing.opening_time || ''),
                closingTime: convert12To24(timing.closing_time || ''),
                daySlotStart: convert12To24(timing.day_start_time || ''),
                daySlotEnd: convert12To24(timing.day_end_time || ''),
                nightSlotStart: convert12To24(timing.night_start_time || ''),
                nightSlotEnd: convert12To24(timing.night_end_time || ''),

                dayPrices: daysOfWeek.reduce((acc, day) => ({
                  ...acc,
                  [day]: prices[day]?.day?.toString() || ''
                }), {} as any),
                nightPrices: daysOfWeek.reduce((acc, day) => ({
                  ...acc,
                  [day]: prices[day]?.night?.toString() || ''
                }), {} as any),
                maxPersons: turfData.sports_specific_person_count?.[name]?.toString() || '',
                courtCount: timing.court_count?.toString() || '1'
              };
            });
            setSports(loaded);
          }
        }
      } catch (err) {
        console.error('Error loading turf:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [turfId]);

  // const resolveCloseMinutes = (open: string, close: string) => {
  //   const openMin = hour12ToMinutes(open);
  //   let closeMin = hour12ToMinutes(close);
  //   if (openMin == null || closeMin == null) return null;
  //   if (closeMin <= openMin) closeMin += 24 * 60;
  //   return closeMin;
  // };
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

    if (imagePreviews.length === 0) newErrors.images = "At least 1 image required";

    if (venueType === 'turf') {
      if (!formData.turfLength.trim()) newErrors.turfLength = "Turf length is required";
      if (!formData.turfBreadth.trim()) newErrors.turfBreadth = "Turf breadth is required";
      if (!formData.turfHeight.trim()) newErrors.turfHeight = "Turf height is required";
    }

    if (formData.facilities.length === 0) newErrors.facilities = "At least one facility is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors: Record<string, string> = {};

    if (sports.length === 0) {
      newErrors.sports = "At least one sport is required";
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let newErrors: any = {};

    if (files.length + selectedImages.length + imagePreviews.length > 5) {
      newErrors.images = "Maximum 5 images allowed";
      setErrors(newErrors);
      return;
    }

    const totalSize = [...selectedImages, ...files].reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      newErrors.images = "Total image size cannot exceed 25MB";
      setErrors(newErrors);
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) newErrors.images = "Each image must be less than 5MB";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedImages = [...selectedImages, ...files];
    setSelectedImages(updatedImages);
    const previews = updatedImages.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
    setErrors(prev => ({ ...prev, images: "" }));
  };

  const removeImage = (index: number) => {
    if (index < imagePreviews.length - selectedImages.length) {
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
    } else {
      const newImages = selectedImages.filter((_, i) => i !== index - (imagePreviews.length - selectedImages.length));
      setSelectedImages(newImages);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleAddSport = () => {
    if (currentSport.trim()) {
      const newSport: Sport = {
        id: Date.now().toString(),
        name: currentSport,
        openingTime: '',
        closingTime: '',
        daySlotStart: '',
        daySlotEnd: '',
        nightSlotStart: '',
        nightSlotEnd: '',
        dayPrices: Object.fromEntries(daysOfWeek.map(day => [day, ''])),
        nightPrices: Object.fromEntries(daysOfWeek.map(day => [day, ''])),
        maxPersons: '',
        courtCount: ''
      };
      setSports([...sports, newSport]);
      setCurrentSport('');
      setExpandedSections(prev => ({
        ...prev,
        [`${newSport.id}-day`]: true,
        [`${newSport.id}-night`]: true
      }));
    }
  };

  const toggleSection = (sportId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${sportId}-${section}`]: !prev[`${sportId}-${section}`]
    }));
  };

  const updateSportField = (sportId: string, field: keyof Sport, value: any) => {
    setSports(sports.map(s => s.id === sportId ? { ...s, [field]: value } : s));
  };

  const updateSportPrice = (sportId: string, type: 'dayPrices' | 'nightPrices', day: string, value: string) => {
    setSports(sports.map(s =>
      s.id === sportId
        ? { ...s, [type]: { ...s[type], [day]: value } }
        : s
    ));
  };

  // Handle time input change - convert from 24h to 12h format
  // const handleTimeChange = (sportId: string, field: keyof Sport, value: string) => {
  //   if (!value) {
  //     updateSportField(sportId, field, '');
  //     return;
  //   }

  //   // Convert 24-hour input to 12-hour format
  //   const match24 = value.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  //   if (match24) {
  //     let hours = parseInt(match24[1]);
  //     const minutes = match24[2];
  //     const period = hours >= 12 ? 'PM' : 'AM';
      
  //     if (hours === 0) hours = 12;
  //     else if (hours > 12) hours -= 12;
      
  //     const formatted12 = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  //     updateSportField(sportId, field, formatted12);
  //   }
  // };

  // Convert 12-hour format to 24-hour for input display
  // const convertTo24HourForInput = (time12: string): string => {
  //   if (!time12) return '';
    
  //   const match = time12.match(/^(0[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i);
  //   if (!match) return '';
    
  //   let hours = parseInt(match[1]);
  //   const minutes = match[2];
  //   const period = match[3].toUpperCase();
    
  //   if (period === 'PM' && hours !== 12) hours += 12;
  //   if (period === 'AM' && hours === 12) hours = 0;
    
  //   return `${hours.toString().padStart(2, '0')}:${minutes}`;
  // };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;
    if (!turfId) return;

    setSaving(true);

    try {
      let finalImages = turf?.turf_images || [];

      if (selectedImages.length > 0) {
        const ownerId = localStorage.getItem("user_id") || '';
        const newUrls = await uploadTurfImages(turfId, ownerId, selectedImages);
        finalImages = [...finalImages, ...newUrls];
      }

      const { prices, timings, persons, sportNames } = buildSportMaps(sports);

      const updatePayload: any = {
        turf_name: formData.turfName.trim(),
        turf_location: formData.turfAddress.trim(),
        turf_description: formData.turfDescription.trim(),
        amenities: formData.facilities,
        available_sports_list: sportNames,
        sports_specific_person_count: persons,
        sport_specific_timing: timings,
        sport_specific_price: prices,
        turf_images: finalImages.length > 0 ? finalImages : null,
      };

      if (venueType === 'turf') {
        updatePayload.turf_length = formData.turfLength;
        updatePayload.turf_breadth = formData.turfBreadth;
        updatePayload.turf_height = formData.turfHeight;
      }

      const turfRef = doc(db, "environment", "testing", "turfs", turfId);
      await updateDoc(turfRef, updatePayload);

      alert("Turf updated successfully!");
      navigate(`/dashboard/owners/${turf?.owner_id || ''}/turfs/${turfId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update turf");
    } finally {
      setSaving(false);
    }
  };
const convert24To12 = (time: string): string => {
  if (!time) return '';

  const [hoursStr, minutes] = time.split(':');

  let hours = parseInt(hoursStr);
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${period}`;
};


  const buildSportMaps = (sports: Sport[]) => {
    const prices: any = {};
    const timings: any = {};
    const persons: any = {};
    const sportNames: string[] = [];

    sports.forEach((sport) => {
      const key = normalizeSportKeyFormate(sport.name);
      sportNames.push(key);

      // PRICE MAP
      prices[key] = {};
      Object.keys(sport.dayPrices).forEach((day) => {
        prices[key][day] = {
          day: Number(sport.dayPrices[day]) || 0,
          night: Number(sport.nightPrices[day]) || 0,
        };
      });

      // TIMINGS MAP - Store in 12-hour format
timings[key] = {
  opening_time: convert24To12(sport.openingTime),
  closing_time: convert24To12(sport.closingTime),
  day_start_time: convert24To12(sport.daySlotStart),
  day_end_time: convert24To12(sport.daySlotEnd),
  night_start_time: convert24To12(sport.nightSlotStart),
  night_end_time: convert24To12(sport.nightSlotEnd),
  court_count: Number(sport.courtCount) || 1,
};

      persons[key] = Number(sport.maxPersons) || 0;
    });

    return { prices, timings, persons, sportNames };
  };

  const renderStep1 = () => (
    <>
      <button
        className="btn-back"
        onClick={() => navigate(-1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          fill="black"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H3.707l4.147-4.146a.5.5 0 1 0-.708-.708l-5 5a.5.5 0 0 0 0 .708l5 5a.5.5 0 0 0 .708-.708L3.707 8.5H14.5A.5.5 0 0 0 15 8z"
          />
        </svg>
      </button>

      <h1 className="header-title fw-bold fs-3 text-success text-center">
        {step === 1 && venueType === 'turf' && 'Edit Turf Venue'}
        {step === 1 && venueType === 'badminton' && 'Edit Badminton Venue'}
        {step === 1 && venueType === 'pickleball' && 'Edit Pickleball Venue'}
      </h1>

      <div className="step-container mt-5">
        <div className="mb-4">
          <label className="form-label text-muted">
            {venueType === 'turf' ? 'Venue Images' : 'Venue Images'} (1–5 required)
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
                  <small className="text-muted mt-2">Add Photos</small>
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
          <small className="text-muted">{imagePreviews.length} images</small>
          {errors.images && <small className="text-danger d-block mt-1">{errors.images}</small>}
        </div>

        {imagePreviews.length > 0 && (
          <div className="row g-2 mb-4">
            {imagePreviews.map((src, i) => (
              <div key={i} className="col-4 col-md-2 position-relative">
                <img
                  src={src}
                  alt="preview"
                  className="img-fluid rounded"
                  style={{ height: "90px", objectFit: "cover" }}
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

        <div className="mb-3">
          <input
            type="text"
            className={`form-control custom-input ${errors.turfName ? "is-invalid" : ""}`}
            placeholder="Venue Name *"
            name="turfName"
            value={formData.turfName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, turfName: e.target.value }));
              if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfName: "" }));
              else setErrors(prev => ({ ...prev, turfName: "Venue name is required" }));
            }}
          />
          {errors.turfName && <small className="text-danger">{errors.turfName}</small>}
        </div>

        <div className="mb-3 position-relative">
          <input
            type="text"
            className={`form-control custom-input ${errors.turfAddress ? "is-invalid" : ""}`}
            placeholder="Enter City *"
            name="turfAddress"
            value={formData.turfAddress}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, turfAddress: e.target.value }));
              if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfAddress: "" }));
              else setErrors(prev => ({ ...prev, turfAddress: "City is required" }));
            }}
          />
          {errors.turfAddress && <small className="text-danger">{errors.turfAddress}</small>}
        </div>

        <div className="mb-4">
          <textarea
            className={`form-control custom-input ${errors.turfDescription ? "is-invalid" : ""}`}
            placeholder={venueType === "turf"
              ? "Turf Description & Achievements *"
              : "Description & Achievements *"}
            name="turfDescription"
            value={formData.turfDescription}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, turfDescription: e.target.value }));
              if (e.target.value.trim().length >= 30) setErrors(prev => ({ ...prev, turfDescription: "" }));
              else setErrors(prev => ({ ...prev, turfDescription: e.target.value.trim() ? "Minimum 30 characters required" : "Description is required" }));
            }}
            rows={6}
          />
          {errors.turfDescription && <small className="text-danger">{errors.turfDescription}</small>}
        </div>

        {venueType === 'turf' && (
          <div className="mb-3">
            <h6 className="mb-3">Turf Dimensions *</h6>
            <div className="d-flex gap-4 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="dimensionUnit"
                  id="feet"
                  checked={formData.dimensionUnit === 'feet'}
                  onChange={() => setFormData(prev => ({ ...prev, dimensionUnit: 'feet' }))}
                />
                <label className="form-check-label" htmlFor="feet">Feet</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="dimensionUnit"
                  id="meter"
                  checked={formData.dimensionUnit === 'meter'}
                  onChange={() => setFormData(prev => ({ ...prev, dimensionUnit: 'meter' }))}
                />
                <label className="form-check-label" htmlFor="meter">Meter</label>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <input
                  type="number"
                  className={`form-control custom-input ${errors.turfLength ? "is-invalid" : ""}`}
                  placeholder="Turf Length *"
                  name="turfLength"
                  value={formData.turfLength}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, turfLength: e.target.value }));
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfLength: "" }));
                    else setErrors(prev => ({ ...prev, turfLength: "Turf length is required" }));
                  }}
                />
                {errors.turfLength && <small className="text-danger">{errors.turfLength}</small>}
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className={`form-control custom-input ${errors.turfBreadth ? "is-invalid" : ""}`}
                  placeholder="Turf Breadth *"
                  name="turfBreadth"
                  value={formData.turfBreadth}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, turfBreadth: e.target.value }));
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfBreadth: "" }));
                    else setErrors(prev => ({ ...prev, turfBreadth: "Turf breadth is required" }));
                  }}
                />
                {errors.turfBreadth && <small className="text-danger">{errors.turfBreadth}</small>}
              </div>
            </div>
            <div className="mb-3">
              <input
                type="number"
                className={`form-control custom-input ${errors.turfHeight ? "is-invalid" : ""}`}
                placeholder="Turf Height *"
                name="turfHeight"
                value={formData.turfHeight}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, turfHeight: e.target.value }));
                  if (e.target.value.trim()) setErrors(prev => ({ ...prev, turfHeight: "" }));
                  else setErrors(prev => ({ ...prev, turfHeight: "Turf height is required" }));
                }}
              />
              {errors.turfHeight && <small className="text-danger">{errors.turfHeight}</small>}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h6 className="mb-3">
            Facilities *
          </h6>
          <div className="row">
            {facilitiesList.map((facility, index) => (
              <div key={facility} className="col-6 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    id={`facility-${index}`}
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                  />
                  <label className="form-check-label facility-label" htmlFor={`facility-${index}`}>
                    {facility}
                  </label>
                </div>
              </div>
            ))}
          </div>
          {errors.facilities && <small className="text-danger d-block mt-2">{errors.facilities}</small>}
        </div>

        <div className="text-center">
          <button
            className="btn btn-next"
            onClick={() => {
              if (!validateStep1()) return;
              setStep(2);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <button
        className="btn-back"
        onClick={() => setStep(1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          fill="black"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H3.707l4.147-4.146a.5.5 0 1 0-.708-.708l-5 5a.5.5 0 0 0 0 .708l5 5a.5.5 0 0 0 .708-.708L3.707 8.5H14.5A.5.5 0 0 0 15 8z"
          />
        </svg>
      </button>

      <div className="step-container">
        <div className="mb-4">
          <div className="d-flex gap-2 align-items-center mb-4">
            <h3 className="text-capitalize">Sports & Pricing</h3>
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
<DatePicker
  selected={timeStringToDate(sport.openingTime)}
  onChange={(date) =>
    updateSportField(
      sport.id,
      "openingTime",
      dateToTimeString(date)
    )
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={60}
  timeCaption="Time"
  dateFormat="hh:mm aa"
  className="form-control custom-input"
/>


                      {sport.openingTime && (
                        <small className="text-muted mt-1">{sport.openingTime}</small>
                      )}
                      <div className="field-error">{errors[`openingTime-${index}`]}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group-vertical">
                      <label className="time-label">
                        Closing Time <span className="text-danger">*</span>
                      </label>
<DatePicker
  selected={timeStringToDate(sport.closingTime)}
  onChange={(date) =>
    updateSportField(
      sport.id,
      "closingTime",
      dateToTimeString(date)
    )
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={60}
  timeCaption="Time"
  dateFormat="hh:mm aa"
  className="form-control custom-input"
/>



                      {sport.closingTime && (
                        <small className="text-muted mt-1">{sport.closingTime}</small>
                      )}
                      <div className="field-error">{errors[`closingTime-${index}`]}</div>
                    </div>
                  </div>
                </div>

                {/* Day Split & Prices */}
                <div className="price-section mb-3">
                  <div className="section-header" onClick={() => toggleSection(sport.id, 'day')}>
                    <span>Day (split) & Day Prices</span>
                    <span>{expandedSections[`${sport.id}-day`] ? '▲' : '▼'}</span>
                  </div>
                  {expandedSections[`${sport.id}-day`] && (
                    <div className="section-content">
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">Day Start <span className="text-danger">*</span></label>
<DatePicker
  selected={timeStringToDate(sport.daySlotStart)}
  onChange={(date) =>
    updateSportField(
      sport.id,
      "daySlotStart",
      dateToTimeString(date)
    )
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={60}
  timeCaption="Time"
  dateFormat="hh:mm aa"
  className="form-control custom-input"
/>



                            {sport.daySlotStart && (
                              <small className="text-muted mt-1">{sport.daySlotStart}</small>
                            )}
                            <div className="field-error">{errors[`dayStart-${index}`]}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">Day End <span className="text-danger">*</span></label>
<DatePicker
  selected={timeStringToDate(sport.daySlotEnd)}
  onChange={(date) =>
    updateSportField(
      sport.id,
      "daySlotEnd",
      dateToTimeString(date)
    )
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={60}
  timeCaption="Time"
  dateFormat="hh:mm aa"
  className="form-control custom-input"
/>


                            {sport.daySlotEnd && (
                              <small className="text-muted mt-1">{sport.daySlotEnd}</small>
                            )}
                            <div className="field-error">{errors[`dayEnd-${index}`]}</div>
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
                                  placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
                                  value={sport.dayPrices[day as keyof typeof sport.dayPrices]}
                                  onChange={(e) => updateSportPrice(sport.id, "dayPrices", day, e.target.value)}
                                />
                              </div>
                              <div className="field-error">{errors[`dayPrice-${day}-${index}`]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Night Split & Prices */}
                <div className="price-section mb-3">
                  <div className="section-header" onClick={() => toggleSection(sport.id, 'night')}>
                    <span>Night (split) & Night Prices</span>
                    <span>{expandedSections[`${sport.id}-night`] ? '▲' : '▼'}</span>
                  </div>
                  {expandedSections[`${sport.id}-night`] && (
                    <div className="section-content">
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">Night Start <span className="text-danger">*</span></label>
<DatePicker
  selected={timeStringToDate(sport.nightSlotStart)}
  onChange={(date) =>
    updateSportField(
      sport.id,
      "nightSlotStart",
      dateToTimeString(date)
    )
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={60}
  timeCaption="Time"
  dateFormat="hh:mm aa"
  className="form-control custom-input"
/>



                            {sport.nightSlotStart && (
                              <small className="text-muted mt-1">{sport.nightSlotStart}</small>
                            )}
                            <div className="field-error">{errors[`nightStart-${index}`]}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="input-group-vertical">
                            <label className="time-label">Night End <span className="text-danger">*</span></label>
<DatePicker
  selected={timeStringToDate(sport.nightSlotEnd)}
  onChange={(date) =>
    updateSportField(
      sport.id,
      "nightSlotEnd",
      dateToTimeString(date)
    )
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={60}
  timeCaption="Time"
  dateFormat="hh:mm aa"
  className="form-control custom-input"
/>


                            {sport.nightSlotEnd && (
                              <small className="text-muted mt-1">{sport.nightSlotEnd}</small>
                            )}
                            <div className="field-error">{errors[`nightEnd-${index}`]}</div>
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
                                  className={`form-control price-input ${errors[`nightPrice-${day}-${index}`] ? "is-invalid" : ""}`}
                                  placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
                                  value={sport.nightPrices[day as keyof typeof sport.nightPrices]}
                                  onChange={(e) => updateSportPrice(sport.id, "nightPrices", day, e.target.value)}
                                />
                              </div>
                              <div className="field-error">{errors[`nightPrice-${day}-${index}`]}</div>
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
                        className={`form-control custom-input ${errors[`maxPersons-${index}`] ? 'is-invalid' : ''}`}
                        placeholder="Max persons *"
                        value={sport.maxPersons}
                        onChange={(e) => updateSportField(sport.id, "maxPersons", e.target.value)}
                      />
                      <div className="field-error">{errors[`maxPersons-${index}`]}</div>
                    </div>
                  </div>
                  <div className="col-5">
                    <div className="position-relative">
                      <label className="court-label">Court count <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className={`form-control custom-input ${errors[`courtCount-${index}`] ? 'is-invalid' : ''}`}
                        value={sport.courtCount}
                        onChange={(e) => updateSportField(sport.id, "courtCount", e.target.value)}
                      />
                      <div className="field-error">{errors[`courtCount-${index}`]}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-4">
            <button
              className="btn btn-success btn-lg px-5 fw-bold"
              onClick={() => {
                if (!validateStep2()) return;
                handleSubmit();
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
        <p className="mt-3">Loading turf data...</p>
      </div>
    );
  }

  return (
    <div className="app-container mt-5 pt-4">
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
          min-height: 18px;
          font-size: 12px;
          color: #dc3545;
          margin-top: 4px;
          line-height: 1.2;
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

        .header {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
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
      `}</style>
    </div>
  );
};

export default EditTurf;