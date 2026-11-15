
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { getGoodsReceiptById } from "../../services/goodsReceiptService";
import "./GoodsReceipt.css";

const GoodsReceiptDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReceipt = async () => {
            try {
                const response = await getGoodsReceiptById(id);
                setReceipt(response?.data ?? response);
            } catch (error) {
                console.error("Failed to load receipt details:", error);
                toast.error("Unable to load goods receipt details.");
            } finally {
                setLoading(false);
            }
        };

        loadReceipt();
    }, [id]);

    if (loading) {
        return <div className="gr-message">Loading receipt details...</div>;
    }

    if (!receipt) {
        return (
            <div className="gr-page">
                <h2>Goods receipt not found.</h2>
                <button
                    className="gr-secondary-btn"
                    onClick={() => navigate("/goods-receipts")}
                >
                    Back to List
                </button>
            </div>
        );
    }

    const receiptNumber =
        receipt.receiptNumber ??
        receipt.ReceiptNumber ??
        `GR-${receipt.id ?? receipt.Id}`;

    const purchaseOrderNumber =
        receipt.purchaseOrderNumber ??
        receipt.PurchaseOrderNumber ??
        receipt.purchaseOrder?.poNumber ??
        receipt.PurchaseOrder?.PONumber ??
        receipt.purchaseOrderId ??
        receipt.PurchaseOrderId ??
        "—";

    const receivedDate =
        receipt.receivedDate ??
        receipt.ReceivedDate ??
        receipt.receiptDate ??
        receipt.ReceiptDate;

    const items = receipt.items ?? receipt.Items ?? [];

    return (
        <div className="gr-page">
            <div className="gr-header">
                <div>
                    <h1>Goods Receipt Details</h1>
                    <p>Receipt reference: {receiptNumber}</p>
                </div>

                <div className="gr-header-actions">
                    <button
                        className="gr-secondary-btn"
                        onClick={() =>
                            navigate(`/goods-receipts/edit/${id}`)
                        }
                    >
                        Edit Receipt
                    </button>

                    <button
                        className="gr-secondary-btn"
                        onClick={() => navigate("/goods-receipts")}
                    >
                        Back to List
                    </button>
                </div>
            </div>

            <div className="gr-card">
                <div className="gr-details-grid">
                    <div>
                        <span>Receipt Number</span>
                        <strong>{receiptNumber}</strong>
                    </div>

                    <div>
                        <span>Purchase Order</span>
                        <strong>{purchaseOrderNumber}</strong>
                    </div>

                    <div>
                        <span>Received Date</span>
                        <strong>
                            {receivedDate
                                ? new Date(receivedDate).toLocaleDateString()
                                : "—"}
                        </strong>
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>
                            {receipt.status ?? receipt.Status ?? "Received"}
                        </strong>
                    </div>
                </div>

                <h2 className="gr-section-title">Received Items</h2>

                <div className="gr-table-wrapper">
                    <table className="gr-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Ordered Qty</th>
                                <th>Received Qty</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id ?? item.Id ?? index}>
                                    <td>
                                        {item.productName ??
                                            item.ProductName ??
                                            "—"}
                                    </td>
                                    <td>
                                        {item.orderedQuantity ??
                                            item.OrderedQuantity ??
                                            0}
                                    </td>
                                    <td>
                                        {item.receivedQuantity ??
                                            item.ReceivedQuantity ??
                                            0}
                                    </td>
                                    <td>
                                        {item.remarks ?? item.Remarks ?? "—"}
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="gr-empty">
                                        No item details available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="gr-notes-display">
                    <h3>Notes</h3>
                    <p>{receipt.notes ?? receipt.Notes ?? "No notes added."}</p>
                </div>
            </div>
        </div>
    );
};

export default GoodsReceiptDetails;