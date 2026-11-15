import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaPlus,
    FaEdit,
    FaEye,
    FaTrash,
    FaClock,
    FaSearch,
    FaSyncAlt,
    FaTimes,
    FaCheckCircle,
    FaHourglassHalf,
    FaMoneyBillWave
} from "react-icons/fa";

import TimesheetService from "../../services/timesheetService";
import Pagination from "../../components/common/Pagination";
import TimesheetForm from "./TimesheetForm";

import "./Timesheet.css";

function unwrapArray(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.$values)) return data.data.$values;
    if (Array.isArray(data?.items)) return data.items;

    return [];
}

function TimesheetList() {
    const navigate = useNavigate();

    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const itemsPerPage = 10;

    const loadTimesheets = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            const response = await TimesheetService.getTimesheets();
            setTimesheets(unwrapArray(response));
        } catch (error) {
            console.error(
                "Error loading timesheets:",
                error?.response?.data || error?.message
            );

            setTimesheets([]);

            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Unable to load timesheets.",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTimesheets();
    }, []);

    const openAddModal = () => {
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (id) => {
        setEditingId(id);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
    };

    const handleSaved = async () => {
        closeModal();
        await loadTimesheets(false);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Timesheet?",
            text: "This record will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b"
        });

        if (!result.isConfirmed) return;

        try {
            await TimesheetService.delete(id);

            await Swal.fire({
                title: "Deleted!",
                text: "Timesheet deleted successfully.",
                icon: "success",
                timer: 1600,
                showConfirmButton: false
            });

            await loadTimesheets(false);
        } catch (error) {
            console.error(
                "Delete error:",
                error?.response?.data || error?.message
            );

            Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Unable to delete timesheet.",
                icon: "error"
            });
        }
    };

    const filteredTimesheets = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) return timesheets;

        return timesheets.filter((item) => {
            const searchableValues = [
                item.id,
                item.employeeId,
                item.projectTaskId,
                item.description,
                item.projectTask?.title,
                item.projectTask?.taskCode,
                item.employee?.firstName,
                item.employee?.lastName,
                item.employee?.name,
                item.hours,
                item.isBillable ? "billable yes" : "non billable no",
                item.workDate
            ];

            return searchableValues.some((value) =>
                String(value ?? "").toLowerCase().includes(searchText)
            );
        });
    }, [timesheets, search]);

    const totalPages = Math.ceil(
        filteredTimesheets.length / itemsPerPage
    );

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safeCurrentPage - 1) * itemsPerPage;

    const paginatedTimesheets = filteredTimesheets.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    useEffect(() => {
        if (currentPage > Math.max(totalPages, 1)) {
            setCurrentPage(Math.max(totalPages, 1));
        }
    }, [currentPage, totalPages]);

    const completedCount = timesheets.filter(
        (item) => Number(item.hours) > 0
    ).length;

    const billableCount = timesheets.filter(
        (item) => item.isBillable === true
    ).length;

    const totalHours = timesheets.reduce(
        (sum, item) => sum + (Number(item.hours) || 0),
        0
    );

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "-";

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getEmployeeName = (item) => {
        const employee = item.employee;

        if (employee?.firstName || employee?.lastName) {
            return `${employee.firstName ?? ""} ${
                employee.lastName ?? ""
            }`.trim();
        }

        if (employee?.name) return employee.name;

        return `Employee #${item.employeeId ?? "-"}`;
    };

    return (
        <div className="timesheet-page">
            {/* Page header */}
            <div className="timesheet-header">
                <div className="timesheet-heading">
                    <div className="timesheet-heading-icon">
                        <FaClock />
                    </div>

                    <div>
                        <h2>Timesheets</h2>
                        <p>
                            Track employee working hours against tasks
                        </p>
                    </div>
                </div>

                <div className="timesheet-header-actions">
                    <button
                        type="button"
                        className="timesheet-refresh-btn"
                        onClick={() => loadTimesheets()}
                        disabled={loading}
                        title="Refresh timesheets"
                    >
                        <FaSyncAlt className={loading ? "timesheet-spin" : ""} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        className="timesheet-add-btn"
                        onClick={openAddModal}
                    >
                        <FaPlus />
                        Add Timesheet
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="timesheet-stats-grid">
                <div className="timesheet-stat-card">
                    <div className="timesheet-stat-icon stat-blue">
                        <FaClock />
                    </div>
                    <div>
                        <p>Total Records</p>
                        <h3>{timesheets.length}</h3>
                    </div>
                </div>

                <div className="timesheet-stat-card">
                    <div className="timesheet-stat-icon stat-green">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p>Logged Records</p>
                        <h3>{completedCount}</h3>
                    </div>
                </div>

                <div className="timesheet-stat-card">
                    <div className="timesheet-stat-icon stat-purple">
                        <FaHourglassHalf />
                    </div>
                    <div>
                        <p>Total Hours</p>
                        <h3>{Number(totalHours.toFixed(2))}</h3>
                    </div>
                </div>

                <div className="timesheet-stat-card">
                    <div className="timesheet-stat-icon stat-amber">
                        <FaMoneyBillWave />
                    </div>
                    <div>
                        <p>Billable Records</p>
                        <h3>{billableCount}</h3>
                    </div>
                </div>
            </div>

            {/* Search toolbar */}
            <div className="timesheet-toolbar">
                <div className="timesheet-search-wrap">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search task, employee, description..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="timesheet-search"
                    />

                    {search && (
                        <button
                            type="button"
                            className="timesheet-clear-search"
                            onClick={() => setSearch("")}
                            title="Clear search"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="timesheet-total">
                    Showing <strong>{filteredTimesheets.length}</strong>{" "}
                    record{filteredTimesheets.length === 1 ? "" : "s"}
                </div>
            </div>

            {/* Table */}
            <div className="timesheet-table-wrapper">
                {loading ? (
                    <div className="timesheet-loading">
                        <div className="timesheet-spinner" />
                        <span>Loading timesheets...</span>
                    </div>
                ) : paginatedTimesheets.length === 0 ? (
                    <div className="timesheet-empty">
                        <FaClock />
                        <h3>No timesheets found</h3>
                        <p>
                            {search
                                ? "Try another search term."
                                : "Add a timesheet to start tracking working hours."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                className="timesheet-add-btn"
                                onClick={openAddModal}
                            >
                                <FaPlus />
                                Add Timesheet
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="timesheet-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Task</th>
                                <th>Employee</th>
                                <th>Work Date</th>
                                <th>Hours</th>
                                <th>Billable</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedTimesheets.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{startIndex + index + 1}</td>

                                    <td>
                                        <div className="timesheet-task">
                                            <strong>
                                                {item.projectTask?.title ||
                                                    `Task #${item.projectTaskId ?? "-"}`}
                                            </strong>

                                            {item.projectTask?.taskCode && (
                                                <small>
                                                    {item.projectTask.taskCode}
                                                </small>
                                            )}
                                        </div>
                                    </td>

                                    <td>{getEmployeeName(item)}</td>

                                    <td>{formatDate(item.workDate)}</td>

                                    <td>
                                        <span className="hours-badge">
                                            {Number(item.hours) || 0} hrs
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`billable ${
                                                item.isBillable ? "yes" : "no"
                                            }`}
                                        >
                                            {item.isBillable ? "Yes" : "No"}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className="description-cell"
                                            title={item.description || ""}
                                        >
                                            {item.description || "-"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="timesheet-actions">
                                            <button
                                                type="button"
                                                className="action-view"
                                                title="View"
                                                onClick={() =>
                                                    navigate(
                                                        `/timesheets/details/${item.id}`
                                                    )
                                                }
                                            >
                                                <FaEye />
                                            </button>

                                            <button
                                                type="button"
                                                className="action-edit"
                                                title="Edit"
                                                onClick={() =>
                                                    openEditModal(item.id)
                                                }
                                            >
                                                <FaEdit />
                                            </button>

                                            <button
                                                type="button"
                                                className="action-delete"
                                                title="Delete"
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Add/Edit modal */}
            {modalOpen &&
                createPortal(
                    <div
                        className="timesheet-modal-backdrop"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeModal();
                            }
                        }}
                    >
                        <div
                            className="timesheet-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="timesheet-modal-title"
                        >
                            <div className="timesheet-modal-header">
                                <div className="timesheet-modal-title">
                                    <div className="timesheet-modal-icon">
                                        {editingId ? <FaEdit /> : <FaPlus />}
                                    </div>

                                    <div>
                                        <h2 id="timesheet-modal-title">
                                            {editingId
                                                ? "Edit Timesheet"
                                                : "Add Timesheet"}
                                        </h2>
                                        <p>
                                            {editingId
                                                ? "Update logged working hours"
                                                : "Log working hours against a task"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="timesheet-modal-close"
                                    onClick={closeModal}
                                    aria-label="Close modal"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="timesheet-modal-body">
                                <TimesheetForm
                                    key={editingId ?? "new-timesheet"}
                                    modalMode
                                    timesheetId={editingId}
                                    onSaved={handleSaved}
                                    onCancel={closeModal}
                                />
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}

export default TimesheetList;