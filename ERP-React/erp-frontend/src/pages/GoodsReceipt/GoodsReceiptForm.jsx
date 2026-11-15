
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    createGoodsReceipt,
    updateGoodsReceipt,
    getGoodsReceiptById,
    getPurchaseOrdersForReceipt
} from "../../services/goodsReceiptService";

import "./GoodsReceipt.css";

const emptyItem = () => ({
    productName: "",
    orderedQuantity: 0,
    receivedQuantity: 1,
    remarks: ""
});


const GoodsReceiptForm = ({
    modalMode = false,
    receiptId = null,
    onSaved,
    onCancel
}) => {
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const id = receiptId ?? routeId;
    const isEdit = id !== null && id !== undefined && id !== "";


    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        receiptNumber: "",
        purchaseOrderId: "",
        receivedDate: new Date().toISOString().slice(0, 10),
        status: "Received",
        notes: "",
        items: [emptyItem()]
    });

    const extractArray = (response) => {
    let result = response?.data ?? response;

    // Handle nested API response formats
    for (let i = 0; i < 4 && result && !Array.isArray(result); i++) {
        result =
            result.items ??
            result.Items ??
            result.data ??
            result.Data ??
            result.results ??
            result.Results ??
            result.purchaseOrders ??
            result.PurchaseOrders ??
            null;
    }

    return Array.isArray(result) ? result : [];
};

useEffect(() => {
    const loadData = async () => {
        try {
            setLoading(true);

            const poResponse = await getPurchaseOrdersForReceipt();

            console.log("Purchase Orders API response:", poResponse);

            const poData = extractArray(poResponse);

            console.log("Purchase Orders extracted:", poData);

            setPurchaseOrders(poData);

            if (isEdit) {
                const receipt = await getGoodsReceiptById(id);
                const data = receipt?.data ?? receipt;

                setForm({
                    receiptNumber:
                        data.receiptNumber ?? data.ReceiptNumber ?? "",
                    purchaseOrderId: String(
                        data.purchaseOrderId ??
                        data.PurchaseOrderId ?? ""
                    ),
                    receivedDate: (
                        data.receivedDate ??
                        data.ReceivedDate ??
                        new Date().toISOString()
                    ).slice(0, 10),
                    status: data.status ?? data.Status ?? "Received",
                    notes: data.notes ?? data.Notes ?? "",
                    items: (
                        data.items ??
                        data.Items ??
                        [emptyItem()]
                    ).map((item) => ({
                        id: item.id ?? item.Id,
                        productName:
                            item.productName ??
                            item.ProductName ??
                            item.product?.name ??
                            item.Product?.Name ??
                            "",
                        orderedQuantity:
                            item.orderedQuantity ??
                            item.OrderedQuantity ??
                            item.quantity ??
                            item.Quantity ??
                            0,
                        receivedQuantity:
                            item.receivedQuantity ??
                            item.ReceivedQuantity ??
                            1,
                        remarks: item.remarks ?? item.Remarks ?? ""
                    }))
                });
            }
        } catch (error) {
            console.error(
                "Failed to load Purchase Orders:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Unable to load purchase orders. Check API."
            );
        } finally {
            setLoading(false);
        }
    };

    loadData();
}, [id, isEdit]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, emptyItem()]
        }));
    };

    const removeItem = (index) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.length > 1
                ? prev.items.filter((_, i) => i !== index)
                : prev.items
        }));
    };

    const handlePurchaseOrderChange = (e) => {
        const selectedId = e.target.value;
        const selectedPO = purchaseOrders.find(
            (po) =>
                String(po.id ?? po.Id) === selectedId
        );

        const poItems =
            selectedPO?.items ??
            selectedPO?.Items ??
            selectedPO?.purchaseOrderItems ??
            selectedPO?.PurchaseOrderItems ??
            [];

        setForm((prev) => ({
            ...prev,
            purchaseOrderId: selectedId,
            items: poItems.length
                ? poItems.map((item) => ({
                    productName:
                        item.productName ??
                        item.ProductName ??
                        item.product?.name ??
                        item.Product?.Name ??
                        "",
                    orderedQuantity:
                        item.quantity ??
                        item.Quantity ??
                        item.orderedQuantity ??
                        item.OrderedQuantity ??
                        0,
                    receivedQuantity: 0,
                    remarks: ""
                }))
                : prev.items
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.purchaseOrderId) {
            toast.error("Please select a purchase order.");
            return;
        }

        if (!form.receivedDate) {
            toast.error("Please select the received date.");
            return;
        }

        if (form.items.some(
            (item) =>
                !item.productName.trim() ||
                Number(item.receivedQuantity) < 0
        )) {
            toast.error("Enter a product name and valid received quantity for each item.");
            return;
        }

        const payload = {
            receiptNumber: form.receiptNumber.trim() || null,
            purchaseOrderId: Number(form.purchaseOrderId),
            receivedDate: form.receivedDate,
            status: form.status,
            notes: form.notes.trim(),
            items: form.items.map((item) => ({
                ...(item.id ? { id: item.id } : {}),
                productName: item.productName.trim(),
                orderedQuantity: Number(item.orderedQuantity),
                receivedQuantity: Number(item.receivedQuantity),
                remarks: item.remarks.trim()
            }))
        };

       
try {
    if (isEdit) {
        await updateGoodsReceipt(id, payload);
        toast.success("Goods receipt updated successfully.");
    } else {
        await createGoodsReceipt(payload);
        toast.success("Goods receipt created successfully.");
    }

    if (modalMode) {
        await onSaved?.();
    } else {
        navigate("/goods-receipts");
    }
} catch (error) {
    console.error("Save goods receipt failed:", error);

    toast.error(
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to save goods receipt. Check the API payload."
    );
}

    };

    if (loading) {
        return <div className="gr-message">Loading form...</div>;
    }

    return (
        <div className="gr-page">
            
{!modalMode && (
    <div className="gr-header gr-header-box">
        <div>
            <h1>{isEdit ? "Edit Goods Receipt" : "Create Goods Receipt"}</h1>
            <p>Record goods received against a purchase order.</p>
        </div>

        <button
            type="button"
            className="gr-secondary-btn"
            onClick={() => navigate("/goods-receipts")}
        >
            Back to List
        </button>
    </div>
)}


            <form className="gr-form-card" onSubmit={handleSubmit}>
                <div className="gr-form-grid">
                    <div className="gr-field">
                        <label>Receipt Number</label>
                        <input
                            name="receiptNumber"
                            value={form.receiptNumber}
                            onChange={handleChange}
                            placeholder="Auto-generated if blank"
                        />
                    </div>

                    <div className="gr-field">
                        <label>Purchase Order *</label>
                      
<select
    name="purchaseOrderId"
    value={form.purchaseOrderId}
    onChange={handlePurchaseOrderChange}
    required
>
    <option value="">Select Purchase Order</option>

    {purchaseOrders.map((po) => {
        const poId =
            po.id ??
            po.Id ??
            po.purchaseOrderId ??
            po.PurchaseOrderId;

        const poNumber =
            po.poNumber ??
            po.PONumber ??
            po.poNo ??
            po.PONo ??
            po.purchaseOrderNumber ??
            po.PurchaseOrderNumber;

        if (poId == null) return null;

        return (
            <option key={poId} value={poId}>
                {poNumber || `PO-${poId}`}
            </option>
        );
    })}
</select>

{purchaseOrders.length === 0 && (
    <small>
        No purchase orders found. Check the API response.
    </small>
)}

                    </div>

                    <div className="gr-field">
                        <label>Received Date *</label>
                        <input
                            type="date"
                            name="receivedDate"
                            value={form.receivedDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="gr-field">
                        <label>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                            <option value="Partially Received">Partially Received</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="gr-items-heading">
                    <h2>Received Items</h2>

                    <button
                        type="button"
                        className="gr-secondary-btn"
                        onClick={addItem}
                    >
                        + Add Item
                    </button>
                </div>

                <div className="gr-table-wrapper">
                    <table className="gr-table gr-items-table">
                        <thead>
                            <tr>
                                <th>Product Name *</th>
                                <th>Ordered Qty</th>
                                <th>Received Qty *</th>
                                <th>Remarks</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {form.items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            value={item.productName}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "productName",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Product name"
                                            required
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.orderedQuantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "orderedQuantity",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.receivedQuantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "receivedQuantity",
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </td>

                                    <td>
                                        <input
                                            value={item.remarks}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "remarks",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Optional"
                                        />
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="gr-delete-btn"
                                            onClick={() => removeItem(index)}
                                            disabled={form.items.length === 1}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="gr-field gr-notes-field">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Enter delivery notes, damage details, or other comments..."
                    />
                </div>

                
<div className="gr-form-actions">
    <button
        type="button"
        className="gr-secondary-btn"
        onClick={() => {
            if (modalMode) {
                onCancel?.();
            } else {
                navigate("/goods-receipts");
            }
        }}
    >
        Cancel
    </button>

    <button type="submit" className="gr-primary-btn">
        {isEdit ? "Update Receipt" : "Save Receipt"}
    </button>
</div>
</form>
</div>

);

};

    

export default GoodsReceiptForm;