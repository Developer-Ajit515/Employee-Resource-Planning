import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import InvoiceService from "../../services/invoiceService";
import CustomerService from "../../services/customerService";
import { getProducts } from "../../services/productService";

import "./Invoice.css";

const InvoiceForm = ({ modalMode = false, invoiceId = null, onSaved, onCancel }) => {

    const navigate = useNavigate();
    const { id } = useParams();

    const activeId = invoiceId || id;
    const isEdit = Boolean(activeId);

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        customerId: "",
        invoiceDate: new Date()
            .toISOString()
            .split("T")[0],
        dueDate: "",
        salesOrderId: "",
        status: "Pending",
        discount: 0,
        tax: 0,
        notes: ""
    });

    const [items, setItems] = useState([
        {
            productId: "",
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            tax: 0
        }
    ]);

    useEffect(() => {
        loadData();
    }, [activeId]);

    
const loadData = async () => {
    try {
        setLoading(true);

        const [customerResponse, productResponse] =
            await Promise.all([
                CustomerService.getAll(),
                getProducts()
            ]);

        console.log("CUSTOMER API RESPONSE:", customerResponse);
        console.log("PRODUCT API RESPONSE:", productResponse);

        // Axios response ho to response.data use karein
        const customerBody =
            customerResponse?.data ?? customerResponse;

        const productBody =
            productResponse?.data ?? productResponse;

        // API response array ya wrapped object ho sakta hai
        const customerList = Array.isArray(customerBody)
            ? customerBody
            : customerBody?.$values ??
              customerBody?.items ??
              customerBody?.data ??
              [];

        const productList = Array.isArray(productBody)
            ? productBody
            : productBody?.$values ??
              productBody?.items ??
              productBody?.data ??
              [];

        console.log("NORMALIZED CUSTOMERS:", customerList);
        console.log("NORMALIZED PRODUCTS:", productList);

        setCustomers(
            Array.isArray(customerList) ? customerList : []
        );

        setProducts(
            Array.isArray(productList) ? productList : []
        );

        if (activeId) {
            const invoiceResponse =
                await InvoiceService.getById(activeId);

            const invoice =
                invoiceResponse?.data ?? invoiceResponse;

            setForm({
                customerId: invoice.customerId ?? "",
                invoiceDate: invoice.invoiceDate
                    ? invoice.invoiceDate.split("T")[0]
                    : "",
                dueDate: invoice.dueDate
                    ? invoice.dueDate.split("T")[0]
                    : "",
                salesOrderId: invoice.salesOrderId ?? "",
                status: invoice.status || "Pending",
                discount: invoice.discount ?? 0,
                tax: invoice.tax ?? 0,
                notes: invoice.notes || ""
            });

            setItems(
                invoice.invoiceItems?.length
                    ? invoice.invoiceItems.map((item) => ({
                        productId: item.productId ?? "",
                        quantity: item.quantity ?? 1,
                        unitPrice: item.unitPrice ?? 0,
                        discount: item.discount ?? 0,
                        tax: item.tax ?? 0
                    }))
                    : [{
                        productId: "",
                        quantity: 1,
                        unitPrice: 0,
                        discount: 0,
                        tax: 0
                    }]
            );
        }
    } catch (error) {
        console.error("Invoice Form Load Error:", error);
        console.error("API response:", error.response?.data);

        toast.error(
            error.response?.data?.message ||
            "Failed to load customers/products"
        );
    } finally {
        setLoading(false);
    }
};


    const handleFormChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {

        const updated = [...items];

        updated[index][field] = value;

        if (field === "productId") {

            const product =
                products.find(
                    (p) =>
                        Number(p.productId || p.id) ===
                        Number(value)
                );

            if (product) {

                updated[index].unitPrice =
                    product.price || 0;
            }
        }

        setItems(updated);
    };

    const addItem = () => {

        setItems([
            ...items,
            {
                productId: "",
                quantity: 1,
                unitPrice: 0,
                discount: 0,
                tax: 0
            }
        ]);
    };

    const removeItem = (index) => {

        if (items.length === 1) {
            toast.error(
                "Invoice must have at least one item"
            );
            return;
        }

        setItems(
            items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    const calculateItemTotal = (item) => {

        const quantity =
            Number(item.quantity) || 0;

        const price =
            Number(item.unitPrice) || 0;

        const discount =
            Number(item.discount) || 0;

        const tax =
            Number(item.tax) || 0;

        const subtotal =
            quantity * price;

        const discountAmount =
            subtotal * discount / 100;

        const taxAmount =
            (subtotal - discountAmount)
            * tax / 100;

        return (
            subtotal
            - discountAmount
            + taxAmount
        );
    };

    const subtotal = items.reduce(
        (sum, item) =>
            sum +
            (
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0)
            ),
        0
    );

    const grandTotal =
        subtotal -
        Number(form.discount || 0) +
        Number(form.tax || 0);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.customerId) {

            toast.error(
                "Please select customer"
            );

            return;
        }

        if (
            items.some(
                (item) => !item.productId
            )
        ) {

            toast.error(
                "Please select product for all items"
            );

            return;
        }

        try {

            setLoading(true);

            const payload = {
                customerId:
                    Number(form.customerId),

                invoiceDate:
                    form.invoiceDate,

                dueDate:
                    form.dueDate,

                salesOrderId:
                    form.salesOrderId
                        ? Number(form.salesOrderId)
                        : null,

                status:
                    form.status,

                discount:
                    Number(form.discount) || 0,

                tax:
                    Number(form.tax) || 0,

                notes:
                    form.notes,

                invoiceItems:
                    items.map((item) => ({
                        productId:
                            Number(item.productId),

                        quantity:
                            Number(item.quantity),

                        unitPrice:
                            Number(item.unitPrice),

                        discount:
                            Number(item.discount) || 0,

                        tax:
                            Number(item.tax) || 0
                    }))
            };

            if (isEdit) {

                await InvoiceService.update(
                    activeId,
                    payload
                );

                toast.success(
                    "Invoice updated successfully"
                );

            } else {

                await InvoiceService.create(
                    payload
                );

                toast.success(
                    "Invoice created successfully"
                );
            }

            if (modalMode) {
                onSaved?.();
            } else {
                navigate("/invoices");
            }

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save invoice"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className={`invoice-page ${modalMode ? "invoice-form-modal-content" : ""}`}>

            <div className="invoice-header">

                <div>
                    <h2 id={modalMode ? "invoice-modal-title" : undefined}>
                        {isEdit
                            ? "Edit Invoice"
                            : "Create Invoice"}
                    </h2>

                    <p>
                        {isEdit
                            ? "Update invoice details"
                            : "Create a new customer invoice"}
                    </p>
                </div>

            </div>

            <form
                className="invoice-form-card"
                onSubmit={handleSubmit}
            >

                <div className="invoice-form-grid">

                    <div className="form-group">

                        <label>
                            Customer *
                        </label>

                        <select
                            name="customerId"
                            value={form.customerId}
                            onChange={handleFormChange}
                            required
                        >

                            <option value="">
                                Select Customer
                            </option>

                            {customers.map((customer) => (

                                <option
                                    key={
                                        customer.customerId ||
                                        customer.id
                                    }
                                    value={
                                        customer.customerId ||
                                        customer.id
                                    }
                                >
                                    {
                                        customer.name ||
                                        customer.customerName
                                    }
                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Invoice Date *
                        </label>

                        <input
                            type="date"
                            name="invoiceDate"
                            value={form.invoiceDate}
                            onChange={handleFormChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Due Date *
                        </label>

                        <input
                            type="date"
                            name="dueDate"
                            value={form.dueDate}
                            onChange={handleFormChange}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleFormChange}
                        >
                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Paid">
                                Paid
                            </option>

                            <option value="Overdue">
                                Overdue
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>
                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Sales Order ID
                        </label>

                        <input
                            type="number"
                            name="salesOrderId"
                            value={form.salesOrderId}
                            onChange={handleFormChange}
                            placeholder="Optional"
                        />

                    </div>

                </div>

                <div className="invoice-items-section">

                    <div className="invoice-items-header">

                        <h3>
                            Invoice Items
                        </h3>

                        <button
                            type="button"
                            className="add-item-btn"
                            onClick={addItem}
                        >
                            + Add Item
                        </button>

                    </div>

                    <div className="invoice-items-wrapper">

                        <table className="invoice-items-table">

                            <thead>

                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Discount %</th>
                                    <th>Tax %</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>

                            </thead>

                            <tbody>

                                {items.map(
                                    (item, index) => (

                                        <tr key={index}>

                                            <td>

                                                <select
                                                    value={
                                                        item.productId
                                                    }
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            "productId",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >

                                                    <option value="">
                                                        Select Product
                                                    </option>

                                                    {products.map(
                                                        (product) => (

                                                            <option
                                                                key={
                                                                    product.productId ||
                                                                    product.id
                                                                }
                                                                value={
                                                                    product.productId ||
                                                                    product.id
                                                                }
                                                            >
                                                                {
                                                                    product.name ||
                                                                    product.productName
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                                </select>

                                            </td>

                                            <td>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>

                                            <td>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        item.unitPrice
                                                    }
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            "unitPrice",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>

                                            <td>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        item.discount
                                                    }
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            "discount",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>

                                            <td>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        item.tax
                                                    }
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            "tax",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </td>

                                            <td className="item-total">

                                                ₹
                                                {calculateItemTotal(
                                                    item
                                                ).toFixed(2)}

                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="remove-item-btn"
                                                    onClick={() =>
                                                        removeItem(
                                                            index
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                <div className="invoice-bottom">

                    <div className="invoice-notes">

                        <label>
                            Notes
                        </label>

                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleFormChange}
                            placeholder="Invoice notes..."
                            rows="5"
                        />

                    </div>

                    <div className="invoice-summary">

                        <div>
                            <span>
                                Sub Total
                            </span>

                            <strong>
                                ₹
                                {subtotal.toFixed(2)}
                            </strong>
                        </div>

                        <div>

                            <label>
                                Discount
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="discount"
                                value={form.discount}
                                onChange={handleFormChange}
                            />

                        </div>

                        <div>

                            <label>
                                Tax
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="tax"
                                value={form.tax}
                                onChange={handleFormChange}
                            />

                        </div>

                        <div className="grand-total">

                            <span>
                                Grand Total
                            </span>

                            <strong>
                                ₹
                                {grandTotal.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>

                <div className="invoice-form-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                            if (modalMode) onCancel?.();
                            else navigate("/invoices");
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="save-invoice-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update Invoice"
                                : "Create Invoice"}
                    </button>

                </div>

            </form>

        </div>
    );
};

export default InvoiceForm;