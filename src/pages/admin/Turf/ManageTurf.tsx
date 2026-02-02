import React, { useState, useEffect, useMemo } from "react";
import { getTurfs } from "../../../services/firestoreService";
import {
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";

export default function ManageTurf() {
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
    const [selectedSport, setSelectedSport] = useState<string>("all");
  const [isSportOpen, setIsSportOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getTurfs()
      .then((data) => setTurfs(data))
      .catch((err) => {
        console.error("Failed to load turfs:", err);
        setTurfs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value.trim().toLowerCase());
      }, 350),
    []
  );

    const sportIcon = (sport: string) => {
    sport = sport.toLowerCase();
    if (sport.includes("football")) return "⚽";
    if (sport.includes("cricket")) return "🏏";
    if (sport.includes("badminton")) return "🏸";
    return "🎯";
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  };

const filteredTurfs = useMemo(() => {
  let result = [...turfs];

  // ✅ Status filter
  if (statusFilter === "approved") {
    result = result.filter((t) => !!t.turf_active_status);
  } else if (statusFilter === "pending") {
    result = result.filter((t) => !t.turf_active_status);
  }

  // ✅ Search filter
  if (searchTerm) {
    result = result.filter((t) => {
      const name = (t.turf_name || "").toLowerCase();
      const location = (t.turf_location || t.city || "").toLowerCase();
      const owner = (t.owner_id || "").toLowerCase();

      return (
        name.includes(searchTerm) ||
        location.includes(searchTerm) ||
        owner.includes(searchTerm)
      );
    });
  }

  // ✅ Sports filter (FIXED)
  if (selectedSport !== "all") {
    result = result.filter((turf) =>
      turf.available_sports_list?.some((sport: string) =>
        extractSports(sport).includes(selectedSport)
      )
    );
  }

  // ✅ Sort pending first
  result.sort((a, b) => {
    const aApproved = !!a.turf_active_status;
    const bApproved = !!b.turf_active_status;
    if (!aApproved && bApproved) return -1;
    if (aApproved && !bApproved) return 1;
    return 0;
  });

  return result;
}, [turfs, searchTerm, statusFilter, selectedSport]);




  const availableSports = Array.from(
    new Set(
      turfs.flatMap(turf =>
        turf.available_sports_list?.flatMap((sport: string) =>
          extractSports(sport)
        ) || []
      )
    )
  ).sort();

  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">Loading turfs...</p>
      </div>
    );
  }

  return (
    <>
          <style>{`

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
         `}</style>

    <div className="container-fluid py-5 px-md-4 px-lg-5 mt-5 mb-5">
      {/* Header + Filters */}
      <div className="d-flex flex-column gap-3 mb-4">
        <h2 className="fw-bold text-center text-md-start">
          View All Sports Venues
        </h2>

        <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center">
          {/* Search */}
          <InputGroup className="w-100">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, location or owner"
              onChange={handleSearchChange}
            />
          </InputGroup>

<div className="position-relative w-100">
  <button
    type="button"
    className="form-select text-start"
    onClick={() => setIsSportOpen(prev => !prev)}
  >
    {selectedSport === "all" ? "Filter Sports" : selectedSport}
  </button>

  {isSportOpen && (
    <div className="dropdown-menu show w-100 p-2">
      <button
        className={`dropdown-item ${selectedSport === "all" ? "active" : ""}`}
        onClick={() => {
          setSelectedSport("all");
          setIsSportOpen(false);
        }}
      >
        All Sports
      </button>

      {availableSports.map((sport) => (
        <button
          key={sport}
          className={`dropdown-item ${selectedSport === sport ? "active" : ""}`}
          onClick={() => {
            setSelectedSport(sport);
            setIsSportOpen(false);
          }}
        >
          {sport}
        </button>
      ))}
    </div>
  )}
</div>


          {/* Status Filter */}
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-100 w-md-auto"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </Form.Select>

          {/* Count */}
          <Badge bg="success" className="fs-6 px-3 py-2 align-self-start">
            {filteredTurfs.length}
          </Badge>
        </div>
      </div>

      {/* Grid */}
      {filteredTurfs.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h5>No turfs match your filters</h5>
        </div>
      ) : (
        <Row xs={1} sm={2} md={2} lg={3} xl={4} xxl={5} className="g-4">
          {filteredTurfs.map((turf) => {
            const isApproved = !!turf.turf_active_status;
            const statusText = isApproved ? "Approved" : "Pending Approval";
            const statusBg = isApproved ? "success" : "danger";

            return (
              <Col key={turf.id}>
                <Card
                  className={`h-100 shadow-sm border-0 ${
                    !isApproved ? "border border-danger border-2" : ""
                  }`}
                  style={{ borderRadius: "14px" }}
                >
                  <Card.Img
                    variant="top"
                    src={
                      turf.turf_images?.[0] ||
                      "https://via.placeholder.com/400x180/67a521/ffffff?text=Turf"
                    }
                    alt={turf.turf_name}
                    style={{
                      height: "clamp(140px, 22vw, 180px)",
                      objectFit: "cover",
                    }}
                  />

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold fs-6 fs-md-5">
                      {turf.turf_name || "Unnamed Turf"}
                    </Card.Title>
  <div className="turf-card-sports">
                      {turf.available_sports_list?.slice(0, 3).map((sport: string, i: number) => (
                        <div key={i} className="sport-badge">
                          <span className="sport-badge-icon">{sportIcon(sport)}</span>
                          <span>{sport}</span>
                        </div>
                      ))}
                      {/* {turf.available_sports_list?.length > 3 && (
                        <div className="sport-badge">
                          +{turf.available_sports_list.length - 3}
                        </div>
                      )} */}
                    </div>
                    <div className="text-muted small mb-3">
                      <strong>Address:</strong>{" "}
                      {turf.turf_location || turf.city || "—"}
                    </div>

                    <Badge bg={statusBg} className="mb-3 py-2">
                      {statusText}
                    </Badge>

                    <button
                      className="btn btn-outline-success mt-auto w-100 rounded-pill"
                      onClick={() =>
                        navigate(
                          `/dashboard/owners/${turf.owner_id}/turfs/${turf.id}`
                        )
                      }
                    >
                      View Details
                    </button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
     </>
     
  );
}
