import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import LeaveService from "../../services/leaveService";
import LeaveForm from "./LeaveForm";
import Pagination from "../../components/common/Pagination";
import "./Leave.css";

function LeaveList() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);

    const itemsPerPage = 10;

    // Keep aligned with your current approval API.
    const currentUserId = 4002;

    useEffect(() => {
        loadLeaves();
    }, []);

    const loadLeaves = async () => {
        try {
            setLoading(true);

            const response = await LeaveService.getLeaveRequests();

            const data = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [];

            setLeaves(data);
        } catch (error) {
            console.error("Leave loading error:", error);

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                    "Unable to load leave requests.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => setShowModal(true);

    const closeModal = () => setShowModal(false);

    const handleSaved = async () => {
        closeModal();
        await loadLeaves();
    };

    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: "Approve Leave?",
            text: "This leave request will be approved.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Approve"
        });

        if (!result.isConfirmed) return;

        try {
            await LeaveService.approveLeave(id, currentUserId);

            await Swal.fire({
                icon: "success",
                title: "Approved",
                text: "Leave approved successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            await loadLeaves();
        } catch (error) {
            console.error("Approve leave error:", error);

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                    "Unable to approve leave.",
                "error"
            );
        }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            title: "Reject Leave",
            input: "textarea",
            inputLabel: "Rejection Remarks",
            inputPlaceholder: "Enter reason for rejection...",
            showCancelButton: true,
            confirmButtonText: "Reject",
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return "Please enter rejection remarks.";
                }
                return null;
            }
        });

        if (!result.isConfirmed) return;

        try {
            await LeaveService.rejectLeave(
                id,
                currentUserId,
                result.value.trim()
            );

            await Swal.fire({
                icon: "success",
                title: "Rejected",
                text: "Leave rejected successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            await loadLeaves();
        } catch (error) {
            console.error("Reject leave error:", error);

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                    "Unable to reject leave.",
                "error"
            );
        }
    };

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: "Cancel Leave?",
            text: "This leave request will be cancelled.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Cancel"
        });

        if (!result.isConfirmed) return;

        try {
            await LeaveService.cancelLeave(id);

            await Swal.fire({
                icon: "success",
                title: "Cancelled",
                text: "Leave cancelled successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            await loadLeaves();
        } catch (error) {
            console.error("Cancel leave error:", error);

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                    "Unable to cancel leave.",
                "error"
            );
        }
    };

    const normalizedSearch = search.trim().toLowerCase();

    const filteredLeaves = leaves.filter((leave) => {
        const employeeName = (
            leave.employeeName || ""
        ).toLowerCase();

        const leaveType = (
            leave.leaveTypeName || ""
        ).toLowerCase();

        const reason = (
            leave.reason || ""
        ).toLowerCase();

        const matchesSearch =
            employeeName.includes(normalizedSearch) ||
            leaveType.includes(normalizedSearch) ||
            reason.includes(normalizedSearch);

        const matchesStatus =
            !statusFilter || leave.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(
        filteredLeaves.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedLeaves = filteredLeaves.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalCount = leaves.length;
    const pendingCount = leaves.filter(
        item => item.status === "Pending"
    ).length;
    const approvedCount = leaves.filter(
        item => item.status === "Approved"
    ).length;
    const rejectedCount = leaves.filter(
        item => item.status === "Rejected"
    ).length;

    const getStatusClass = (status) => {
        switch (status) {
            case "Approved":
                return "status-approved";
            case "Rejected":
                return "status-rejected";
            case "Cancelled":
                return "status-cancelled";
            default:
                return "status-pending";
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? "-"
            : parsedDate.toLocaleDateString("en-IN");
    };

    return (
        <div className="leave-page">
            {/* HEADER */}
            <div className="leave-header-box">
                <div>
                    <h2>Leave Management</h2>
                    <p>Manage and monitor employee leave requests</p>
                </div>

                <button
                    type="button"
                    className="leave-primary-btn"
                    onClick={openAddModal}
                >
                    + Apply Leave
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="leave-stats-grid">
                <div className="leave-stat-card">
                    <div className="leave-stat-icon total">T</div>
                    <div>
                        <p>Total Requests</p>
                        <h3>{totalCount}</h3>
                    </div>
                </div>

                <div className="leave-stat-card">
                    <div className="leave-stat-icon pending">P</div>
                    <div>
                        <p>Pending</p>
                        <h3>{pendingCount}</h3>
                    </div>
                </div>

                <div className="leave-stat-card">
                    <div className="leave-stat-icon approved">A</div>
                    <div>
                        <p>Approved</p>
                        <h3>{approvedCount}</h3>
                    </div>
                </div>

                <div className="leave-stat-card">
                    <div className="leave-stat-icon rejected">R</div>
                    <div>
                        <p>Rejected</p>
                        <h3>{rejectedCount}</h3>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="leave-toolbar">
                <input
                    type="text"
                    placeholder="Search employee, leave type, reason..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="leave-table-card">
                {loading ? (
                    <div className="leave-loading">
                        Loading leave requests...
                    </div>
                ) : paginatedLeaves.length === 0 ? (
                    <div className="leave-empty">
                        No leave requests found.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedLeaves.map((leave, index) => (
                                    <tr key={leave.leaveRequestId}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>
                                            <strong>
                                                {leave.employeeName || "-"}
                                            </strong>
                                        </td>
                                        <td>{leave.leaveTypeName || "-"}</td>
                                        <td>{formatDate(leave.fromDate)}</td>
                                        <td>{formatDate(leave.toDate)}</td>
                                        <td>
                                            <strong>{leave.totalDays ?? "-"}</strong>
                                        </td>
                                        <td className="reason-cell">
                                            {leave.reason || "-"}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    leave.status
                                                )}`}
                                            >
                                                {leave.status || "Pending"}
                                            </span>
                                        </td>
                                        <td>
                                            {leave.status === "Pending" ? (
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="approve-btn"
                                                        onClick={() =>
                                                            handleApprove(
                                                                leave.leaveRequestId
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="reject-btn"
                                                        onClick={() =>
                                                            handleReject(
                                                                leave.leaveRequestId
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="cancel-btn"
                                                        onClick={() =>
                                                            handleCancel(
                                                                leave.leaveRequestId
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="no-action">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* APPLY LEAVE MODAL */}
            {showModal && (
                <div
                    className="leave-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="leave-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="leave-modal-title"
                    >
                        <div className="leave-modal-header">
                            <h2 id="leave-modal-title">Apply Leave</h2>

                            <button
                                type="button"
                                className="leave-modal-close"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        <LeaveForm
                            onClose={closeModal}
                            onSaved={handleSaved}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeaveList;