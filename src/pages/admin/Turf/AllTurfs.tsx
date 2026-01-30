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

export default function AllTurfs() {
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  };

  const filteredTurfs = useMemo(() => {
    let result = turfs;

    if (statusFilter === "approved") {
      result = result.filter((t) => !!t.turf_active_status);
    } else if (statusFilter === "pending") {
      result = result.filter((t) => !t.turf_active_status);
    }

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

    result.sort((a, b) => {
      const aApproved = !!a.turf_active_status;
      const bApproved = !!b.turf_active_status;
      if (!aApproved && bApproved) return -1;
      if (aApproved && !bApproved) return 1;
      return 0;
    });

    return result;
  }, [turfs, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">Loading turfs...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 px-lg-5 mt-4 mb-5">
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

          {/* Status Filter */}
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-100 w-md-auto"
          >
            <option value="all">All Statuses</option>
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
  );
}
