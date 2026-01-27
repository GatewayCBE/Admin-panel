// src/pages/AllTurfs.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { getTurfs } from '../../../services/firestoreService';
import {
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Form,
  InputGroup,
} from 'react-bootstrap';
// Make sure @types/lodash is installed or use custom debounce
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

export default function AllTurfs() {
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    getTurfs()
      .then((data) => setTurfs(data))
      .catch((err) => {
        console.error('Failed to load turfs:', err);
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

  // Filtered + Sorted turfs
  const filteredTurfs = useMemo(() => {
    let result = turfs;

    // Status filter
    if (statusFilter === 'approved') {
      result = result.filter((t) => !!t.turf_active_status);
    } else if (statusFilter === 'pending') {
      result = result.filter((t) => !t.turf_active_status);
    }

    // Search
    if (searchTerm) {
      result = result.filter((t) => {
        const name = (t.turf_name || '').toLowerCase();
        const location = (t.turf_location || t.city || '').toLowerCase();
        const owner = (t.owner_id || '').toLowerCase();

        return (
          name.includes(searchTerm) ||
          location.includes(searchTerm) ||
          owner.includes(searchTerm)
        );
      });
    }

    // Sort: Pending Approval first, then Approved
    // (stable sort → original Firestore order preserved within groups)
    result.sort((a, b) => {
      const aApproved = !!a.turf_active_status;
      const bApproved = !!b.turf_active_status;

      if (!aApproved && bApproved) return -1; // pending before approved
      if (aApproved && !bApproved) return 1;
      return 0; // same status → keep original order
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

  if (turfs.length === 0) {
    return <div className="text-center mt-5 py-5">No turfs found.</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Header + Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <h2 className="mb-0">View All Sports Venues</h2>
        </div>

        <div className="d-flex flex-wrap gap-3 align-items-center">
          {/* Search */}
          <InputGroup style={{ width: 'auto', minWidth: '400px' }}>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name/address"
              onChange={handleSearchChange}
              aria-label="Search turfs"
            />
          </InputGroup>

          {/* Status Filter */}
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </Form.Select>

          {/* Count */}
          <Badge bg="success" className="fs-5 px-3 py-2">
            {filteredTurfs.length}
          </Badge>
        </div>
      </div>

      {/* Grid */}
      {filteredTurfs.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>No turfs match your filters</h4>
          <p>Try adjusting the search or status filter.</p>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} xxl={5} className="g-4">
          {filteredTurfs.map((turf) => {
            const isApproved = !!turf.turf_active_status;
            const statusText = isApproved ? 'Approved' : 'Pending Approval';
            const statusBg = isApproved ? 'success' : 'danger';
            const statusTextColor = 'text-white';

            return (
              <Col key={turf.id}>
                <Card
                  className={`h-100 shadow-sm border-0 overflow-hidden hover-lift ${
    !isApproved ? 'border border-danger border-2' : ''
  }`}
                  style={{ borderRadius: '12px' }}
                >
                  <Card.Img
                    variant="top"
                    src={
                      turf.turf_images?.[0] ||
                      'https://via.placeholder.com/400x180/67a521/ffffff?text=Turf'
                    }
                    alt={turf.turf_name || 'Turf'}
                    style={{
                      height: '160px',
                      objectFit: 'cover',
                      backgroundColor: '#f0f0f0',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x180/cccccc/666666?text=No+Image';
                    }}
                  />

                  <Card.Body className="d-flex flex-column p-3">
                    <Card.Title className="fw-bold mb-2 fs-5 line-clamp-2">
                      {turf.turf_name || 'Unnamed Turf'}
                    </Card.Title>

                    <div className="text-muted small mb-3 flex-grow-1">
                      <div className="mb-1">
                        <strong>Address:</strong>{' '}
                        <span className="line-clamp-2">
                          {turf.turf_location || turf.city || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <Badge
                        bg={statusBg}
                        className={`px-4 py-2 fs-6 fw-medium w-100 rounded-pill ${statusTextColor}`}
                        style={{ minWidth: '160px' }}
                      >
                        {statusText}
                      </Badge>
                    </div>

                    <div className="mt-1">
                      <button className="btn btn-outline-success btn-sm w-100 rounded-pill"
                      onClick ={() => navigate(`/dashboard/owners/${turf.owner_id}/turfs/${turf.id}`)}>
                        View Details
                      </button>
                    </div>
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