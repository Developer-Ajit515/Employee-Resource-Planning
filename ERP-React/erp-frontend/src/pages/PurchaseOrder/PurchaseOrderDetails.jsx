
// PurchaseOrderDetails.jsx

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPurchaseOrderById } from "../../services/purchaseOrderService";
import "./PurchaseOrder.css";

const PurchaseOrderDetails = () => {
    const { id } = useParams();

    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getPurchaseOrderById(id);
                setPurchaseOrder(response?.data ?? response);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load purchase order details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [id]);

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? "-"
            : parsedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
    };

    const formatCurrency = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR"
        });

    if (loading) {
        return <div className="po-loading">Loading purchase order details...</div>;
    }

    if (error || !purchaseOrder) {
        return (
            <div className="po-page">
                <div className="po-error">
                    {error || "Purchase order not found."}
                </div>

                <Link to="/purchase-orders" className="po-btn po-btn-secondary">
                    Back to Purchase Orders
                </Link>
            </div>
        );
    }

    const po = purchaseOrder;

    return (
        <div className="po-page">
            <div className="po-header">
                <div>
                    <h2>Purchase Order Details</h2>
                    <p>View purchase order information and financial details.</p>
                </div>

                <div className="po-header-actions">
                    <Link
                        to={`/purchase-orders/edit/${po.id}`}
                        className="po-btn po-btn-primary"
                    >
                        Edit Purchase Order
                    </Link>

                    <Link
                        to="/purchase-orders"
                        className="po-btn po-btn-secondary"
                    >
                        Back to List
                    </Link>
                </div>
            </div>

            <div className="po-details-card">
                <div className="po-details-heading">
                    <div>
                        <span className="po-detail-label">Purchase Order</span>
                        <h3>{po.poNumber || "-"}</h3>
                    </div>

                    <span
                        className={`po-status po-status-${String(
                            po.status || "Pending"
                        ).toLowerCase()}`}
                    >
                        {po.status || "Pending"}
                    </span>
                </div>

                <section className="po-detail-section">
                    <h3>Basic Information</h3>

                    <div className="po-details-grid">
                        <div className="po-detail-item">
                            <span>PO ID</span>
                            <strong>{po.id}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>PO Number</span>
                            <strong>{po.poNumber || "-"}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Supplier</span>
                            <strong>
                                {po.supplier?.name ||
                                    `Supplier #${po.supplierId}`}
                            </strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Supplier ID</span>
                            <strong>{po.supplierId}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>PO Date</span>
                            <strong>{formatDate(po.poDate)}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Expected Delivery</span>
                            <strong>
                                {formatDate(po.expectedDeliveryDate)}
                            </strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Status</span>
                            <strong>{po.status || "Pending"}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Active</span>
                            <strong>{po.isActive ? "Yes" : "No"}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Created Date</span>
                            <strong>{formatDate(po.createdDate)}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Last Updated</span>
                            <strong>{formatDate(po.updatedDate)}</strong>
                        </div>
                    </div>
                </section>

                <section className="po-detail-section">
                    <h3>Financial Summary</h3>

                    <div className="po-financial-grid">
                        <div className="po-financial-item">
                            <span>Sub Total</span>
                            <strong>{formatCurrency(po.subTotal)}</strong>
                        </div>

                        <div className="po-financial-item">
                            <span>Discount</span>
                            <strong>{formatCurrency(po.discountAmount)}</strong>
                        </div>

                        <div className="po-financial-item">
                            <span>Tax</span>
                            <strong>{formatCurrency(po.taxAmount)}</strong>
                        </div>

                        <div className="po-financial-item">
                            <span>Shipping</span>
                            <strong>{formatCurrency(po.shippingAmount)}</strong>
                        </div>

                        <div className="po-financial-item">
                            <span>Other Charges</span>
                            <strong>{formatCurrency(po.otherCharges)}</strong>
                        </div>

                        <div className="po-financial-total">
                            <span>Grand Total</span>
                            <strong>{formatCurrency(po.grandTotal)}</strong>
                        </div>
                    </div>
                </section>

                <section className="po-detail-section">
                    <h3>Payment and Delivery Information</h3>

                    <div className="po-details-grid">
                        <div className="po-detail-item">
                            <span>Payment Terms</span>
                            <strong>{po.paymentTerms || "-"}</strong>
                        </div>

                        <div className="po-detail-item">
                            <span>Delivery Address</span>
                            <strong>{po.deliveryAddress || "-"}</strong>
                        </div>
                    </div>

                    <div className="po-text-block">
                        <span>Notes</span>
                        <p>{po.notes || "No notes added."}</p>
                    </div>

                    <div className="po-text-block">
                        <span>Terms and Conditions</span>
                        <p>
                            {po.termsAndConditions ||
                                "No terms and conditions added."}
                        </p>
                    </div>
                </section>

                <section className="po-detail-section">
                    <h3>Purchase Order Items</h3>

                    {Array.isArray(po.items) && po.items.length > 0 ? (
                        <div className="po-table-wrapper">
                            <table className="po-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Item Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {po.items.map((item, index) => (
                                        <tr key={item.id ?? index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <pre className="po-item-json">
                                                    {JSON.stringify(item, null, 2)}
                                                </pre>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="po-help">
                            No purchase order items were returned by the API.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PurchaseOrderDetails;

