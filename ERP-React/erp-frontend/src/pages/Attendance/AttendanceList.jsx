
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import AttendanceService from "../../services/attendanceService";
import AttendanceForm from "./AttendanceForm";
import Pagination from "../../components/common/Pagination";
import "./Attendance.css";

function AttendanceList() {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const itemsPerPage = 10;

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        try {
            setLoading(true);

            const response = await AttendanceService.getAttendance();

            const data = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [];

            setAttendance(data);
        } catch (error) {
            console.error("Attendance loading error:", error);
            Swal.fire("Error", "Unable to load attendance.", "error");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setShowModal(true);
    };

    const openEditModal = (id) => {
        setEditingId(id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleSaved = async () => {
        closeModal();
        await loadAttendance();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Attendance?",
            text: "This attendance record will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626"
        });

        if (!result.isConfirmed) return;

        try {
            await AttendanceService.deleteAttendance(id);

            await Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "Attendance deleted successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            await loadAttendance();
        } catch (error) {
            console.error("Attendance delete error:", error);

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                    "Unable to delete attendance.",
                "error"
            );
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Present":
                return "attendance-present";
            case "Absent":
                return "attendance-absent";
            case "Late":
                return "attendance-late";
            case "HalfDay":
                return "attendance-halfday";
            case "Leave":
                return "attendance-leave";
            default:
                return "";
        }
    };

    const normalizedSearch = search.trim().toLowerCase();

    const filteredAttendance = attendance.filter((item) => {
        const employeeName = (
            item.employeeName ||
            [
                item.employee?.firstName,
                item.employee?.lastName
            ].filter(Boolean).join(" ")
        ).toLowerCase();

        const itemDate = item.attendanceDate?.substring(0, 10);

        return (
            employeeName.includes(normalizedSearch) &&
            (!statusFilter || item.status === statusFilter) &&
            (!dateFilter || itemDate === dateFilter)
        );
    });

    const totalPages = Math.ceil(
        filteredAttendance.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedAttendance = filteredAttendance.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, dateFilter]);

    const presentCount = attendance.filter(
        item => item.status === "Present"
    ).length;

    const absentCount = attendance.filter(
        item => item.status === "Absent"
    ).length;

    const lateCount = attendance.filter(
        item => item.status === "Late"
    ).length;

    const formatTime = (time) => {
        if (!time) return "-";

        const parts = String(time).split(":");
        if (parts.length < 2) return time;

        const hour = Number(parts[0]);
        const minute = parts[1];

        if (Number.isNaN(hour)) return time;

        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
    };

    return (
        <div className="attendance-page">
            {/* HEADER */}
            <div className="attendance-header-box">
                <div>
                    <h2>Attendance Management</h2>
                    <p>Manage and monitor employee attendance</p>
                </div>

                <button
                    type="button"
                    className="attendance-primary-btn"
                    onClick={openAddModal}
                >
                    + Mark Attendance
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="attendance-stats-grid">
                <div className="attendance-stat-card">
                    <div className="attendance-stat-icon total">A</div>
                    <div>
                        <p>Total Records</p>
                        <h3>{attendance.length}</h3>
                    </div>
                </div>

                <div className="attendance-stat-card">
                    <div className="attendance-stat-icon present">P</div>
                    <div>
                        <p>Present</p>
                        <h3>{presentCount}</h3>
                    </div>
                </div>

                <div className="attendance-stat-card">
                    <div className="attendance-stat-icon absent">A</div>
                    <div>
                        <p>Absent</p>
                        <h3>{absentCount}</h3>
                    </div>
                </div>

                <div className="attendance-stat-card">
                    <div className="attendance-stat-icon late">L</div>
                    <div>
                        <p>Late</p>
                        <h3>{lateCount}</h3>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="attendance-toolbar">
                <input
                    type="text"
                    placeholder="Search employee..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="HalfDay">Half Day</option>
                    <option value="Leave">Leave</option>
                </select>

                <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                />
            </div>

            {/* TABLE */}
            <div className="attendance-table-card">
                {loading ? (
                    <div className="attendance-loading">
                        Loading attendance...
                    </div>
                ) : paginatedAttendance.length === 0 ? (
                    <div className="attendance-empty">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedAttendance.map((item, index) => {
                                    const employeeName =
                                        item.employeeName ||
                                        [
                                            item.employee?.firstName,
                                            item.employee?.lastName
                                        ].filter(Boolean).join(" ") ||
                                        "-";

                                    return (
                                        <tr key={item.attendanceId}>
                                            <td>{startIndex + index + 1}</td>

                                            <td>
                                                <strong>{employeeName}</strong>
                                            </td>

                                            <td>
                                                {item.attendanceDate
                                                    ? new Date(
                                                        item.attendanceDate
                                                    ).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>

                                            <td>{formatTime(item.checkInTime)}</td>
                                            <td>{formatTime(item.checkOutTime)}</td>

                                            <td>
                                                <span
                                                    className={`attendance-status ${getStatusClass(item.status)}`}
                                                >
                                                    {item.status || "-"}
                                                </span>
                                            </td>

                                            <td>{item.remarks || "-"}</td>

                                            <td>
                                                <div className="attendance-actions">
                                                    <button
                                                        type="button"
                                                        className="attendance-view-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/attendance/details/${item.attendanceId}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="attendance-edit-btn"
                                                        onClick={() =>
                                                            openEditModal(item.attendanceId)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="attendance-delete-btn"
                                                        onClick={() =>
                                                            handleDelete(item.attendanceId)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* ADD / EDIT MODAL */}
            {/* ADD / EDIT MODAL */}
{showModal && (
    <div
        className="attendance-modal-overlay"
        onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        }}
    >
        <div
            className="attendance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-modal-title"
        >
            <div className="attendance-modal-header">
                <h2 id="attendance-modal-title">
                    {editingId
                        ? "Edit Attendance"
                        : "Mark Attendance"}
                </h2>

                <button
                    type="button"
                    className="attendance-modal-close"
                    onClick={closeModal}
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>

            <AttendanceForm
                key={editingId ?? "new-attendance"}
                id={editingId}
                onClose={closeModal}
                onSaved={handleSaved}
            />
        </div>
    </div>
)}
        </div>
    );
}

export default AttendanceList;
