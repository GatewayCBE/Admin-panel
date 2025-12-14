import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTurfById } from "../../services/firestoreService";

const TurfDetail: React.FC = () => {
  const { turfId } = useParams();
  const [turf, setTurf] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTurfById(turfId!);
      setTurf(data);
    };
    fetchData();
  }, [turfId]);

  if (!turf)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success"></div>
      </div>
    );

  const priceData = turf.sport_specific_price ?? {};
  const sportsList = turf.available_sports_list ?? [];
  const amenities = turf.amenities ?? [];
  const timings = turf.sport_specific_timing ?? {};
  const images = turf.turf_images ?? [];

  return (
    <div className="container py-4">

      {/* Title + Badge */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-success">{turf.turf_name}</h2>
        <span className="badge bg-primary px-3 py-2">New Turf</span>
      </div>

      {/* Image Carousel */}
      {images.length > 0 ? (
        <div
          id="detailsCarousel"
          className="carousel slide mb-4"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner rounded-4 overflow-hidden shadow-sm">
            {images.map((img: string, idx: number) => (
              <div
                key={idx}
                className={`carousel-item ${idx === 0 ? "active" : ""}`}
              >
                <img
                  src={img}
                  className="d-block w-100"
                  style={{ height: "350px", objectFit: "cover" }}
                  alt={turf.turf_name}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#detailsCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon"></span>
          </button>

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#detailsCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      ) : (
        <div
          className="bg-light d-flex justify-content-center align-items-center rounded-4"
          style={{ height: "300px" }}
        >
          <span className="fs-1">⚽</span>
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <h4 className="fw-bold">About this Turf</h4>
        <p className="text-muted">{turf.turf_description}</p>
      </div>

      {/* Available Sports */}
      <div className="mb-4">
        <h4 className="fw-bold">Available Sports</h4>
        <div className="d-flex flex-wrap gap-2">
          {sportsList.map((s: string, i: number) => (
            <span key={i} className="badge bg-success px-3 py-2 fs-6">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <h4 className="fw-bold">Amenities</h4>
        <div className="row">
          {amenities.map((a: string, i: number) => (
            <div key={i} className="col-6 col-md-4 mb-2">
              <div className="p-2 border rounded bg-white shadow-sm">
                {a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <h4 className="fw-bold">Pricing</h4>

        {Object.entries(priceData).map(([sport, days]: any, i) => (
          <div key={i} className="mb-3">
            <h5 className="text-success">{sport}</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Day Price</th>
                  <th>Night Price</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(days).map(([dayName, price]: any, j) => (
                  <tr key={j}>
                    <td className="fw-bold text-capitalize">{dayName}</td>
                    <td>₹{price.day}</td>
                    <td>₹{price.night}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Sport Timings */}
      <div className="mb-4">
        <h4 className="fw-bold">Sport Timings</h4>

        {Object.entries(timings).map(([sport, info]: any, i) => (
          <div key={i} className="p-3 bg-light rounded mb-3 border">
            <h5 className="text-success">{sport}</h5>
            <p className="mb-1"><strong>Opening Time:</strong> {info.opening_time}</p>
            <p className="mb-1"><strong>Closing Time:</strong> {info.closing_time}</p>
            <p className="mb-1"><strong>Day Hours:</strong> {info.day_start_time} - {info.day_end_time}</p>
            <p><strong>Night Hours:</strong> {info.night_start_time} - {info.night_end_time}</p>
          </div>
        ))}
      </div>

      {/* Dimensions */}
      <div className="mb-4">
        <h4 className="fw-bold">Dimensions</h4>
        <p>
          📏 Length: <strong>{turf.turf_length}</strong> |
          Width: <strong>{turf.turf_breadth}</strong> |
          Height: <strong>{turf.turf_height}</strong>
        </p>
      </div>

      {/* Book Now Button */}
      <div className="text-center my-5">
        <button
  className="btn btn-success btn-lg px-5"
  onClick={() => navigate(`/user/turfs/${turf.turf_id}/slots`)}
>
  Book Slots →
</button>
      </div>

    </div>
  );
};

export default TurfDetail;
