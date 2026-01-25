import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { uploadTurfImages } from '../../../services/storageService';
import { createTurf, generateTurfId } from '../../../services/firestoreService';

interface TurfData {
  turfImages: File[];
  turfName: string;
  turfMobileNumber: string;
  turfAddress: string;
  latitude: number;
  longitude: number;
  turfDescription: string;
  dimensionUnit: 'feet' | 'meter';
  turfLength: string;
  turfBreadth: string;
  turfHeight: string;
  facilities: string[];
  hasBadmintonCourt: boolean;
  badmintonCourtType?: 'synthetic' | 'wooden';
  createdAt: Date;
}

interface Sport {
  id: string;
  name: string;
  openingTime: string;
  closingTime: string;
  daySlotStart: string;
  daySlotEnd: string;
  nightSlotStart: string;
  nightSlotEnd: string;
  dayPrices: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  nightPrices: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  maxPersons: string;
  courtCount: string;
}

type VenueType = 'turf' | 'badminton' | 'pickleball' | null;
// const [venueType, setVenueType] = useState<VenueType>(null);

const AddTurfForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [currentSport, setCurrentSport] = useState('');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [addedViaWeb, setAddedViaWeb] = useState(false);
  
  const [formData, setFormData] = useState<TurfData>({
    turfImages: [],
    turfName: '',
    turfMobileNumber: '',
    turfAddress: '',
    turfDescription: '',
    latitude: 0,
    longitude: 0,
    dimensionUnit: 'feet',
    turfLength: '',
    turfBreadth: '',
    turfHeight: '',
    facilities: [],
    hasBadmintonCourt: false,
    badmintonCourtType: undefined,
    createdAt: new Date()
  });

  const facilitiesList = [
    'Parking',
    'Drinking water',
    'Rest room',
    'Dressing room',
    'Sports related things',
    'CCTV',
    'Music systems'
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedImages(prev => [...prev, ...fileArray].slice(0, 7));
      
      if (fileArray[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(fileArray[0]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        dayPrices: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        nightPrices: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        maxPersons: '',
        courtCount: ''
      };
      setSports([...sports, newSport]);
      setCurrentSport('');
      setExpandedSections({ ...expandedSections, [`${newSport.id}-day`]: true, [`${newSport.id}-night`]: true });
    }
  };

  const toggleSection = (sportId: string, section: string) => {
    setExpandedSections({
      ...expandedSections,
      [`${sportId}-${section}`]: !expandedSections[`${sportId}-${section}`]
    });
  };

  const updateSportField = (sportId: string, field: keyof Sport, value: any) => {
    setSports(sports.map(sport => 
      sport.id === sportId ? { ...sport, [field]: value } : sport
    ));
  };

  const updateSportPrice = (sportId: string, type: 'dayPrices' | 'nightPrices', day: string, value: string) => {
    setSports(sports.map(sport => 
      sport.id === sportId 
        ? { 
            ...sport, 
            [type]: { ...sport[type], [day]: value } 
          } 
        : sport
    ));
  };

  const handleSubmit = async () => {
  try {
    const ownerId = localStorage.getItem("user_id");
    const ownerName = localStorage.getItem("user_name");

    if (!addedViaWeb) {
  alert("Please confirm turf is added via Website");
  return;
}

    if (!ownerId || !ownerName) {
      alert("Owner not logged in");
      return;
    }

    // 1️⃣ Generate Turf ID
    const turfId = generateTurfId(ownerName);

    // 2️⃣ Upload images
    const imageUrls = await uploadTurfImages(
      turfId,
      ownerId,
      selectedImages
    );

    // 3️⃣ Save Firestore data
    await createTurf({
      turfId,
      formData,
      sports,
      ownerId,
      ownerName,
      imageUrls,
      turf_opened: true, 
      turf_active_status: true,
      addedSource: {
        platform: "web"
      }
    });

    alert("✅ Turf added successfully");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to add turf");
  }
};

  const buildSportMaps = (sports: Sport[]) => {
  const prices: any = {};
  const timings: any = {};
  const persons: any = {};
  const sportNames: string[] = [];

  sports.forEach((sport) => {
    sportNames.push(sport.name);

    prices[sport.name] = {};
    timings[sport.name] = {
      day_start: sport.daySlotStart,
      day_end: sport.daySlotEnd,
      night_start: sport.nightSlotStart,
      night_end: sport.nightSlotEnd,
    };

    persons[sport.name] = Number(sport.maxPersons);

    Object.keys(sport.dayPrices).forEach((day) => {
      prices[sport.name][day] = {
        day: Number(sport.dayPrices[day as keyof typeof sport.dayPrices]),
        night: Number(sport.nightPrices[day as keyof typeof sport.nightPrices]),
      };
    });
  });

  return { prices, timings, persons, sportNames };
};

  const renderStep1 = () => (
    <div className="step-container">
      <div className="mb-4">
        <label className="form-label text-muted">
          Turf Images (1-5 required) <span className="text-danger">*</span>
        </label>
        <div className="d-flex justify-content-center mb-3">
          <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
            <div className="image-upload-box">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <svg width="40" height="40" fill="#999" viewBox="0 0 16 16">
                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                  </svg>
                  <small className="text-muted mt-2">Add Photo</small>
                </div>
              )}
            </div>
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        <small className="text-muted">{selectedImages.length}/5 images selected</small>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control custom-input"
          placeholder="Venue name *"
          name="turfName"
          value={formData.turfName}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control custom-input"
          placeholder="Venue MobileNumber *"
          name="turfMobileNumber"
          value={formData.turfMobileNumber}
          onChange={handleInputChange}
        />
      </div>

      {/* Turf Address with Google Maps Preview */}
<div className="mb-3">
  <div className="position-relative">
    <input
      type="text"
      className="form-control custom-input"
      placeholder="venue Address"
      name="turfAddress"
      value={formData.turfAddress}
      onChange={handleInputChange}
    />
  </div>

  {/* Conditional "View on Maps" Button */}
  {formData.turfAddress.trim().length > 5 && (
    <div className="mt-2 text-end">
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => {
          const encodedAddress = encodeURIComponent(formData.turfAddress);
          // Standard Google Maps search URL
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
          window.open(mapUrl, "_blank");
        }}
        style={{ fontSize: '12px', borderRadius: '20px' }}
      >
        🔍 Verify Location on Google Maps
      </button>
    </div>
  )}
</div>

      <div className="mb-4">
        <textarea
          className="form-control custom-input"
          placeholder="Turf Description & Achievements *"
          name="turfDescription"
          value={formData.turfDescription}
          onChange={handleInputChange}
          rows={6}
        />
      </div>

      <div className="mb-3">
        <h6 className="mb-3">Turf Dimensions</h6>
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
              className="form-control custom-input"
              placeholder="Turf Length *"
              name="turfLength"
              value={formData.turfLength}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-6">
            <input
              type="number"
              className="form-control custom-input"
              placeholder="Turf Breadth *"
              name="turfBreadth"
              value={formData.turfBreadth}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <input
            type="number"
            className="form-control custom-input"
            placeholder="Turf Height *"
            name="turfHeight"
            value={formData.turfHeight}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="mb-4">
        <h6 className="mb-3">
          Facilities <span className="text-danger">*</span>
        </h6>
        <div className="row">
          {facilitiesList.map((facility, index) => (
            <div key={facility} className="col-6 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`facility-${index}`}
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
      </div>


      <div className="text-center">
        <button 
          className="btn btn-next"
          onClick={() => setStep(2)}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-container">
      <div className="mb-4">
        <div className="d-flex gap-2 align-items-center mb-4">
       <h3>Football & boxcricket</h3>

        </div>

        {sports.map((sport) => (
          <div key={sport.id} className="sport-card mb-3">
           

            <div className="sport-content">
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="time-label">Opening Time *</label>
                  <input
                    type="time"
                    className="form-control custom-input"
                    value={sport.openingTime}
                    onChange={(e) => updateSportField(sport.id, 'openingTime', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="time-label">Closing Time *</label>
                  <input
                    type="time"
                    className="form-control custom-input"
                    value={sport.closingTime}
                    onChange={(e) => updateSportField(sport.id, 'closingTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Day Split & Prices */}
              <div className="price-section mb-3">
                <div 
                  className="section-header"
                  onClick={() => toggleSection(sport.id, 'day')}
                >
                  <span>Day (split) & Day Prices</span>
                  <span>{expandedSections[`${sport.id}-day`] ? '▲' : '▼'}</span>
                </div>
                
                {expandedSections[`${sport.id}-day`] && (
                  <div className="section-content">
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="time-label">Day Start *</label>
                        <input
                          type="time"
                          className="form-control custom-input"
                          value={sport.daySlotStart}
                          onChange={(e) => updateSportField(sport.id, 'daySlotStart', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="time-label">Day End *</label>
                        <input
                          type="time"
                          className="form-control custom-input"
                          value={sport.daySlotEnd}
                          onChange={(e) => updateSportField(sport.id, 'daySlotEnd', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="row g-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="col-6">
                          <div className="price-input-wrapper">
                            <span className="rupee-symbol">₹</span>
                            <input
                              type="number"
                              className="form-control price-input"
                              placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
                              value={sport.dayPrices[day as keyof typeof sport.dayPrices]}
                              onChange={(e) => updateSportPrice(sport.id, 'dayPrices', day, e.target.value)}
                            />
                            <span className="required-star">*</span>
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
                  onClick={() => toggleSection(sport.id, 'night')}
                >
                  <span>Night (split) & Night Prices</span>
                  <span>{expandedSections[`${sport.id}-night`] ? '▲' : '▼'}</span>
                </div>
                
                {expandedSections[`${sport.id}-night`] && (
                  <div className="section-content">
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="time-label">Night Start *</label>
                        <input
                          type="time"
                          className="form-control custom-input"
                          value={sport.nightSlotStart}
                          onChange={(e) => updateSportField(sport.id, 'nightSlotStart', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="time-label">Night End *</label>
                        <input
                          type="time"
                          className="form-control custom-input"
                          value={sport.nightSlotEnd}
                          onChange={(e) => updateSportField(sport.id, 'nightSlotEnd', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="row g-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="col-6">
                          <div className="price-input-wrapper">
                            <span className="rupee-symbol">₹</span>
                            <input
                              type="number"
                              className="form-control price-input"
                              placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
                              value={sport.nightPrices[day as keyof typeof sport.nightPrices]}
                              onChange={(e) => updateSportPrice(sport.id, 'nightPrices', day, e.target.value)}
                            />
                            <span className="required-star">*</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="row g-2">
                <div className="col-7">
                  <div className="person-input-wrapper">
                    <span className="person-icon">👤</span>
                    <input
                      type="number"
                      className="form-control custom-input"
                      placeholder="Max persons"
                      value={sport.maxPersons}
                      onChange={(e) => updateSportField(sport.id, 'maxPersons', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-5">
                  <div className="position-relative">
                    <label className="court-label">Court count *</label>
                    <input
                      type="number"
                      className="form-control custom-input"
                      value={sport.courtCount}
                      onChange={(e) => updateSportField(sport.id, 'courtCount', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-check mt-4">
  <input
    className="form-check-input"
    type="checkbox"
    id="addedViaWeb"
    checked={addedViaWeb}
    onChange={(e) => setAddedViaWeb(e.target.checked)}
  />
  <label className="form-check-label fw-semibold" htmlFor="addedViaWeb">
    I confirm this turf is being added via Website
  </label>
</div>

              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button 
          className="btn btn-next"
          onClick={handleSubmit}
        >
          Add Turf
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="header">
        <button className="btn-back" onClick={() => step === 2 ? setStep(1) : null}>
          <svg width="24" height="24" fill="white" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>
        <h1 className="header-title">{step === 1 ? 'Add Turf' : 'Add Sports Info'}</h1>
      </div>

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

export default AddTurfForm;