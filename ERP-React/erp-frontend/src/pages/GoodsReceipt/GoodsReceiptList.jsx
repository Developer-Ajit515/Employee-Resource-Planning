
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
    getGoodsReceipts,
    deleteGoodsReceipt
} from "../../services/goodsReceiptService";

import GoodsReceiptForm from "./GoodsReceiptForm";
import "./GoodsReceipt.css";

const GoodsReceiptList = () => {
    const navigate = useNavigate();

    const [receipts, setReceipts] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const getId = (r) => r?.id ?? r?.Id;
    const getReceiptNumber = (r) =>
        r?.receiptNumber ?? r?.ReceiptNumber ?? `GR-${getId(r)}`;

    const getPurchaseOrderNumber = (r) =>
        r?.purchaseOrderNumber ??
        r?.PurchaseOrderNumber ??
        r?.purchaseOrder?.poNumber ??
        r?.PurchaseOrder?.PONumber ??
        r?.purchaseOrderId ??
        r?.PurchaseOrderId ??
        "—";

    const getDate = (r) =>
        r?.receivedDate ?? r?.ReceivedDate ??
        r?.receiptDate ?? r?.ReceiptDate;

    const getStatus = (r) =>
        String(r?.status ?? r?.Status ?? "Received");

    const extractArray = (response) => {
        let result = response?.data ?? response;

        for (let i = 0; i < 4 && result && !Array.isArray(result); i++) {
            result =
                result.items ?? result.Items ??
                result.data ?? result.Data ??
                result.results ?? result.Results ??
                result.$values ?? null;
        }

        return Array.isArray(result) ? result : null;
    };

    const loadReceipts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getGoodsReceipts();
            const data = extractArray(response);

            if (!data) {
                throw new Error("Invalid goods receipts API response.");
            }

            setReceipts(data);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.message ||
                "Unable to load goods receipts.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReceipts();
    }, []);

    const filteredReceipts = useMemo(() => {
        const term = search.trim().toLowerCase();

        return receipts.filter((receipt) =>
            [
                getReceiptNumber(receipt),
                getPurchaseOrderNumber(receipt),
                getStatus(receipt)
            ].join(" ").toLowerCase().includes(term)
        );
    }, [receipts, search]);

    const countStatus = (status) =>
        receipts.filter(
            (r) => getStatus(r).toLowerCase() === status.toLowerCase()
        ).length;

    const linkedPurchaseOrders = new Set(
        receipts
            .map((r) => r.purchaseOrderId ?? r.PurchaseOrderId)
            .filter((id) => id != null)
            .map(String)
    ).size;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReceipts.length / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedReceipts = filteredReceipts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

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
        await loadReceipts();
    };

    const handleDelete = async (receipt) => {
        const id = getId(receipt);

        const result = await Swal.fire({
            title: "Delete Goods Receipt?",
            text: `Delete ${getReceiptNumber(receipt)}? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626"
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingId(id);
            await deleteGoodsReceipt(id);
            setReceipts((prev) =>
                prev.filter((r) => String(getId(r)) !== String(id))
            );
            toast.success("Goods receipt deleted successfully.");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to delete goods receipt."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime())
            ? "—"
            : parsed.toLocaleDateString("en-IN");
    };

    return (
        <div className="gr-page">
            {/* Bordered header */}
            <div className="gr-header gr-header-box">
                <div>
                    <span className="gr-eyebrow">INVENTORY MANAGEMENT</span>
                    <h1>Goods Receipts</h1>
                    <p>Manage received goods against purchase orders.</p>
                </div>

                <button
                    type="button"
                    className="gr-primary-btn"
                    onClick={openCreateModal}
                >
                    + Create Goods Receipt
                </button>
            </div>

            {error && (
                <div className="gr-error">
                    {error}
                    <button type="button" onClick={loadReceipts}>Retry</button>
                </div>
            )}

            {/* Summary cards */}
            <div className="gr-stats">
                <div className="gr-stat-card">
                    <div className="gr-stat-icon gr-stat-blue">GR</div>
                    <div>
                        <span>Total Receipts</span>
                        <strong>{receipts.length}</strong>
                        <small>All goods receipts</small>
                    </div>
                </div>

                <div className="gr-stat-card">
                    <div className="gr-stat-icon gr-stat-green">✓</div>
                    <div>
                        <span>Received</span>
                        <strong>{countStatus("Received")}</strong>
                        <small>Successfully received</small>
                    </div>
                </div>

                <div className="gr-stat-card">
                    <div className="gr-stat-icon gr-stat-amber">!</div>
                    <div>
                        <span>Pending</span>
                        <strong>{countStatus("Pending")}</strong>
                        <small>Awaiting receipt</small>
                    </div>
                </div>

                <div className="gr-stat-card">
                    <div className="gr-stat-icon gr-stat-purple">PO</div>
                    <div>
                        <span>Linked Purchase Orders</span>
                        <strong>{linkedPurchaseOrders}</strong>
                        <small>Unique linked orders</small>
                    </div>
                </div>
            </div>

            {/* Receipt register */}
            <div className="gr-card">
                <div className="gr-toolbar">
                    <div>
                        <h2>Receipt Register</h2>
                        <p>Search and manage recorded receipts.</p>
                    </div>

                    <div className="gr-toolbar-actions">
                        <input
                            type="search"
                            className="gr-search"
                            placeholder="Search receipt, PO number, status..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />

                        <button
                            type="button"
                            className="gr-secondary-btn"
                            onClick={loadReceipts}
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="gr-message">Loading goods receipts...</div>
                ) : (
                    <>
                        <div className="gr-table-wrapper">
                            <table className="gr-table">
                                <thead>
                                    <tr>
                                        <th>Receipt No.</th>
                                        <th>Purchase Order</th>
                                        <th>Received Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedReceipts.map((receipt) => {
                                        const id = getId(receipt);
                                        const status = getStatus(receipt);

                                        return (
                                            <tr key={id}>
                                                <td className="gr-number">
                                                    {getReceiptNumber(receipt)}
                                                </td>
                                                <td>{getPurchaseOrderNumber(receipt)}</td>
                                                <td>{formatDate(getDate(receipt))}</td>
                                                <td>
                                                    <span
                                                        className={`gr-status gr-status-${status
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "-")}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="gr-actions">
                                                        <button
                                                            type="button"
                                                            className="gr-view-btn"
                                                            onClick={() =>
                                                                navigate(`/goods-receipts/details/${id}`)
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="gr-edit-btn"
                                                            onClick={() => openEditModal(id)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="gr-delete-btn"
                                                            disabled={String(deletingId) === String(id)}
                                                            onClick={() => handleDelete(receipt)}
                                                        >
                                                            {String(deletingId) === String(id)
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {paginatedReceipts.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="gr-empty">
                                                No goods receipts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="gr-pagination">
                            <span>
                                Showing{" "}
                                {filteredReceipts.length === 0
                                    ? 0
                                    : (currentPage - 1) * pageSize + 1}
                                {" – "}
                                {Math.min(currentPage * pageSize, filteredReceipts.length)}
                                {" of "}
                                {filteredReceipts.length}
                            </span>

                            <div className="gr-pagination-controls">
                                <label htmlFor="grPageSize">Rows:</label>
                                <select
                                    id="grPageSize"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>

                                <button
                                    type="button"
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage(currentPage - 1)}
                                >
                                    Previous
                                </button>

                                <span>Page {currentPage} of {totalPages}</span>

                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setPage(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit modal */}
            {modalOpen && createPortal(
                <div
                    className="gr-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <section
                        className="gr-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gr-modal-title"
                    >
                        <div className="gr-modal-header">
                            <div>
                                <span className="gr-eyebrow">INVENTORY MANAGEMENT</span>
                                <h2 id="gr-modal-title">
                                    {editingId ? "Edit Goods Receipt" : "Create Goods Receipt"}
                                </h2>
                                <p>
                                    {editingId
                                        ? "Update receipt and received item details."
                                        : "Record goods received against a purchase order."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="gr-modal-close"
                                aria-label="Close modal"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="gr-modal-body">
                            <GoodsReceiptForm
                                key={editingId ?? "new-goods-receipt"}
                                modalMode
                                receiptId={editingId}
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

export default GoodsReceiptList;
