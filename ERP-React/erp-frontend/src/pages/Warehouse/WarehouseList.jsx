
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
    FaPlus,
    FaEdit,
    FaEye,
    FaTrash,
    FaWarehouse,
    FaCheckCircle,
    FaTimesCircle,
    FaTimes,
    FaSave,
    FaMapMarkerAlt,
    FaSearch
} from "react-icons/fa";

import WarehouseService from "../../services/warehouseService";
import Pagination from "../../components/common/Pagination";
import "./Warehouse.css";

const initialForm = {
    name: "",
    code: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    email: "",
    isActive: true
};

function WarehouseList() {
    const navigate = useNavigate();

    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ ...initialForm });

    // ==========================================
    // Load Warehouses
    // ==========================================
    const loadWarehouses = async () => {
        try {
            setLoading(true);

            const response = await WarehouseService.getWarehouses();

            const data = Array.isArray(response)
                ? response
                : response?.data ?? response?.items ?? [];

            setWarehouses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading warehouses:", error);

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Failed to load warehouses"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWarehouses();
    }, []);

    // ==========================================
    // Summary Cards
    // ==========================================
    const totalWarehouses = warehouses.length;

    const activeWarehouses = warehouses.filter(
        (item) => item.isActive === true
    ).length;

    const inactiveWarehouses =
        totalWarehouses - activeWarehouses;

    // ==========================================
    // Search + Status Filter
    // ==========================================
    const filteredWarehouses = warehouses.filter((item) => {
        const query = search.trim().toLowerCase();

        const matchesSearch = [
            item.name,
            item.code,
            item.city,
            item.state,
            item.phone
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(query)
        );

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && item.isActive === true) ||
            (statusFilter === "inactive" && item.isActive !== true);

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(
        filteredWarehouses.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentWarehouses = filteredWarehouses.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // ==========================================
    // Open Add Modal
    // ==========================================
    const openAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ ...initialForm });
        setShowModal(true);
    };

    // ==========================================
    // Open Edit Modal With Existing Data
    // ==========================================
    const openEditModal = (warehouse) => {
        setIsEditMode(true);
        setEditingId(warehouse.id);

        setFormData({
            ...initialForm,
            ...warehouse,
            name: warehouse.name ?? "",
            code: warehouse.code ?? "",
            description: warehouse.description ?? "",
            address: warehouse.address ?? "",
            city: warehouse.city ?? "",
            state: warehouse.state ?? "",
            country: warehouse.country ?? "",
            postalCode: warehouse.postalCode ?? "",
            phone: warehouse.phone ?? "",
            email: warehouse.email ?? "",
            isActive: warehouse.isActive ?? true
        });

        setShowModal(true);
    };

    // ==========================================
    // Close Modal
    // ==========================================
    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ ...initialForm });
    };

    // ==========================================
    // Form Change
    // ==========================================
    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // ==========================================
    // Create / Update Warehouse
    // ==========================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Warehouse name is required");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...formData,
                name: formData.name.trim(),
                code: formData.code.trim(),
                description: formData.description.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
                postalCode: formData.postalCode.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim()
            };

            if (isEditMode) {
                await WarehouseService.updateWarehouse({
                    ...payload,
                    id: editingId
                });

                toast.success("Warehouse updated successfully");
            } else {
                await WarehouseService.createWarehouse(payload);

                toast.success("Warehouse created successfully");
            }

            setShowModal(false);
            setIsEditMode(false);
            setEditingId(null);
            setFormData({ ...initialForm });
            setCurrentPage(1);

            await loadWarehouses();
        } catch (error) {
            console.error(
                isEditMode
                    ? "Update warehouse error:"
                    : "Create warehouse error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                (isEditMode
                    ? "Failed to update warehouse"
                    : "Failed to create warehouse")
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // Delete Warehouse
    // ==========================================
    const handleDelete = async (warehouse) => {
        if (deletingId !== null) return;

        const result = await Swal.fire({
            title: "Delete Warehouse?",
            text: `Are you sure you want to delete "${warehouse.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingId(warehouse.id);

            await WarehouseService.deleteWarehouse(warehouse.id);

            setWarehouses((previous) =>
                previous.filter((item) => item.id !== warehouse.id)
            );

            toast.success("Warehouse deleted successfully");
        } catch (error) {
            console.error("Delete warehouse error:", error);

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Failed to delete warehouse"
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="warehouse-page">

            {/* Header */}
            <div className="warehouse-header warehouse-header-bordered">
                <div className="warehouse-heading">
                    <h2>Warehouse Management</h2>
                    <p>
                        Manage warehouses, storage locations and status
                    </p>
                </div>

                <button
                    type="button"
                    className="warehouse-add-btn"
                    onClick={openAddModal}
                >
                    <FaPlus />
                    Add Warehouse
                </button>
            </div>

            {/* Summary Cards */}
            <div className="warehouse-summary-grid">

                <div className="warehouse-summary-card">
                    <div className="warehouse-summary-icon total">
                        <FaWarehouse />
                    </div>

                    <div className="warehouse-summary-info">
                        <span>Total Warehouses</span>
                        <strong>{totalWarehouses}</strong>
                    </div>
                </div>

                <div className="warehouse-summary-card">
                    <div className="warehouse-summary-icon active">
                        <FaCheckCircle />
                    </div>

                    <div className="warehouse-summary-info">
                        <span>Active Warehouses</span>
                        <strong>{activeWarehouses}</strong>
                    </div>
                </div>

                <div className="warehouse-summary-card">
                    <div className="warehouse-summary-icon inactive">
                        <FaTimesCircle />
                    </div>

                    <div className="warehouse-summary-info">
                        <span>Inactive Warehouses</span>
                        <strong>{inactiveWarehouses}</strong>
                    </div>
                </div>

            </div>

            {/* Warehouse Table */}
            <div className="warehouse-card warehouse-border-box">

                <div className="warehouse-table-toolbar">
                    <div>
                        <h3>All Warehouses</h3>
                        <p>
                            {filteredWarehouses.length} warehouse(s) found
                        </p>
                    </div>

                    <div className="warehouse-filters">
                        <div className="warehouse-search">
                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search warehouses..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>

                        <select
                            className="warehouse-status-filter"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="warehouse-loading">
                        Loading warehouses...
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table warehouse-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Warehouse</th>
                                        <th>Code</th>
                                        <th>Location</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentWarehouses.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="warehouse-empty"
                                            >
                                                <FaWarehouse />
                                                <p>No warehouses found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentWarehouses.map(
                                            (warehouse, index) => (
                                                <tr key={warehouse.id}>
                                                    <td>
                                                        {startIndex + index + 1}
                                                    </td>

                                                    <td>
                                                        <div className="warehouse-name-cell">
                                                            <div className="warehouse-row-icon">
                                                                <FaWarehouse />
                                                            </div>

                                                            <strong>
                                                                {warehouse.name}
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {warehouse.code || "-"}
                                                    </td>

                                                    <td>
                                                        <div className="warehouse-location-cell">
                                                            <FaMapMarkerAlt />

                                                            <span>
                                                                {[
                                                                    warehouse.city,
                                                                    warehouse.state
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(", ") || "-"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {warehouse.phone || "-"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`warehouse-status ${
                                                                warehouse.isActive
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                        >
                                                            {warehouse.isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="warehouse-actions">

                                                            {/* View */}
                                                            <button
                                                                type="button"
                                                                className="warehouse-action view"
                                                                title="View Warehouse"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/warehouses/${warehouse.id}`
                                                                    )
                                                                }
                                                            >
                                                                <FaEye />
                                                            </button>

                                                            {/* Edit */}
                                                            <button
                                                                type="button"
                                                                className="warehouse-action edit"
                                                                title="Edit Warehouse"
                                                                onClick={() =>
                                                                    openEditModal(warehouse)
                                                                }
                                                            >
                                                                <FaEdit />
                                                            </button>

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                className="warehouse-action delete"
                                                                title="Delete Warehouse"
                                                                disabled={
                                                                    deletingId !== null
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(warehouse)
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 0 && (
                            <div className="warehouse-pagination">
                                <Pagination
                                    currentPage={Math.min(
                                        currentPage,
                                        totalPages
                                    )}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add / Edit Warehouse Modal */}
            {showModal && (
                <div
                    className="warehouse-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="warehouse-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="warehouse-modal-title"
                    >
                        {/* Modal Header */}
                        <div className="warehouse-modal-header">
                            <div>
                                <h3 id="warehouse-modal-title">
                                    <FaWarehouse />
                                    {isEditMode
                                        ? "Edit Warehouse"
                                        : "Add Warehouse"}
                                </h3>

                                <p>
                                    {isEditMode
                                        ? "Update warehouse details below"
                                        : "Enter warehouse details below"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="warehouse-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close modal"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="warehouse-modal-body">

                                {/* Basic Information */}
                                <div className="warehouse-form-section">
                                    <h4>Basic Information</h4>

                                    <div className="warehouse-modal-grid">
                                        <div className="warehouse-field">
                                            <label htmlFor="warehouseName">
                                                Warehouse Name *
                                            </label>

                                            <input
                                                id="warehouseName"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter warehouse name"
                                                required
                                            />
                                        </div>

                                        <div className="warehouse-field">
                                            <label htmlFor="warehouseCode">
                                                Warehouse Code
                                            </label>

                                            <input
                                                id="warehouseCode"
                                                name="code"
                                                value={formData.code}
                                                onChange={handleChange}
                                                placeholder="e.g. WH-001"
                                            />
                                        </div>

                                        <div className="warehouse-field full">
                                            <label htmlFor="warehouseDescription">
                                                Description
                                            </label>

                                            <textarea
                                                id="warehouseDescription"
                                                name="description"
                                                rows="2"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Warehouse description"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="warehouse-form-section">
                                    <h4>Address Information</h4>

                                    <div className="warehouse-modal-grid">
                                        <div className="warehouse-field full">
                                            <label htmlFor="warehouseAddress">
                                                Address
                                            </label>

                                            <input
                                                id="warehouseAddress"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Street address"
                                            />
                                        </div>

                                        <div className="warehouse-field">
                                            <label htmlFor="warehouseCity">
                                                City
                                            </label>

                                            <input
                                                id="warehouseCity"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                            />
                                        </div>

                                        <div className="warehouse-field">
                                            <label htmlFor="warehouseState">
                                                State
                                            </label>

                                            <input
                                                id="warehouseState"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                placeholder="State"
                                            />
                                        </div>

                                        <div className="warehouse-field">
                                            <label htmlFor="warehouseCountry">
                                                Country
                                            </label>

                                            <input
                                                id="warehouseCountry"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="Country"
                                            />
                                        </div>

                                        <div className="warehouse-field">
                                            <label htmlFor="warehousePostalCode">
                                                Postal Code
                                            </label>

                                            <input
                                                id="warehousePostalCode"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleChange}
                                                placeholder="Postal code"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="warehouse-form-section">
                                    <h4>Contact Information</h4>

                                    <div className="warehouse-modal-grid">
                                        <div className="warehouse-field">
                                            <label htmlFor="warehousePhone">
                                                Phone
                                            </label>

                                            <input
                                                id="warehousePhone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Phone number"
                                            />
                                        </div>

                                        <div className="warehouse-field">
                                            <label htmlFor="warehouseEmail">
                                                Email
                                            </label>

                                            <input
                                                id="warehouseEmail"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="warehouse-modal-status">
                                    <label htmlFor="warehouseIsActive">
                                        <input
                                            id="warehouseIsActive"
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                        />

                                        Active Warehouse
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="warehouse-modal-footer">
                                <button
                                    type="button"
                                    className="warehouse-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="warehouse-save-btn"
                                    disabled={saving}
                                >
                                    <FaSave />

                                    {saving
                                        ? "Saving..."
                                        : isEditMode
                                            ? "Update Warehouse"
                                            : "Save Warehouse"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WarehouseList;
