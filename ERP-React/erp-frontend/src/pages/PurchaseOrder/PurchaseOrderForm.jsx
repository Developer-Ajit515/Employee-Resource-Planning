
// PurchaseOrderForm.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder
} from "../../services/purchaseOrderService";
import "./PurchaseOrder.css";
import { toast } from "react-toastify";

const getInitialForm = () => ({
    poNumber: "",
    poDate: new Date().toISOString().slice(0, 10),
    expectedDeliveryDate: "",
    supplierId: "",
    status: "Pending",
    subTotal: "0",
    discountAmount: "0",
    taxAmount: "0",
    shippingAmount: "0",
    otherCharges: "0",
    grandTotal: "0",
    paymentTerms: "",
    deliveryAddress: "",
    notes: "",
    termsAndConditions: "",
    isActive: true
});


const PurchaseOrderForm = ({
    modalMode = false,
    purchaseOrderId = null,
    onSaved,
    onCancel
}) => {
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    const id = purchaseOrderId ?? routeId;
    const isEdit = id !== null && id !== undefined && id !== "";

    // Keep the rest of your existing state declarations below.


    const [form, setForm] = useState(getInitialForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) return;

        const loadPurchaseOrder = async () => {
            try {
                setLoading(true);

                const response = await getPurchaseOrderById(id);
                const po = response?.data ?? response;

                setForm({
                    ...getInitialForm(),
                    ...po,
                    poDate: po.poDate
                        ? String(po.poDate).slice(0, 10)
                        : "",
                    expectedDeliveryDate: po.expectedDeliveryDate
                        ? String(po.expectedDeliveryDate).slice(0, 10)
                        : "",
                    supplierId: po.supplierId ?? "",
                    subTotal: po.subTotal ?? 0,
                    discountAmount: po.discountAmount ?? 0,
                    taxAmount: po.taxAmount ?? 0,
                    shippingAmount: po.shippingAmount ?? 0,
                    otherCharges: po.otherCharges ?? 0,
                    grandTotal: po.grandTotal ?? 0,
                    paymentTerms: po.paymentTerms ?? "",
                    deliveryAddress: po.deliveryAddress ?? "",
                    notes: po.notes ?? "",
                    termsAndConditions: po.termsAndConditions ?? "",
                    isActive: po.isActive ?? true
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load purchase order."
                );
            } finally {
                setLoading(false);
            }
        };

        loadPurchaseOrder();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.poNumber.trim()) {
            setError("Purchase order number is required.");
            return;
        }

        if (!form.supplierId || Number(form.supplierId) <= 0) {
            setError("Enter a valid supplier ID.");
            return;
        }

        if (!form.poDate) {
            setError("Purchase order date is required.");
            return;
        }

        if (
            form.expectedDeliveryDate &&
            form.expectedDeliveryDate < form.poDate
        ) {
            setError(
                "Expected delivery date cannot be earlier than the PO date."
            );
            return;
        }

        const numericFields = [
            "subTotal",
            "discountAmount",
            "taxAmount",
            "shippingAmount",
            "otherCharges",
            "grandTotal"
        ];

        for (const field of numericFields) {
            if (
                form[field] === "" ||
                !Number.isFinite(Number(form[field])) ||
                Number(form[field]) < 0
            ) {
                setError(`${field} must be a valid non-negative amount.`);
                return;
            }
        }

        const payload = {
            poNumber: form.poNumber.trim(),
            poDate: form.poDate,
            expectedDeliveryDate: form.expectedDeliveryDate || null,
            supplierId: Number(form.supplierId),
            status: form.status,
            subTotal: Number(form.subTotal),
            discountAmount: Number(form.discountAmount),
            taxAmount: Number(form.taxAmount),
            shippingAmount: Number(form.shippingAmount),
            otherCharges: Number(form.otherCharges),
            grandTotal: Number(form.grandTotal),
            paymentTerms: form.paymentTerms.trim() || null,
            deliveryAddress: form.deliveryAddress.trim() || null,
            notes: form.notes.trim() || null,
            termsAndConditions: form.termsAndConditions.trim() || null,
            isActive: form.isActive
        };

       
try {
    setSaving(true);

    if (isEdit) {
        await updatePurchaseOrder(id, payload);
        toast.success("Purchase order updated successfully.");
    } else {
        await createPurchaseOrder(payload);
        toast.success("Purchase order created successfully.");
    }

    if (modalMode) {
        await onSaved?.();
    } else {
        navigate("/purchase-orders");
    }
} catch (err) {
    setError(
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to save purchase order. Check the entered details."
    );
} finally {
    setSaving(false);
}

    };

    if (loading) {
        return <div className="po-loading">Loading purchase order...</div>;
    }

    return (
        <div className="po-page">
            
{!modalMode && (
    <div className="po-header po-header-box">
        <div>
            <h2>{isEdit ? "Edit Purchase Order" : "Create Purchase Order"}</h2>
            <p>Enter purchase order and supplier information.</p>
        </div>

        <Link to="/purchase-orders" className="po-btn po-btn-secondary">
            Back to List
        </Link>
    </div>
)}

{error && <div className="po-error">{error}</div>}


            <form onSubmit={handleSubmit} className="po-form">
                <section className="po-form-section">
                    <h3>Basic Information</h3>

                    <div className="po-form-grid">
                        <div className="po-field">
                            <label htmlFor="poNumber">PO Number *</label>
                            <input
                                id="poNumber"
                                name="poNumber"
                                value={form.poNumber}
                                onChange={handleChange}
                                placeholder="e.g. PO-2026-001"
                                required
                            />
                        </div>

                        <div className="po-field">
                            <label htmlFor="supplierId">Supplier ID *</label>
                            <input
                                id="supplierId"
                                name="supplierId"
                                type="number"
                                min="1"
                                value={form.supplierId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="po-field">
                            <label htmlFor="poDate">PO Date *</label>
                            <input
                                id="poDate"
                                name="poDate"
                                type="date"
                                value={form.poDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="po-field">
                            <label htmlFor="expectedDeliveryDate">
                                Expected Delivery Date
                            </label>
                            <input
                                id="expectedDeliveryDate"
                                name="expectedDeliveryDate"
                                type="date"
                                value={form.expectedDeliveryDate}
                                onChange={handleChange}
                                min={form.poDate || undefined}
                            />
                        </div>

                        <div className="po-field">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Ordered">Ordered</option>
                                <option value="PartiallyReceived">
                                    Partially Received
                                </option>
                                <option value="Received">Received</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="po-field po-checkbox-field">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={Boolean(form.isActive)}
                                    onChange={handleChange}
                                />
                                Active Purchase Order
                            </label>
                        </div>
                    </div>
                </section>

                <section className="po-form-section">
                    <h3>Financial Information (₹)</h3>

                    <div className="po-form-grid">
                        {[
                            ["subTotal", "Sub Total"],
                            ["discountAmount", "Discount Amount"],
                            ["taxAmount", "Tax Amount"],
                            ["shippingAmount", "Shipping Amount"],
                            ["otherCharges", "Other Charges"],
                            ["grandTotal", "Grand Total"]
                        ].map(([name, label]) => (
                            <div className="po-field" key={name}>
                                <label htmlFor={name}>{label} *</label>
                                <input
                                    id={name}
                                    name={name}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form[name]}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <p className="po-help">
                        Enter the amounts calculated for this order. The
                        backend should validate the grand total against its
                        subtotal, discount, tax and charges.
                    </p>
                </section>

                <section className="po-form-section">
                    <h3>Payment and Delivery</h3>

                    <div className="po-form-grid">
                        <div className="po-field">
                            <label htmlFor="paymentTerms">Payment Terms</label>
                            <input
                                id="paymentTerms"
                                name="paymentTerms"
                                value={form.paymentTerms}
                                onChange={handleChange}
                                placeholder="e.g. Net 30"
                            />
                        </div>

                        <div className="po-field po-field-full">
                            <label htmlFor="deliveryAddress">
                                Delivery Address
                            </label>
                            <textarea
                                id="deliveryAddress"
                                name="deliveryAddress"
                                rows="3"
                                value={form.deliveryAddress}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="po-field po-field-full">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows="3"
                                value={form.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="po-field po-field-full">
                            <label htmlFor="termsAndConditions">
                                Terms and Conditions
                            </label>
                            <textarea
                                id="termsAndConditions"
                                name="termsAndConditions"
                                rows="4"
                                value={form.termsAndConditions}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                
<div className="po-form-actions">
    <button
        type="submit"
        className="po-btn po-btn-primary"
        disabled={saving}
    >
        {saving
            ? "Saving..."
            : isEdit
            ? "Update Purchase Order"
            : "Create Purchase Order"}
    </button>

    {modalMode ? (
        <button
            type="button"
            className="po-btn po-btn-secondary"
            onClick={onCancel}
            disabled={saving}
        >
            Cancel
        </button>
    ) : (
        <Link
            to="/purchase-orders"
            className="po-btn po-btn-secondary"
        >
            Cancel
        </Link>
    )}
</div>
</form>
</div>

);

};



export default PurchaseOrderForm;

