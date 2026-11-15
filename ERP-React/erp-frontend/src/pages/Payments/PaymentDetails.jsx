import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PaymentService from "../../services/paymentService";

import "./Payment.css";

const PaymentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayment();
    }, [id]);

    const loadPayment = async () => {
        try {
            setLoading(true);

            const data =
                await PaymentService.getById(id);

            setPayment(data);

        } catch (error) {
            console.error(
                "Payment details error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load payment"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStripePayment = async () => {
    try {
        if (!payment?.invoiceId) {
            toast.error("Invoice not found.");
            return;
        }

        toast.loading("Creating Stripe payment...", {
            id: "stripe-payment",
        });

        const response =
            await PaymentService
                .createStripeCheckoutSession(
                    payment.invoiceId
                );

        toast.dismiss("stripe-payment");

        if (!response?.checkoutUrl) {
            toast.error(
                "Stripe checkout URL not received."
            );
            return;
        }

        window.location.href =
            response.checkoutUrl;
    }
    catch (error) {
        toast.dismiss("stripe-payment");

        console.error(
            "Stripe payment error:",
            error
        );

        toast.error(
            error.response?.data?.message ||
            "Unable to start Stripe payment."
        );
    }
};

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
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

    if (loading) {
        return (
            <div className="payment-page">
                <div className="payment-loading">
                    Loading payment details...
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="payment-page">
                <div className="payment-empty">
                    <h4>Payment Not Found</h4>

                    <button
                        className="payment-back-btn"
                        onClick={() =>
                            navigate("/payments")
                        }
                    >
                        Back to Payments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">

            {/* Header */}
            <div className="payment-header">

                <div>
                    <h2>Payment Details</h2>

                    <p>
                        View complete payment information
                    </p>
                </div>

                <div className="payment-header-actions">

                    <Link
                        to="/payments"
                        className="payment-back-btn"
                    >
                        ← Back
                    </Link>

                    <Link
                        to={`/payments/edit/${payment.paymentId}`}
                        className="payment-edit-btn"
                    >
                        Edit Payment
                    </Link>

                </div>

            </div>

            {/* Main Details */}
            <div className="payment-details-grid">

                {/* Payment Summary */}
                <div className="payment-detail-card">

                    <div className="payment-detail-card-header">
                        <h3>Payment Summary</h3>

                        <span
                            className={getStatusClass(
                                payment.status
                            )}
                        >
                            {payment.status || "Pending"}
                        </span>
                    </div>

                    <div className="payment-detail-body">

                        <div className="payment-detail-row">
                            <span>
                                Payment Number
                            </span>

                            <strong>
                                {payment.paymentNumber || "-"}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Payment Date
                            </span>

                            <strong>
                                {formatDate(
                                    payment.paymentDate
                                )}
                            </strong>
                        </div>

                        <div className="payment-detail-row highlight">
                            <span>
                                Payment Amount
                            </span>

                            <strong>
                                ₹
                                {formatAmount(
                                    payment.amount
                                )}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Payment Method
                            </span>

                            <strong>
                                {payment.paymentMethod || "-"}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Payment Gateway
                            </span>

                            <strong>
                                {payment.paymentGateway ||
                                    "Manual"}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* Invoice Information */}
                <div className="payment-detail-card">

                    <div className="payment-detail-card-header">
                        <h3>Invoice Information</h3>
                    </div>

                    <div className="payment-detail-body">

                        <div className="payment-detail-row">
                            <span>
                                Invoice Number
                            </span>

                            <strong>
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
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Invoice Total
                            </span>

                            <strong>
                                ₹
                                {formatAmount(
                                    payment.invoiceTotal
                                )}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Previously Paid
                            </span>

                            <strong>
                                ₹
                                {formatAmount(
                                    payment.previouslyPaid
                                )}
                            </strong>
                        </div>

                        <div className="payment-detail-row highlight">
                            <span>
                                Remaining Amount
                            </span>

                            <strong>
                                ₹
                                {formatAmount(
                                    payment.remainingAmount
                                )}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* Customer Information */}
                <div className="payment-detail-card">

                    <div className="payment-detail-card-header">
                        <h3>Customer Information</h3>
                    </div>

                    <div className="payment-detail-body">

                        <div className="payment-detail-row">
                            <span>
                                Customer
                            </span>

                            <strong>
                                {payment.customerName || "-"}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Customer ID
                            </span>

                            <strong>
                                {payment.customerId || "-"}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* Gateway Information */}
                <div className="payment-detail-card">

                    <div className="payment-detail-card-header">
                        <h3>Gateway Information</h3>
                    </div>

                    <div className="payment-detail-body">

                        <div className="payment-detail-row">
                            <span>
                                Reference Number
                            </span>

                            <strong>
                                {payment.referenceNumber || "-"}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Transaction ID
                            </span>

                            <strong>
                                {payment.transactionId || "-"}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Gateway Order ID
                            </span>

                            <strong>
                                {payment.gatewayOrderId || "-"}
                            </strong>
                        </div>

                        <div className="payment-detail-row">
                            <span>
                                Gateway Payment ID
                            </span>

                            <strong>
                                {payment.gatewayPaymentId || "-"}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

            {/* Gateway Response */}
            {payment.gatewayResponse && (
                <div className="payment-detail-card payment-full-card">

                    <div className="payment-detail-card-header">
                        <h3>
                            Gateway Response
                        </h3>
                    </div>

                    <div className="payment-gateway-response">
                        {payment.gatewayResponse}
                    </div>

                </div>
            )}

            <button
    type="button"
    className="btn btn-success"
    onClick={handleStripePayment}
>
    Pay with Stripe
</button>

            {/* Notes */}
            {payment.notes && (
                <div className="payment-detail-card payment-full-card">

                    <div className="payment-detail-card-header">
                        <h3>Notes</h3>
                    </div>

                    <div className="payment-notes">
                        {payment.notes}
                    </div>

                </div>
            )}

        </div>
    );
};

export default PaymentDetails;