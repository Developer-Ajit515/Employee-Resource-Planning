import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import InvoiceService from "../../services/invoiceService";
import InvoiceForm from "./InvoiceForm";

import "./Invoice.css";

const currency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);

    const loadInvoices = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const data = await InvoiceService.getAll();
            setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Load invoices error:", error);
            toast.error(error.response?.data?.message || "Failed to load invoices");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const openCreateModal = () => {
        setEditingInvoiceId(null);
        setModalOpen(true);
    };

    const openEditModal = (id) => {
        setEditingInvoiceId(id);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingInvoiceId(null);
    };

    const handleSaved = async () => {
        closeModal();
        await loadInvoices(false);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete invoice?",
            text: "This invoice will be deactivated.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await InvoiceService.delete(id);
            toast.success("Invoice deleted successfully");
            await loadInvoices(false);
        } catch (error) {
            console.error("Delete invoice error:", error);
            toast.error(error.response?.data?.message || "Failed to delete invoice");
        }
    };

    const filteredInvoices = useMemo(() => {
        const value = search.trim().toLowerCase();
        if (!value) return invoices;

        return invoices.filter((invoice) =>
            [invoice.invoiceNumber, invoice.customerName, invoice.status]
                .some((field) => String(field || "").toLowerCase().includes(value))
        );
    }, [invoices, search]);

    const stats = useMemo(() => {
        const paid = invoices.filter((x) => x.status?.toLowerCase() === "paid");
        const pending = invoices.filter((x) => x.status?.toLowerCase() === "pending");
        const overdue = invoices.filter((x) => x.status?.toLowerCase() === "overdue");
        const totalValue = invoices.reduce((sum, x) => sum + Number(x.totalAmount || 0), 0);
        const paidValue = paid.reduce((sum, x) => sum + Number(x.totalAmount || 0), 0);
        const pendingValue = pending.reduce((sum, x) => sum + Number(x.totalAmount || 0), 0);

        return {
            total: invoices.length,
            paid: paid.length,
            pending: pending.length,
            overdue: overdue.length,
            totalValue,
            paidValue,
            pendingValue,
        };
    }, [invoices]);

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "paid": return "status-paid";
            case "pending": return "status-pending";
            case "overdue": return "status-overdue";
            case "cancelled": return "status-cancelled";
            default: return "status-default";
        }
    };

    return (
        <div className="invoice-page">
            <section className="invoice-page-heading">
                <div className="invoice-heading-icon" aria-hidden="true">▤</div>
                <div className="invoice-heading-copy">
                    <p className="invoice-eyebrow">FINANCE / SALES</p>
                    <h2>Invoice Management</h2>
                    <p>Manage, track, and maintain customer invoices in one place.</p>
                </div>
                <button type="button" className="invoice-add-btn" onClick={openCreateModal}>
                    <span className="invoice-btn-plus" aria-hidden="true">＋</span>
                    Create Invoice
                </button>
            </section>

            <section className="invoice-stats-grid" aria-label="Invoice summary">
                <article className="invoice-stat-card invoice-stat-total">
                    <div className="invoice-stat-top">
                        <span className="invoice-stat-icon">▤</span>
                        <span className="invoice-stat-caption">All invoices</span>
                    </div>
                    <strong className="invoice-stat-number">{stats.total}</strong>
                    <span className="invoice-stat-foot">Total records</span>
                </article>
                <article className="invoice-stat-card invoice-stat-paid">
                    <div className="invoice-stat-top">
                        <span className="invoice-stat-icon">✓</span>
                        <span className="invoice-stat-caption">Paid invoices</span>
                    </div>
                    <strong className="invoice-stat-number">{stats.paid}</strong>
                    <span className="invoice-stat-foot">{currency(stats.paidValue)} collected</span>
                </article>
                <article className="invoice-stat-card invoice-stat-pending">
                    <div className="invoice-stat-top">
                        <span className="invoice-stat-icon">◷</span>
                        <span className="invoice-stat-caption">Pending invoices</span>
                    </div>
                    <strong className="invoice-stat-number">{stats.pending}</strong>
                    <span className="invoice-stat-foot">{currency(stats.pendingValue)} awaiting payment</span>
                </article>
                <article className="invoice-stat-card invoice-stat-overdue">
                    <div className="invoice-stat-top">
                        <span className="invoice-stat-icon">!</span>
                        <span className="invoice-stat-caption">Overdue invoices</span>
                    </div>
                    <strong className="invoice-stat-number">{stats.overdue}</strong>
                    <span className="invoice-stat-foot">Needs follow-up</span>
                </article>
                <article className="invoice-stat-card invoice-stat-value">
                    <div className="invoice-stat-top">
                        <span className="invoice-stat-icon">₹</span>
                        <span className="invoice-stat-caption">Invoice value</span>
                    </div>
                    <strong className="invoice-stat-number invoice-stat-currency">{currency(stats.totalValue)}</strong>
                    <span className="invoice-stat-foot">Combined invoice total</span>
                </article>
            </section>

            <section className="invoice-card">
                <div className="invoice-list-toolbar">
                    <div>
                        <h3>All Invoices</h3>
                        <p>Showing {filteredInvoices.length} of {invoices.length} invoices</p>
                    </div>
                    <label className="invoice-search-wrap">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            placeholder="Search invoice, customer or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="invoice-search"
                            aria-label="Search invoices"
                        />
                    </label>
                </div>

                {loading ? (
                    <div className="invoice-loading">
                        <span className="invoice-loading-spinner" />
                        Loading invoices...
                    </div>
                ) : (
                    <div className="invoice-table-wrapper">
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Customer</th>
                                    <th>Invoice Date</th>
                                    <th>Due Date</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="invoice-empty">
                                            <span className="invoice-empty-icon">▤</span>
                                            <strong>No invoices found</strong>
                                            <span>Try another search or create a new invoice.</span>
                                        </td>
                                    </tr>
                                ) : filteredInvoices.map((invoice) => (
                                    <tr key={invoice.invoiceId}>
                                        <td>
                                            <span className="invoice-number">{invoice.invoiceNumber || `INV-${invoice.invoiceId}`}</span>
                                        </td>
                                        <td>
                                            <span className="invoice-customer-name">{invoice.customerName || "-"}</span>
                                        </td>
                                        <td>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN") : "-"}</td>
                                        <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "-"}</td>
                                        <td className="invoice-amount">{currency(invoice.totalAmount)}</td>
                                        <td>
                                            <span className={`invoice-status ${getStatusClass(invoice.status)}`}>
                                                {invoice.status || "Unknown"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="invoice-actions">
                                                <Link to={`/invoices/${invoice.invoiceId}`} className="action-view" title="View invoice">View</Link>
                                                <button type="button" className="action-edit" onClick={() => openEditModal(invoice.invoiceId)}>Edit</button>
                                                <button type="button" className="action-delete" onClick={() => handleDelete(invoice.invoiceId)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {modalOpen &&
    createPortal(
        <div
            className="invoice-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal();
                }
            }}
        >
            <section
                className="invoice-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="invoice-modal-title"
            >
                <button
                    type="button"
                    className="invoice-modal-close"
                    onClick={closeModal}
                    aria-label="Close invoice form"
                >
                    ×
                </button>

                <InvoiceForm
                    key={editingInvoiceId || "new-invoice"}
                    modalMode
                    invoiceId={editingInvoiceId}
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

export default InvoiceList;
