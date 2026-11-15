
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

import {
    getSuppliers,
    deleteSupplier
} from "../../services/supplierService";

import SupplierForm from "./SupplierForm";
import "./Supplier.css";

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadSuppliers = async () => {
        try {
            setLoading(true);

            const response = await getSuppliers();
            const body = response?.data ?? response;

            const list = Array.isArray(body)
                ? body
                : body?.$values ?? body?.items ?? body?.data ?? [];

            setSuppliers(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Load suppliers error:", error);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const getId = (supplier) =>
        supplier.id ??
        supplier.Id ??
        supplier.supplierId ??
        supplier.SupplierId;

    const getValue = (supplier, ...keys) => {
        for (const key of keys) {
            if (supplier[key] !== undefined && supplier[key] !== null) {
                return supplier[key];
            }
        }
        return "";
    };

    const isSupplierActive = (supplier) =>
        (getValue(supplier, "isActive", "IsActive") ?? false) === true;

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
        await loadSuppliers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this supplier?")) {
            return;
        }

        try {
            await deleteSupplier(id);
            await loadSuppliers();
        } catch (error) {
            console.error("Delete supplier error:", error);
            window.alert(
                error.response?.data?.message ||
                "Unable to delete supplier."
            );
        }
    };

    const activeCount = suppliers.filter(isSupplierActive).length;
    const inactiveCount = suppliers.length - activeCount;

    const uniqueCities = new Set(
        suppliers
            .map((supplier) =>
                String(getValue(supplier, "city", "City")).trim().toLowerCase()
            )
            .filter(Boolean)
    ).size;

    const filteredSuppliers = suppliers.filter((supplier) => {
        const query = search.trim().toLowerCase();

        return [
            getValue(supplier, "companyName", "CompanyName"),
            getValue(supplier, "supplierCode", "SupplierCode"),
            getValue(supplier, "contactPerson", "ContactPerson"),
            getValue(supplier, "city", "City")
        ].some((value) =>
            String(value).toLowerCase().includes(query)
        );
    });

    return (
        <div className="supplier-page">

            {/* Header */}
            <div className="supplier-header-box">
                <div className="supplier-header-content">
                    <div className="supplier-title-icon">S</div>
                    <div>
                        <h2>Supplier Management</h2>
                        <p>
                            Manage suppliers, vendors and their business details.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="supplier-add-btn"
                    onClick={openAddModal}
                >
                    <span>＋</span> Add Supplier
                </button>
            </div>

            {/* Summary cards */}
            <div className="supplier-stats-grid">

                <div className="supplier-stat-card">
                    <div className="supplier-stat-icon total">S</div>
                    <div>
                        <p>Total Suppliers</p>
                        <h3>{suppliers.length}</h3>
                        <span>All registered vendors</span>
                    </div>
                </div>

                <div className="supplier-stat-card">
                    <div className="supplier-stat-icon active-icon">✓</div>
                    <div>
                        <p>Active Suppliers</p>
                        <h3>{activeCount}</h3>
                        <span>Currently active</span>
                    </div>
                </div>

                <div className="supplier-stat-card">
                    <div className="supplier-stat-icon inactive-icon">–</div>
                    <div>
                        <p>Inactive Suppliers</p>
                        <h3>{inactiveCount}</h3>
                        <span>Currently inactive</span>
                    </div>
                </div>

                <div className="supplier-stat-card">
                    <div className="supplier-stat-icon city-icon">⌖</div>
                    <div>
                        <p>Supplier Cities</p>
                        <h3>{uniqueCities}</h3>
                        <span>Unique city locations</span>
                    </div>
                </div>

            </div>

            {/* Search toolbar */}
            <div className="supplier-toolbar">
                <div className="supplier-search-box">
                    <span>⌕</span>
                    <input
                        type="search"
                        placeholder="Search company, code, contact or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <span className="supplier-count">
                    Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                </span>
            </div>

            {/* Supplier table */}
            {loading ? (
                <div className="supplier-loading">
                    Loading suppliers...
                </div>
            ) : (
                <div className="supplier-table-wrapper">
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>Supplier Code</th>
                                <th>Company</th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-row">
                                        No suppliers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier) => {
                                    const id = getId(supplier);
                                    const active = isSupplierActive(supplier);

                                    return (
                                        <tr key={id}>
                                            <td>
                                                <span className="supplier-code">
                                                    {getValue(
                                                        supplier,
                                                        "supplierCode",
                                                        "SupplierCode"
                                                    ) || "-"}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {getValue(
                                                        supplier,
                                                        "companyName",
                                                        "CompanyName"
                                                    ) || "-"}
                                                </strong>
                                            </td>

                                            <td>
                                                {getValue(
                                                    supplier,
                                                    "contactPerson",
                                                    "ContactPerson"
                                                ) || "-"}
                                            </td>

                                            <td>
                                                {getValue(
                                                    supplier,
                                                    "phone",
                                                    "Phone"
                                                ) || "-"}
                                            </td>

                                            <td>
                                                {getValue(
                                                    supplier,
                                                    "email",
                                                    "Email"
                                                ) || "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`supplier-status ${
                                                        active ? "active" : "inactive"
                                                    }`}
                                                >
                                                    {active ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="supplier-actions">

                                                    {/* View details page */}
                                                    <Link
                                                        to={`/suppliers/${id}`}
                                                        className="view-action"
                                                    >
                                                        View
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="edit-action"
                                                        onClick={() => openEditModal(id)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-action"
                                                        onClick={() => handleDelete(id)}
                                                    >
                                                        Delete
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
            )}

            {/* Add/Edit modal */}
            {modalOpen && createPortal(
                <div
                    className="supplier-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <section
                        className="supplier-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="supplier-modal-title"
                    >
                        <button
                            type="button"
                            className="supplier-modal-close"
                            onClick={closeModal}
                            aria-label="Close modal"
                        >
                            ×
                        </button>

                        <SupplierForm
                            key={editingId ?? "new-supplier"}
                            modalMode
                            supplierId={editingId}
                            onSaved={handleSaved}
                            onCancel={closeModal}
                        />
                    </section>
                </div>,
                document.body
            )}

        </div>
    );
};

export default SupplierList;
