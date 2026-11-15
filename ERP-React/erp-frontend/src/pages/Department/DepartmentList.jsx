
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaBuilding,
    FaSearch,
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaSyncAlt
} from "react-icons/fa";

import DepartmentService from "../../services/departmentService";
import sweetAlert from "../../utils/sweetAlert";
import notification from "../../utils/notification";
import Pagination from "../../components/common/Pagination";
import DepartmentForm from "./DepartmentForm";

import "./Department.css";

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewDepartment, setViewDepartment] = useState(null);

    const itemsPerPage = 10;
    const navigate = useNavigate();

    const loadDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await DepartmentService.getDepartments();
            const data = response?.data ?? response;

            const rows = Array.isArray(data)
                ? data
                : data?.$values ??
                  data?.items ??
                  data?.data ??
                  data?.departments ??
                  [];

            setDepartments(Array.isArray(rows) ? rows : []);
        } catch (err) {
            console.error("Department loading error:", err);

            const message =
                err.response?.status === 401
                    ? "Unauthorized. Please login again."
                    : err.response?.data?.message ||
                      "Unable to load departments.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const getId = (department) => department.id ?? department.Id;

    const getName = (department) =>
        department.name ?? department.Name ?? "";

    const getDescription = (department) =>
        department.description ?? department.Description ?? "";

    const isActive = (department) =>
        department.isActive ?? department.IsActive ?? false;

    const getEmployeeCount = (department) => {
        const employees = department.employees ?? department.Employees;
        return Array.isArray(employees) ? employees.length : 0;
    };

    const filteredDepartments = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return departments;

        return departments.filter((department) =>
            getName(department).toLowerCase().includes(query) ||
            getDescription(department).toLowerCase().includes(query)
        );
    }, [departments, search]);

    const activeCount = departments.filter(isActive).length;
    const inactiveCount = departments.length - activeCount;

    const employeeCount = departments.reduce(
        (total, department) => total + getEmployeeCount(department),
        0
    );

    const totalPages = Math.ceil(
        filteredDepartments.length / itemsPerPage
    );

    const currentDepartments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredDepartments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const openCreateModal = () => {
        setEditingId(null);
        setViewDepartment(null);
        setShowModal(true);
    };

    const openEditModal = (id) => {
        setViewDepartment(null);
        setEditingId(id);
        setShowModal(true);
    };

    const closeModal = useCallback(() => {
        setShowModal(false);
        setEditingId(null);
    }, []);

    const handleSaved = async () => {
        closeModal();
        await loadDepartments();
    };

    const handleDelete = async (id, name) => {
        const confirmed = await sweetAlert.confirmDelete(`"${name}"`);

        if (!confirmed) return;

        try {
            await DepartmentService.deleteDepartment(id);

            setDepartments((previous) =>
                previous.filter((department) => getId(department) !== id)
            );

            notification.success("Department deleted successfully");
        } catch (err) {
            console.error("Delete department error:", err);

            notification.error(
                err.response?.data?.message ||
                "Unable to delete department."
            );
        }
    };

    if (loading) {
        return (
            <div className="department-page">
                <div className="department-loading">
                    <div className="department-spinner" />
                    <p>Loading departments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="department-page">
            {/* Header box */}
            <div className="department-header-box">
                <div>
                    <span className="department-eyebrow">
                        ORGANIZATION MANAGEMENT
                    </span>

                    <h1>
                        <FaBuilding /> Department Management
                    </h1>

                    <p>Manage departments and organization structure</p>
                </div>

                <button
                    type="button"
                    className="department-add-btn"
                    onClick={openCreateModal}
                >
                    <FaPlus /> Add Department
                </button>
            </div>

            {error && (
                <div className="department-error">
                    <span>{error}</span>
                    <button type="button" onClick={loadDepartments}>
                        Retry
                    </button>
                </div>
            )}

            {/* Summary cards */}
            <div className="department-stats-grid">
                <div className="department-stat-card total">
                    <div className="department-stat-icon">
                        <FaBuilding />
                    </div>
                    <div>
                        <p>Total Departments</p>
                        <h3>{departments.length}</h3>
                        <span>All departments</span>
                    </div>
                </div>

                <div className="department-stat-card active">
                    <div className="department-stat-icon">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p>Active Departments</p>
                        <h3>{activeCount}</h3>
                        <span>Currently active</span>
                    </div>
                </div>

                <div className="department-stat-card inactive">
                    <div className="department-stat-icon">
                        <FaTimesCircle />
                    </div>
                    <div>
                        <p>Inactive Departments</p>
                        <h3>{inactiveCount}</h3>
                        <span>Currently inactive</span>
                    </div>
                </div>

                <div className="department-stat-card employees">
                    <div className="department-stat-icon">
                        <FaUsers />
                    </div>
                    <div>
                        <p>Listed Employees</p>
                        <h3>{employeeCount}</h3>
                        <span>From loaded department data</span>
                    </div>
                </div>
            </div>

            {/* Department table */}
            <div className="department-table-card">
                <div className="department-toolbar">
                    <div>
                        <h3>All Departments</h3>
                        <p>Search and manage department records</p>
                    </div>

                    <div className="department-toolbar-right">
                        <div className="department-search">
                            <FaSearch />
                            <input
                                type="search"
                                placeholder="Search departments..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <span className="department-total-pill">
                            Total: {filteredDepartments.length}
                        </span>

                        <button
                            type="button"
                            className="department-refresh-btn"
                            title="Refresh departments"
                            onClick={loadDepartments}
                        >
                            <FaSyncAlt />
                        </button>
                    </div>
                </div>

                <div className="department-table-container">
                    <table className="department-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Department Name</th>
                                <th>Description</th>
                                <th>Employees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentDepartments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-departments">
                                        <FaBuilding />
                                        <p>No departments found.</p>

                                        {!search && (
                                            <button
                                                type="button"
                                                onClick={openCreateModal}
                                            >
                                                Add your first department
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                currentDepartments.map((department) => {
                                    const id = getId(department);
                                    const name = getName(department);
                                    const active = isActive(department);

                                    return (
                                        <tr key={id}>
                                            <td>
                                                <span className="department-id">
                                                    #{id}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="department-name">
                                                    <div className="department-icon">
                                                        <FaBuilding />
                                                    </div>
                                                    <strong>{name}</strong>
                                                </div>
                                            </td>

                                            <td>
                                                {getDescription(department) || "—"}
                                            </td>

                                            <td>
                                                <span className="employee-count">
                                                    {getEmployeeCount(department)}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`department-status ${
                                                        active ? "active" : "inactive"
                                                    }`}
                                                >
                                                    {active ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="department-actions">
                                                    <button
                                                        type="button"
                                                        title="View"
                                                        className="action-btn view"
                                                        onClick={() =>
                                                            setViewDepartment(department)
                                                        }
                                                    >
                                                        <FaEye />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(id)}
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        className="action-btn delete"
                                                        onClick={() =>
                                                            handleDelete(id, name)
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="department-pagination">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Create/Edit modal */}
            {showModal && (
                <DepartmentForm
                    departmentId={editingId}
                    onClose={closeModal}
                    onSaved={handleSaved}
                />
            )}

            {/* View modal */}
            {viewDepartment && (
                <div
                    className="department-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setViewDepartment(null);
                        }
                    }}
                >
                    <div
                        className="department-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="department-view-title"
                    >
                        <div className="department-modal-header">
                            <div>
                                <span className="department-eyebrow">
                                    DEPARTMENT DETAILS
                                </span>
                                <h3 id="department-view-title">
                                    {getName(viewDepartment)}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="department-modal-close"
                                onClick={() => setViewDepartment(null)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="department-view-body">
                            <p>
                                <strong>Department ID:</strong>{" "}
                                {getId(viewDepartment)}
                            </p>
                            <p>
                                <strong>Name:</strong>{" "}
                                {getName(viewDepartment)}
                            </p>
                            <p>
                                <strong>Description:</strong>{" "}
                                {getDescription(viewDepartment) || "No description"}
                            </p>
                            <p>
                                <strong>Employees:</strong>{" "}
                                {getEmployeeCount(viewDepartment)}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                {isActive(viewDepartment) ? "Active" : "Inactive"}
                            </p>
                        </div>

                        <div className="department-modal-actions">
                            <button
                                type="button"
                                className="department-cancel-btn"
                                onClick={() => setViewDepartment(null)}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="department-save-btn"
                                onClick={() => openEditModal(getId(viewDepartment))}
                            >
                                <FaEdit /> Edit Department
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentList;
