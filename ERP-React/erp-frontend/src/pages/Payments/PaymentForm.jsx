import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PaymentService from "../../services/paymentService";
import CustomerService from "../../services/customerService";
import InvoiceService from "../../services/invoiceService";

import "./Payment.css";

const PaymentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [formData, setFormData] = useState({
        invoiceId: "",
        customerId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
        paymentMethod: "Cash",
        paymentGateway: "Manual",
        referenceNumber: "",
        transactionId: "",
        gatewayOrderId: "",
        gatewayPaymentId: "",
        gatewayResponse: "",
        status: "Completed",
        notes: "",
    });

    useEffect(() => {
        loadDropdownData();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            loadPayment();
        }
    }, [id]);

   const loadDropdownData = async () => {
    try {
        setLoadingData(true);

        const [customerData, invoiceData] =
            await Promise.all([
                CustomerService.getAll(),
                InvoiceService.getAll(),
            ]);

        console.log("Customers:", customerData);
        console.log("Invoices:", invoiceData);

        setCustomers(
            Array.isArray(customerData)
                ? customerData
                : []
        );

        setInvoices(
            Array.isArray(invoiceData)
                ? invoiceData
                : []
        );

    } catch (error) {
        console.error(
            "Dropdown loading error:",
            error
        );

        console.error(
            "Response:",
            error.response?.data
        );

        toast.error(
            error.response?.data?.message ||
            "Failed to load customers or invoices"
        );
    } finally {
        setLoadingData(false);
    }
};

    const loadPayment = async () => {
        try {
            setLoading(true);

            const data =
                await PaymentService.getById(id);

            setFormData({
                invoiceId: data.invoiceId || "",
                customerId: data.customerId || "",
                paymentDate: data.paymentDate
                    ? data.paymentDate.split("T")[0]
                    : "",
                amount: data.amount || "",
                paymentMethod:
                    data.paymentMethod || "Cash",
                paymentGateway:
                    data.paymentGateway || "Manual",
                referenceNumber:
                    data.referenceNumber || "",
                transactionId:
                    data.transactionId || "",
                gatewayOrderId:
                    data.gatewayOrderId || "",
                gatewayPaymentId:
                    data.gatewayPaymentId || "",
                gatewayResponse:
                    data.gatewayResponse || "",
                status:
                    data.status || "Completed",
                notes:
                    data.notes || "",
            });

        } catch (error) {
            console.error(
                "Payment loading error:",
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Automatically select customer when invoice changes
        if (name === "invoiceId") {
            const selectedInvoice =
                invoices.find(
                    (invoice) =>
                        Number(invoice.invoiceId) ===
                        Number(value)
                );

            if (selectedInvoice) {
                setFormData((prev) => ({
                    ...prev,
                    invoiceId: value,
                    customerId:
                        selectedInvoice.customerId || "",
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.invoiceId) {
            toast.error("Please select an invoice");
            return;
        }

        if (!formData.customerId) {
            toast.error("Please select a customer");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            toast.error(
                "Payment amount must be greater than zero"
            );
            return;
        }

        try {
            setLoading(true);

            const payload = {
                invoiceId: Number(formData.invoiceId),
                customerId: Number(formData.customerId),
                paymentDate: formData.paymentDate,
                amount: Number(formData.amount),
                paymentMethod: formData.paymentMethod,
                paymentGateway: formData.paymentGateway,
                referenceNumber:
                    formData.referenceNumber || null,
                transactionId:
                    formData.transactionId || null,
                gatewayOrderId:
                    formData.gatewayOrderId || null,
                gatewayPaymentId:
                    formData.gatewayPaymentId || null,
                gatewayResponse:
                    formData.gatewayResponse || null,
                status: formData.status,
                notes: formData.notes || null,
            };

            if (isEditMode) {
                await PaymentService.update(
                    id,
                    payload
                );

                toast.success(
                    "Payment updated successfully"
                );
            } else {
                await PaymentService.create(
                    payload
                );

                toast.success(
                    "Payment created successfully"
                );
            }

            navigate("/payments");

        } catch (error) {
            console.error(
                "Payment save error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to save payment"
            );
        } finally {
            setLoading(false);
        }
    };

    const selectedInvoice = invoices.find(
        (invoice) =>
            Number(invoice.invoiceId) ===
            Number(formData.invoiceId)
    );

    const invoiceTotal =
        selectedInvoice?.totalAmount || 0;

    return (
        <div className="payment-page">

            <div className="payment-header">
                <div>
                    <h2>
                        {isEditMode
                            ? "Edit Payment"
                            : "Create Payment"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Update payment information"
                            : "Record a new customer payment"}
                    </p>
                </div>
            </div>

            <div className="payment-form-card">

                {loadingData ? (
                    <div className="payment-loading">
                        Loading customers and invoices...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>

                        {/* Invoice Information */}
                        <div className="payment-section-title">
                            Invoice Information
                        </div>

                        <div className="payment-form-grid">

                            <div className="payment-form-group">
                                <label>
                                    Invoice
                                    <span>*</span>
                                </label>

                                <select
                                    name="invoiceId"
                                    value={formData.invoiceId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Invoice
                                    </option>

                                    {invoices.map((invoice) => (
    <option
        key={invoice.invoiceId}
        value={invoice.invoiceId}
    >
        {invoice.invoiceNumber} - ₹
        {Number(invoice.totalAmount || 0).toLocaleString("en-IN")}
    </option>
))}
                                </select>
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Customer
                                    <span>*</span>
                                </label>

                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Customer
                                    </option>

                                    {customers.map(
                                        (customer) => (
                                            <option
                                                key={
                                                    customer.id
                                                }
                                                value={
                                                    customer.id
                                                }
                                            >
                                                {
                                                    customer.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                        </div>

                        {/* Invoice Summary */}
                        {selectedInvoice && (
                            <div className="payment-invoice-summary">

                                <div>
                                    <span>
                                        Invoice Total
                                    </span>

                                    <strong>
                                        ₹
                                        {Number(
                                            invoiceTotal
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Invoice Status
                                    </span>

                                    <strong>
                                        {
                                            selectedInvoice.status ||
                                            "Pending"
                                        }
                                    </strong>
                                </div>

                            </div>
                        )}

                        {/* Payment Information */}
                        <div className="payment-section-title">
                            Payment Information
                        </div>

                        <div className="payment-form-grid">

                            <div className="payment-form-group">
                                <label>
                                    Payment Date
                                    <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    name="paymentDate"
                                    value={
                                        formData.paymentDate
                                    }
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Amount
                                    <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    value={
                                        formData.amount
                                    }
                                    onChange={handleChange}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Payment Method
                                </label>

                                <select
                                    name="paymentMethod"
                                    value={
                                        formData.paymentMethod
                                    }
                                    onChange={handleChange}
                                >
                                    <option value="Cash">
                                        Cash
                                    </option>

                                    <option value="Bank Transfer">
                                        Bank Transfer
                                    </option>

                                    <option value="Cheque">
                                        Cheque
                                    </option>

                                    <option value="Card">
                                        Card
                                    </option>

                                    <option value="UPI">
                                        UPI
                                    </option>

                                    <option value="Online">
                                        Online
                                    </option>
                                </select>
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={handleChange}
                                >
                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Failed">
                                        Failed
                                    </option>

                                    <option value="Refunded">
                                        Refunded
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                        </div>

                        {/* Gateway Information */}
                        <div className="payment-section-title">
                            Payment Gateway Information
                        </div>

                        <div className="payment-form-grid">

                            <div className="payment-form-group">
                                <label>
                                    Payment Gateway
                                </label>

                                <select
                                    name="paymentGateway"
                                    value={
                                        formData.paymentGateway
                                    }
                                    onChange={handleChange}
                                >
                                    <option value="Manual">
                                        Manual
                                    </option>

                                    <option value="Stripe">
                                        Stripe
                                    </option>

                                    <option value="Razorpay">
                                        Razorpay
                                    </option>

                                    <option value="PayPal">
                                        PayPal
                                    </option>
                                </select>
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Reference Number
                                </label>

                                <input
                                    type="text"
                                    name="referenceNumber"
                                    value={
                                        formData.referenceNumber
                                    }
                                    onChange={handleChange}
                                    placeholder="Reference number"
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Transaction ID
                                </label>

                                <input
                                    type="text"
                                    name="transactionId"
                                    value={
                                        formData.transactionId
                                    }
                                    onChange={handleChange}
                                    placeholder="Transaction ID"
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Gateway Order ID
                                </label>

                                <input
                                    type="text"
                                    name="gatewayOrderId"
                                    value={
                                        formData.gatewayOrderId
                                    }
                                    onChange={handleChange}
                                    placeholder="Gateway Order ID"
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Gateway Payment ID
                                </label>

                                <input
                                    type="text"
                                    name="gatewayPaymentId"
                                    value={
                                        formData.gatewayPaymentId
                                    }
                                    onChange={handleChange}
                                    placeholder="Gateway Payment ID"
                                />
                            </div>

                        </div>

                        <div className="payment-form-group full-width">
                            <label>
                                Gateway Response
                            </label>

                            <textarea
                                name="gatewayResponse"
                                value={
                                    formData.gatewayResponse
                                }
                                onChange={handleChange}
                                rows="3"
                                placeholder="Gateway response / JSON response"
                            />
                        </div>

                        {/* Notes */}
                        <div className="payment-section-title">
                            Additional Information
                        </div>

                        <div className="payment-form-group full-width">
                            <label>
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter payment notes..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="payment-form-actions">

                            <button
                                type="button"
                                className="payment-cancel-btn"
                                onClick={() =>
                                    navigate("/payments")
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="payment-save-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : isEditMode
                                        ? "Update Payment"
                                        : "Save Payment"}
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </div>
    );
};

export default PaymentForm;