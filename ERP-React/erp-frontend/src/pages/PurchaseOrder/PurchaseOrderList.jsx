
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
    getPurchaseOrders,
    deletePurchaseOrder
} from "../../services/purchaseOrderService";

import PurchaseOrderForm from "./PurchaseOrderForm";
import "./PurchaseOrder.css";

const getId = (po) => po?.id ?? po?.Id ?? po?.purchaseOrderId ?? po?.PurchaseOrderId;

const getField = (po, camel, pascal) => po?.[camel] ?? po?.[pascal];

const PurchaseOrderList = () => {
    const navigate = useNavigate();

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [deletingId, setDeletingId] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadPurchaseOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getPurchaseOrders();
            const result = response?.data ?? response;

            // Supports APIs returning either an array or { data: [...] }.
            const data = Array.isArray(result)
                ? result
                : Array.isArray(result?.$values)
                ? result.$values
                : Array.isArray(result?.items)
                ? result.items
                : Array.isArray(result?.data)
                ? result.data
                : null;

            if (!data) {
                throw new Error("Invalid purchase orders response. Check the API response format.");
            }

            setPurchaseOrders(data);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.message ||
                "Failed to load purchase orders.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchaseOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();

        return purchaseOrders.filter((po) => {
            const poNumber = getField(po, "poNumber", "PONumber");
            const supplierName =
                po?.supplier?.name ??
                po?.Supplier?.Name ??
                "";
            const supplierId = getField(po, "supplierId", "SupplierId");
            const status = getField(po, "status", "Status");

            return (
                String(poNumber ?? "").toLowerCase().includes(term) ||
                String(supplierName).toLowerCase().includes(term) ||
                String(supplierId ?? "").toLowerCase().includes(term) ||
                String(status ?? "").toLowerCase().includes(term)
            );
        });
    }, [purchaseOrders, search]);

    const getStatus = (po) =>
        String(getField(po, "status", "Status") ?? "Pending").toLowerCase();

    const totalOrders = purchaseOrders.length;
    const pendingOrders = purchaseOrders.filter(
        (po) => getStatus(po) === "pending"
    ).length;
    const approvedOrders = purchaseOrders.filter((po) =>
        ["approved", "ordered", "partiallyreceived"].includes(getStatus(po))
    ).length;

    const totalOrderValue = purchaseOrders.reduce(
        (sum, po) =>
            sum + Number(getField(po, "grandTotal", "GrandTotal") ?? 0),
        0
    );

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedOrders = filteredOrders.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const formatDate = (date) => {
        if (!date) return "-";
        const parsed = new Date(date);

        return Number.isNaN(parsed.getTime())
            ? "-"
            : parsed.toLocaleDateString("en-IN");
    };

    const formatCurrency = (amount) =>
        Number(amount ?? 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });

    const openCreateModal = () => {
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
        await loadPurchaseOrders();
    };

    const handleDelete = async (id, poNumber) => {
        const result = await Swal.fire({
            title: "Delete purchase order?",
            text: `Are you sure you want to delete ${poNumber || `PO #${id}`}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingId(id);
            await deletePurchaseOrder(id);

            setPurchaseOrders((previous) =>
                previous.filter((po) => String(getId(po)) !== String(id))
            );

            toast.success("Purchase order deleted successfully.");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to delete purchase order."
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <div className="po-loading">Loading purchase orders...</div>;
    }

    return (
        <div className="po-page">
            {/* Bordered header */}
            <div className="po-header po-header-box">
                <div>
                    <span className="po-eyebrow">PROCUREMENT MANAGEMENT</span>
                    <h2>Purchase Orders</h2>
                    <p>Manage suppliers, order status and purchase values.</p>
                </div>

                <button
                    type="button"
                    className="po-btn po-btn-primary"
                    onClick={openCreateModal}
                >
                    + Create Purchase Order
                </button>
            </div>

            {error && (
                <div className="po-error">
                    {error}
                    <button type="button" onClick={loadPurchaseOrders}>
                        Retry
                    </button>
                </div>
            )}

            {/* Summary cards */}
            <div className="po-stats-grid">
                <div className="po-stat-card">
                    <div className="po-stat-icon po-stat-blue">PO</div>
                    <div>
                        <p>Total Orders</p>
                        <h3>{totalOrders}</h3>
                        <span>All purchase orders</span>
                    </div>
                </div>

                <div className="po-stat-card">
                    <div className="po-stat-icon po-stat-amber">!</div>
                    <div>
                        <p>Pending Orders</p>
                        <h3>{pendingOrders}</h3>
                        <span>Awaiting processing</span>
                    </div>
                </div>

                <div className="po-stat-card">
                    <div className="po-stat-icon po-stat-green">✓</div>
                    <div>
                        <p>Approved / Ordered</p>
                        <h3>{approvedOrders}</h3>
                        <span>In procurement process</span>
                    </div>
                </div>

                <div className="po-stat-card">
                    <div className="po-stat-icon po-stat-purple">₹</div>
                    <div>
                        <p>Total Order Value</p>
                        <h3 className="po-stat-currency">
                            {formatCurrency(totalOrderValue)}
                        </h3>
                        <span>Across all purchase orders</span>
                    </div>
                </div>
            </div>

            {/* Search toolbar */}
            <div className="po-toolbar po-toolbar-box">
                <div className="po-search-wrap">
                    <span aria-hidden="true">⌕</span>
                    <input
                        type="text"
                        placeholder="Search PO number, supplier, ID or status..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="po-search"
                    />
                </div>

                <button
                    type="button"
                    className="po-btn po-btn-secondary"
                    onClick={loadPurchaseOrders}
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Orders table */}
            <div className="po-table-wrapper">
                <table className="po-table">
                    <thead>
                        <tr>
                            <th>PO Number</th>
                            <th>PO Date</th>
                            <th>Supplier</th>
                            <th>Expected Delivery</th>
                            <th>Status</th>
                            <th>Grand Total</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="po-empty">
                                    No purchase orders found.
                                </td>
                            </tr>
                        ) : (
                            paginatedOrders.map((po) => {
                                const id = getId(po);
                                const poNumber = getField(po, "poNumber", "PONumber");
                                const poDate = getField(po, "poDate", "PODate");
                                const expectedDate = getField(
                                    po,
                                    "expectedDeliveryDate",
                                    "ExpectedDeliveryDate"
                                );
                                const supplierId = getField(po, "supplierId", "SupplierId");
                                const supplierName =
                                    po?.supplier?.name ??
                                    po?.Supplier?.Name ??
                                    (supplierId ? `Supplier #${supplierId}` : "-");
                                const status = getField(po, "status", "Status") ?? "Pending";
                                const grandTotal = getField(po, "grandTotal", "GrandTotal");
                                const isActive = getField(po, "isActive", "IsActive");

                                return (
                                    <tr key={id}>
                                        <td className="po-number">{poNumber || "-"}</td>
                                        <td>{formatDate(poDate)}</td>
                                        <td>{supplierName}</td>
                                        <td>{formatDate(expectedDate)}</td>
                                        <td>
                                            <span
                                                className={`po-status po-status-${String(status)
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "")}`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td>{formatCurrency(grandTotal)}</td>
                                        <td>
                                            <span className={isActive ? "po-active" : "po-inactive"}>
                                                {isActive ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="po-actions">
                                                <button
                                                    type="button"
                                                    className="po-action-view"
                                                    onClick={() =>
                                                        navigate(`/purchase-orders/details/${id}`)
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    className="po-action-edit"
                                                    onClick={() => openEditModal(id)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="po-action-delete"
                                                    disabled={String(deletingId) === String(id)}
                                                    onClick={() => handleDelete(id, poNumber)}
                                                >
                                                    {String(deletingId) === String(id)
                                                        ? "Deleting..."
                                                        : "Delete"}
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

            {/* Pagination */}
            <div className="po-pagination">
                <div className="po-pagination-info">
                    Showing{" "}
                    {filteredOrders.length === 0
                        ? 0
                        : (safePage - 1) * pageSize + 1}
                    {" - "}
                    {Math.min(safePage * pageSize, filteredOrders.length)}
                    {" of "}
                    {filteredOrders.length} purchase orders
                </div>

                <div className="po-pagination-controls">
                    <label htmlFor="poPageSize">Rows:</label>
                    <select
                        id="poPageSize"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>

                    <button
                        type="button"
                        className="po-page-btn"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>

                    <span className="po-page-number">
                        Page {safePage} of {totalPages}
                    </span>

                    <button
                        type="button"
                        className="po-page-btn"
                        disabled={safePage >= totalPages}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Add/Edit modal */}
            {modalOpen &&
                createPortal(
                    <div
                        className="po-modal-backdrop"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) closeModal();
                        }}
                    >
                        <section
                            className="po-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="po-modal-title"
                        >
                            <div className="po-modal-header">
                                <div>
                                    <span className="po-eyebrow">
                                        PROCUREMENT MANAGEMENT
                                    </span>
                                    <h2 id="po-modal-title">
                                        {editingId
                                            ? "Edit Purchase Order"
                                            : "Create Purchase Order"}
                                    </h2>
                                    <p>
                                        {editingId
                                            ? "Update the order information below."
                                            : "Enter the details to create a new order."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="po-modal-close"
                                    aria-label="Close modal"
                                    onClick={closeModal}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="po-modal-body">
                                <PurchaseOrderForm
                                    key={editingId ?? "new-purchase-order"}
                                    modalMode
                                    purchaseOrderId={editingId}
                                    onSaved={handleSaved}
                                    onCancel={closeModal}
                                />
                            </div>
                        </section>
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default PurchaseOrderList;
