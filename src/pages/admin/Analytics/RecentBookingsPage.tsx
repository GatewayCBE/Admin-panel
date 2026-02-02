// // src/pages/admin/Analytics/RecentBookingsPage.tsx
// import React, { useEffect, useState, useMemo } from "react";
// import { getAllBookings } from "../../../services/firestoreService";
// import AdminNavbar from "./AdminNavbar";

// type BookingRow = {
//   booking_id: string;
//   booking_username?: string;
//   turf_name?: string;
//   turfName?: string;
//   sport?: string;
//   court?: string;
//   date?: string;
//   slot_start_time?: string;
//   time?: string;
//   paid_amount?: number;
//   unpaid_amount?: number;

//   // ✅ NEW NORMALIZED STATUS
//   booking_status: "paid" | "pending" | "cancelled";

//   // optional but useful
//   cancelled?: boolean;
//   payment_initiated_time?: string;
// };

// const PAGE_SIZE_OPTIONS = [10, 20, 50];

// const RecentBookingsPage: React.FC = () => {
//   const [bookings, setBookings] = useState<BookingRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(0);
//   const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const data = await getAllBookings();
//         if (mounted) setBookings(data);
//       } catch (err) {
//         console.error("Error fetching bookings:", err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     return bookings.filter((b) => {
//       if (statusFilter !== "all" && b.booking_status !== statusFilter) {
//         return false;
//       }

//       if (!q) return true;

//       return (
//         (b.booking_username || "").toLowerCase().includes(q) ||
//         (b.booking_id || "").toLowerCase().includes(q) ||
//         (b.turf_name || "").toLowerCase().includes(q) ||
//         (b.sport || "").toLowerCase().includes(q)
//       );
//     });
//   }, [bookings, search, statusFilter]);

//   const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

//   useEffect(() => {
//     setPage(0);
//   }, [search, statusFilter, pageSize]);

//   return (
//     <div className="admin-page-container">
//       <AdminNavbar />
//       <div className="container-fluid py-5 px-4 mt-5">
//         {/* Header */}
//         <div className="d-flex align-items-center justify-content-between mb-5">
//           <div className="d-flex align-items-center gap-4">
//             <button
//               className="btn btn-outline-secondary d-lg-none rounded-pill px-4"
//               onClick={() => setMobileSidebarOpen(true)}
//             >
//               Menu
//             </button>
//             <div>
//               <h1 className="h3 mb-1 fw-bold text-dark">Bookings</h1>
//               <p className="text-muted mb-0">
//                 Real-time admin view across all turfs
//               </p>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="d-flex gap-3 align-items-center">
//             <div className="position-relative">
//               <input
//                 type="text"
//                 className="form-control form-control-lg rounded-pill ps-5 shadow-sm border-0"
//                 placeholder="Search by user, ID, turf, sport, date, amount..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 style={{ width: 460, height: 54 }}
//               />
//               {/* Magnifying Glass Icon — stays fixed, never overlaps */}
//               <span className="position-absolute top-50 start-0 translate-middle-y ps-4 text-success">
//                 <i className="bi bi-search"></i>
//               </span>
//             </div>

//             <select
//               className="form-select form-select-lg rounded-pill shadow-sm"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               style={{ width: 160 }}
//             >
//               <option value="all">All Status</option>
//               <option value="paid">Paid</option>
//               <option value="pending">Pending</option>
//               <option value="cancelled">Cancelled</option>
//             </select>

//             <select
//               className="form-select form-select-lg rounded-pill shadow-sm"
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//               style={{ width: 130 }}
//             >
//               {PAGE_SIZE_OPTIONS.map((s) => (
//                 <option key={s} value={s}>
//                   {s} rows
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Main Card */}
//         <div className="card border-0 rounded-4 overflow-hidden shadow-card">
//           <div className="card-body p-0">
//             {loading ? (
//               <div className="text-center py-5">
//                 <div
//                   className="spinner-border text-primary"
//                   style={{ width: "3.5rem", height: "3.5rem" }}
//                 ></div>
//                 <p className="mt-4 text-muted fs-5">
//                   Loading latest bookings...
//                 </p>
//               </div>
//             ) : (
//               <>
//                 <div className="table-responsive">
//                   <table className="table table-hover align-middle mb-0">
//                     <thead
//                       className="bg-gradient text-white"
//                       style={{
//                         background: "linear-gradient(135deg, #1e40af, #3b82f6)",
//                       }}
//                     >
//                       <tr>
//                         <th className="ps-4 py-4 fw-semibold">Booking ID</th>
//                         <th className="py-4 fw-semibold">User</th>
//                         <th className="py-4 fw-semibold">Turf</th>
//                         <th className="py-4 fw-semibold">Sport / Court</th>
//                         <th className="py-4 fw-semibold">Date</th>
//                         <th className="py-4 fw-semibold">Time</th>
//                         <th className="text-end py-4 fw-semibold pe-4">
//                           Paid (₹)
//                         </th>
//                         <th className="text-end py-4 fw-semibold pe-4">
//                           Pending (₹)
//                         </th>
//                         <th className="text-center py-4 fw-semibold pe-4">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white">
//                       {pageData.map((b, i) => (
//                         <tr
//                           key={`${b.booking_id}-${i}`}
//                           className="border-bottom"
//                         >
//                           <td
//                             className="ps-4 py-4 fw-medium text-primary"
//                             style={{
//                               fontFamily: "monospace",
//                               fontSize: "0.92rem",
//                             }}
//                           >
//                             {b.booking_id}
//                           </td>
//                           <td className="py-4 fw-medium">
//                             {b.booking_username || "Guest"}
//                           </td>
//                           <td className="py-4 fw-semibold text-dark">
//                             {b.turf_name || b.turfName}
//                           </td>
//                           <td className="py-4 text-muted">
//                             {b.sport} / {b.court}
//                           </td>
//                           <td className="py-4">{b.date}</td>
//                           <td className="py-4 fw-medium">
//                             {b.slot_start_time || b.time}
//                           </td>
//                           <td className="text-end py-4 fw-bold text-success pe-4">
//                             ₹
//                             {Number(b.paid_amount || 0).toLocaleString("en-IN")}
//                           </td>
//                           <td className="text-end py-4 text-danger pe-4">
//                             ₹
//                             {Number(b.unpaid_amount || 0).toLocaleString(
//                               "en-IN",
//                             )}
//                           </td>
//                           <td className="text-center pe-4 py-4">
//                             {b.booking_status === "paid" && (
//                               <span className="badge px-4 py-2 fs-6 fw-semibold rounded-pill bg-success text-white">
//                                 Paid
//                               </span>
//                             )}

//                             {b.booking_status === "pending" && (
//                               <span className="badge px-4 py-2 fs-6 fw-semibold rounded-pill bg-warning text-dark">
//                                 Pending
//                               </span>
//                             )}

//                             {b.booking_status === "cancelled" && (
//                               <span className="badge px-4 py-2 fs-6 fw-semibold rounded-pill bg-danger text-white">
//                                 Cancelled
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {filtered.length === 0 && (
//                   <div className="text-center py-5">
//                     <div className="text-muted fs-4 mb-3">
//                       No bookings found
//                     </div>
//                     <p className="text-muted">
//                       Try adjusting your search or filters
//                     </p>
//                   </div>
//                 )}

//                 {/* Pagination */}
//                 <div className="d-flex justify-content-between align-items-center px-4 py-4 bg-light border-top">
//                   <div className="text-muted fw-medium">
//                     Showing <strong>{pageData.length}</strong> of{" "}
//                     <strong>{filtered.length}</strong> bookings
//                   </div>
//                   <div className="d-flex align-items-center gap-3">
//                     <button
//                       className="btn btn-outline-primary rounded-pill px-4"
//                       disabled={page <= 0}
//                       onClick={() => setPage((p) => Math.max(0, p - 1))}
//                     >
//                       Previous
//                     </button>
//                     <span className="fw-bold text-primary">
//                       Page {page + 1} of {pageCount}
//                     </span>
//                     <button
//                       className="btn btn-primary rounded-pill px-4"
//                       disabled={page >= pageCount - 1}
//                       onClick={() =>
//                         setPage((p) => Math.min(pageCount - 1, p + 1))
//                       }
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecentBookingsPage;

import React, { useState, useEffect } from "react";
import {
  getUserBookings,
  cancelBooking,
  canCancelBooking,
} from "../../../services/firestoreService";
import { auth } from "../../../firebase";
import { format } from "date-fns"; // optional – better date formatting
import { useAuth } from "../Turf/useAuth";

const RecentBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { user, loading: authLoading, isAdmin, claims } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (authLoading) return;

      console.log("Admin status:", isAdmin);
      console.log("Current claims:", claims);

      if (!isAdmin) {
        setError("Admin access required to view all bookings");
        return;
      }
      try {
        setLoading(true);
        // Use the new admin-specific function
        const data = await getUserBookings();
        setBookings(data);
      } catch (err: any) {
        console.error("Failed to load user bookings:", err);
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    console.log(
      "Current auth token claims:",
      auth.currentUser?.getIdTokenResult(),
    );
    fetchBookings();
  }, [authLoading, isAdmin]);

  const handleCancel = async (bookingId: string) => {
  if (!window.confirm("Are you sure?")) return;

  try {
    setCancellingId(bookingId);
    await cancelBooking(bookingId);
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  } catch (err: any) {
    alert(err.message || "Failed to cancel booking");
  } finally {
    setCancellingId(null);
  }
};

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr || "—";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PAID" || status === "paymentSuccess")
      return <span className="badge bg-success">Paid</span>;
    if (status === "CANCELLED")
      return <span className="badge bg-danger">Cancelled</span>;
    if (status === "PENDING")
      return <span className="badge bg-warning">Pending</span>;
    return <span className="badge bg-secondary">{status || "Unknown"}</span>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-3">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50" />
        <h5>No bookings found</h5>
        <p>Book your first turf slot today!</p>
      </div>
    );
  }

  const getDate = (b: any) => {
    const possible = [
      b.date,
      b.selectedDate,
      b.selecteddated,
      b.bookingDate,
      b.selected_date,
    ].find((val) => val && typeof val === "string" && val.trim());

    return possible || "—";
  };

  // Helper: Get turf name
  const getTurfName = (b: any) => {
    const possible = [
      b.turf_name,
      b.turfName,
      b.turf,
      b.turfName_,
      b.venueName,
    ].find((val) => val && typeof val === "string" && val.trim());

    return possible || "Unknown Turf";
  };

  // Helper: Get sport
  const getSport = (b: any) => {
    const possible = [
      b.booked_sports_name,
      b.bookedSportsName,
      b.sport,
      b.sportsName,
      b.booked_sport,
    ].find((val) => val && typeof val === "string" && val.trim());

    return possible || "—";
  };

  // Helper: Get time range
  const getTimeDisplay = (b: any) => {
    const start =
      [
        b.slot_start_time,
        b.slotStartTime,
        b.slotStart,
        b.startTime,
        b.slot_start,
      ].find((val) => val && typeof val === "string" && val.trim()) || "—";

    const end =
      [b.slot_end_time, b.slotEndTime, b.slotEnd, b.endTime, b.slot_end].find(
        (val) => val && typeof val === "string" && val.trim(),
      ) || "";

    if (start === "—" && end === "") return "—";
    return end ? `${start} – ${end}` : start;
  };

  // Helper: Get total amount
  const getTotal = (b: any) => {
    return b.total_amount ?? b.totalAmount ?? b.total ?? b.amount ?? 0;
  };

  // Helper: Get status
  const getStatus = (b: any) => {
    const s = (
      b.payment_status ||
      b.paymentStatus ||
      b.status ||
      b.bookingStatus ||
      ""
    ).toLowerCase();

    if (s.includes("success") || s === "paid" || s === "confirmed")
      return "Paid";
    if (s.includes("partial") || s === "partial") return "PARTIAL";
    if (s.includes("cancel")) return "Cancelled";
    return s.charAt(0).toUpperCase() + s.slice(1) || "Unknown";
  };

  return (
    <div className="container py-5 mt-5">
      <h2 className="mb-4 fw-bold text-success">User Bookings</h2>

      <div className="row g-4">
        {bookings.map((booking) => {
          const canCancel =
            canCancelBooking(booking) && booking.payment_status !== "CANCELLED";
          {
            !getDate(booking) && (
              <small className="text-warning">No date field</small>
            );
          }
          {
            !getTurfName(booking) && (
              <small className="text-warning">No turf name</small>
            );
          }
          {
            !getTimeDisplay(booking) ||
              (getTimeDisplay(booking) === "—" && (
                <small className="text-warning">No time fields</small>
              ));
          }

          return (
            <div key={booking.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-light">
                  <h6 className="mb-0 text-capitalize">
                    Turf: <strong>{getTurfName(booking)}</strong>
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <strong>Date:</strong> {formatDate(getDate(booking))}
                  </div>
                  <div className="mb-2">
                    <strong>Sport:</strong> {getSport(booking)}
                  </div>
                  <div className="mb-2">
                    <strong>Court:</strong>{" "}
                    {booking.court || booking.Court || "court 1"}
                  </div>
                  <div className="mb-2">
                    <strong>Time:</strong> {getTimeDisplay(booking)}
                  </div>
                  <div className="mb-2">
                    <strong>Amount:</strong> ₹{getTotal(booking)}
                    {booking.unpaid_amount > 0 && (
                      <small className="text-danger ms-2">
                        (₹{booking.unpaid_amount} pending)
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(getStatus(booking))}
                  </div>

                  {canCancel && (
                    <button
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Booking"
                      )}
                    </button>
                  )}

                  {!canCancel && booking.payment_status !== "CANCELLED" && (
                    <small className="text-muted d-block text-center mt-2">
                      Cancellation not allowed (past start time or already
                      cancelled)
                    </small>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentBookingsPage;
