import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import PaymentService from "../../services/paymentService";
import "./Payment.css";

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);

            const data = await PaymentService.getAll();

            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading payments:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load payments"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Payment?",
            text: "This payment will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            await PaymentService.delete(id);

            toast.success("Payment deleted successfully");

            loadPayments();
        } catch (error) {
            console.error("Delete payment error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete payment"
            );
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            payment.paymentNumber?.toLowerCase().includes(searchText) ||
            payment.invoiceNumber?.toLowerCase().includes(searchText) ||
            payment.customerName?.toLowerCase().includes(searchText) ||
            payment.referenceNumber?.toLowerCase().includes(searchText) ||
            payment.transactionId?.toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === "All" ||
            payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(
        filteredPayments.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedPayments = filteredPayments.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN");
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Completed":
                return "payment-status completed";

            case "Pending":
                return "payment-status pending";

            case "Failed":
                return "payment-status failed";

            case "Refunded":
                return "payment-status refunded";

            case "Cancelled":
                return "payment-status cancelled";

            default:
                return "payment-status";
        }
    };

    return (
        <div className="payment-page">

            {/* Header */}
            <div className="payment-header">
                <div>
                    <h2>Payments</h2>
                    <p>Manage customer invoice payments</p>
                </div>

                <Link
                    to="/payments/create"
                    className="payment-add-btn"
                >
                    + Add Payment
                </Link>
            </div>

            {/* Filters */}
            <div className="payment-filter-card">

                <div className="payment-search-box">
                    <input
                        type="text"
                        placeholder="Search payment, invoice, customer..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="payment-status-filter">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

            </div>

            {/* Table */}
            <div className="payment-card">

                {loading ? (
                    <div className="payment-loading">
                        Loading payments...
                    </div>
                ) : paginatedPayments.length === 0 ? (
                    <div className="payment-empty">
                        <h4>No Payments Found</h4>
                        <p>
                            No payments match your search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="payment-table-wrapper">
                        <table className="payment-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Payment No.</th>
                                    <th>Invoice</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Gateway</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedPayments.map(
                                    (payment, index) => (
                                        <tr key={payment.paymentId}>

                                            <td>
                                                {startIndex + index + 1}
                                            </td>

                                            <td>
                                                <strong>
                                                    {payment.paymentNumber || "-"}
                                                </strong>
                                            </td>

                                            <td>
                                                {payment.invoiceNumber ? (
                                                    <Link
                                                        to={`/invoices/details/${payment.invoiceId}`}
                                                        className="payment-link"
                                                    >
                                                        {payment.invoiceNumber}
                                                    </Link>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                {payment.customerName || "-"}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    payment.paymentDate
                                                )}
                                            </td>

                                            <td className="payment-amount">
                                                ₹
                                                {formatAmount(
                                                    payment.amount
                                                )}
                                            </td>

                                            <td>
                                                {payment.paymentMethod || "-"}
                                            </td>

                                            <td>
                                                {payment.paymentGateway || "Manual"}
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        payment.status
                                                    )}
                                                >
                                                    {payment.status || "Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="payment-actions">

                                                    <Link
                                                        to={`/payments/details/${payment.paymentId}`}
                                                        className="payment-action view"
                                                    >
                                                        View
                                                    </Link>

                                                    <Link
                                                        to={`/payments/edit/${payment.paymentId}`}
                                                        className="payment-action edit"
                                                    >
                                                        Edit
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="payment-action delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                payment.paymentId
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="payment-pagination">

                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((prev) => prev - 1)
                        }
                    >
                        Previous
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                    ).map((page) => (
                        <button
                            key={page}
                            className={
                                currentPage === page
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setCurrentPage(page)
                            }
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage((prev) => prev + 1)
                        }
                    >
                        Next
                    </button>

                </div>
            )}

        </div>
    );
};

export default PaymentList;