import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {

    FaArrowLeft,

    FaShoppingCart,

    FaFileInvoice,

    FaUser,

    FaCalendarAlt,

    FaPlus,

    FaEdit,

    FaTrash,

    FaTimes,

    FaBoxOpen,

    FaSave,

    FaStickyNote,

    FaCheckCircle,

    FaRupeeSign,

    FaPercent,

    FaReceipt

} from "react-icons/fa";

import Swal from "sweetalert2";

import toast from "react-hot-toast";



import SalesOrderService from "../../services/salesOrderService";

import CustomerService from "../../services/customerService";

import { getProducts } from "../../services/productService";



import "./SalesOrder.css";



const today = () => new Date().toISOString().split("T")[0];



const emptyItem = () => ({

    id: 0,

    productId: "",

    productName: "",

    quantity: 1,

    unitPrice: 0,

    discountAmount: 0,

    taxAmount: 0,

    totalAmount: 0

});



const SalesOrderForm = ({

  modalMode = false,

  orderId = null,

  onClose,

  onSaved,

}) => {

  const { id: routeId } = useParams();

  const navigate = useNavigate();



  const id = orderId ?? routeId;

  const isEditMode = Boolean(id);



    const [loading, setLoading] = useState(false);

    const [customers, setCustomers] = useState([]);

    const [products, setProducts] = useState([]);

    const [itemModalOpen, setItemModalOpen] = useState(false);

    const [editingItemIndex, setEditingItemIndex] = useState(null);

    const [itemDraft, setItemDraft] = useState(emptyItem());



    const [formData, setFormData] = useState({

        orderNumber: "",

        customerId: "",

        orderDate: today(),

        status: "Draft",

        subtotal: 0,

        discountAmount: 0,

        taxAmount: 0,

        totalAmount: 0,

        notes: "",

        items: []

    });



    // Load dropdowns and existing order.*

    useEffect(() => {

        loadCustomers();

        loadProducts();



        if (isEditMode) {

            loadSalesOrder();

        }

    }, [id]);



    const loadCustomers = async () => {

        try {

            // Supports either naming convention in CustomerService.*

            const getter =

                CustomerService.getAll ||

                CustomerService.getCustomers;



            if (!getter) {

                throw new Error(

                    "CustomerService must export getAll() or getCustomers()."

                );

            }



            const response = await getter();
            const body = response?.data ?? response;
            const data = Array.isArray(body)
                ? body
                : body?.items ?? body?.data ?? body?.$values ?? [];
            setCustomers(Array.isArray(data) ? data : data?.$values ?? []);

        } catch (error) {

            console.error("Customer loading error:", error);

            toast.error("Failed to load customers");

        }

    };



    const loadProducts = async () => {

        try {

            const response = await getProducts();
            const body = response?.data ?? response;
            const data = Array.isArray(body)
                ? body
                : body?.items ?? body?.data ?? body?.$values ?? [];
            setProducts(Array.isArray(data) ? data : data?.$values ?? []);

        } catch (error) {

            console.error("Product loading error:", error);

            toast.error("Failed to load products");

        }

    };



    const loadSalesOrder = async () => {

        try {

            setLoading(true);



            const result = await SalesOrderService.getSalesOrderById(id);
            const response = result?.data?.data ?? result?.data ?? result;
            const rawItems =
                response.items?.$values ??
                response.items ??
                response.salesOrderItems?.$values ??
                response.salesOrderItems ??
                response.orderItems?.$values ??
                response.orderItems ??
                [];

            setFormData({

                orderNumber:

                    response.orderNumber ??

                    response.salesOrderNumber ??

                    "",

                customerId: response.customerId ?? "",

                orderDate: response.orderDate

                    ? response.orderDate.split("T")[0]

                    : today(),

                status: response.status ?? "Draft",

                subtotal: Number(response.subtotal ?? 0),

                discountAmount: Number(response.discountAmount ?? 0),

                taxAmount: Number(response.taxAmount ?? 0),

                totalAmount: Number(response.totalAmount ?? 0),

                notes: response.notes ?? "",

                items: Array.isArray(rawItems)

                    ? rawItems.map((item) => ({

                        id: item.id ?? 0,

                        productId:

                            item.productId ??

                            item.product?.id ??

                            "",

                        productName:

                            item.productName ??

                            item.product?.name ??

                            "",

                        quantity: Number(item.quantity ?? 1),

                        unitPrice: Number(item.unitPrice ?? 0),

                        discountAmount: Number(

                            item.discountAmount ?? 0

                        ),

                        taxAmount: Number(item.taxAmount ?? 0),

                        totalAmount: Number(

                            item.totalAmount ??

                            item.total ??

                            0

                        )

                    }))

                    : []

            });

        } catch (error) {

            console.error("Sales order loading error:", error);

            toast.error(

                error?.response?.data?.message ||

                "Failed to load sales order"

            );

        } finally {

            setLoading(false);

        }

    };



    const handleChange = (e) => {

        const { name, value } = e.target;



        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));

    };



    const calculateItemTotal = (item) => {

        const quantity = Number(item.quantity) || 0;

        const unitPrice = Number(item.unitPrice) || 0;

        const discount = Number(item.discountAmount) || 0;

        const tax = Number(item.taxAmount) || 0;



        return Math.max(

            0,

            quantity * unitPrice - discount + tax

        );

    };



    // Calculate order totals whenever its items change.*

    useEffect(() => {

        const subtotal = formData.items.reduce(

            (sum, item) =>

                sum +

                (Number(item.quantity) || 0) *

                (Number(item.unitPrice) || 0),

            0

        );



        const discountAmount = formData.items.reduce(

            (sum, item) =>

                sum + (Number(item.discountAmount) || 0),

            0

        );



        const taxAmount = formData.items.reduce(

            (sum, item) =>

                sum + (Number(item.taxAmount) || 0),

            0

        );



        setFormData((prev) => ({

            ...prev,

            subtotal,

            discountAmount,

            taxAmount,

            totalAmount: Math.max(

                0,

                subtotal - discountAmount + taxAmount

            )

        }));

    }, [formData.items]);



    const openAddItemModal = () => {

        setEditingItemIndex(null);

        setItemDraft(emptyItem());

        setItemModalOpen(true);

    };



    const openEditItemModal = (index) => {

        setEditingItemIndex(index);

        setItemDraft({ ...formData.items[index] });

        setItemModalOpen(true);

    };



    const closeItemModal = () => {

        setItemModalOpen(false);

        setEditingItemIndex(null);

        setItemDraft(emptyItem());

    };



    const handleDraftChange = (e) => {

        const { name, value } = e.target;



        setItemDraft((prev) => ({

            ...prev,

            [name]: value

        }));

    };



    const handleDraftProductChange = (e) => {

        const productId = e.target.value;



        const product = products.find(

            (p) =>

                String(p.id ?? p.productId) === String(productId)

        );



        setItemDraft((prev) => ({

            ...prev,

            productId,

            productName:

                product?.name ??

                product?.productName ??

                "",

            unitPrice: Number(

                product?.price ??

                product?.unitPrice ??

                0

            )

        }));

    };



    const saveItem = (e) => {

        e.preventDefault();



        if (!itemDraft.productId) {

            toast.error("Please select a product");

            return;

        }



        if (Number(itemDraft.quantity) <= 0) {

            toast.error("Quantity must be greater than zero");

            return;

        }



        if (

            Number(itemDraft.unitPrice) < 0 ||

            Number(itemDraft.discountAmount) < 0 ||

            Number(itemDraft.taxAmount) < 0

        ) {

            toast.error("Price, discount and tax cannot be negative");

            return;

        }



        const item = {

            ...itemDraft,

            id: Number(itemDraft.id) || 0,

            productId: Number(itemDraft.productId),

            quantity: Number(itemDraft.quantity),

            unitPrice: Number(itemDraft.unitPrice),

            discountAmount: Number(itemDraft.discountAmount) || 0,

            taxAmount: Number(itemDraft.taxAmount) || 0

        };



        item.totalAmount = calculateItemTotal(item);



        setFormData((prev) => {

            const updatedItems = [...prev.items];



            if (editingItemIndex !== null) {

                updatedItems[editingItemIndex] = item;

            } else {

                updatedItems.push(item);

            }



            return {

                ...prev,

                items: updatedItems

            };

        });



        toast.success(

            editingItemIndex !== null

                ? "Order item updated"

                : "Product added to order"

        );



        closeItemModal();

    };



    const removeItem = async (index) => {

        const result = await Swal.fire({

            title: "Remove this item?",

            text: "This product will be removed from the sales order.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Yes, remove",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#dc3545",

            cancelButtonColor: "#6c757d"

        });



        if (!result.isConfirmed) return;



        setFormData((prev) => ({

            ...prev,

            items: prev.items.filter((_, i) => i !== index)

        }));



        toast.success("Item removed");

    };



    const formatAmount = (amount) =>

        Number(amount || 0).toLocaleString("en-IN", {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        });



    const handleSubmit = async (e) => {

        e.preventDefault();



        if (!formData.customerId) {

            toast.error("Please select a customer");

            return;

        }



        if (!formData.items.length) {

            toast.error("Please add at least one product");

            return;

        }



        if (formData.items.some((item) => !item.productId)) {

            toast.error("Every order item must have a product");

            return;

        }



        if (formData.items.some((item) => Number(item.quantity) <= 0)) {

            toast.error("Every item must have a valid quantity");

            return;

        }



        const payload = {

            orderNumber: formData.orderNumber,

            customerId: Number(formData.customerId),

            orderDate: formData.orderDate,

            status: formData.status,

            subtotal: Number(formData.subtotal),

            discountAmount: Number(formData.discountAmount),

            taxAmount: Number(formData.taxAmount),

            totalAmount: Number(formData.totalAmount),

            notes: formData.notes || "",

            items: formData.items.map((item) => ({

                id: Number(item.id) || 0,

                productId: Number(item.productId),

                quantity: Number(item.quantity),

                unitPrice: Number(item.unitPrice),

                discountAmount: Number(item.discountAmount) || 0,

                taxAmount: Number(item.taxAmount) || 0,

                totalAmount: calculateItemTotal(item)

            }))

        };



        try {

            setLoading(true);



            if (isEditMode) {

                await SalesOrderService.updateSalesOrder(id, payload);

                toast.success("Sales order updated successfully");

            } else {

                await SalesOrderService.createSalesOrder(payload);

                toast.success("Sales order created successfully");

            }



            if (modalMode) {

  if (onSaved) {

    await onSaved();

  } else if (onClose) {

    onClose();

  }

} else {

  navigate("/sales-orders");

}

        } catch (error) {

            console.error("Sales order save error:", error);



            toast.error(

                error?.response?.data?.message ||

                error?.response?.data?.title ||

                "Failed to save sales order"

            );

        } finally {

            setLoading(false);

        }

    };



    if (loading && isEditMode && !formData.orderNumber) {

        return (

            <div className="sales-order-page">

                <div className="sales-order-loading">

                    <span className="spinner-border text-primary" />

                    <p>Loading sales order...</p>

                </div>

            </div>

        );

    }



    return (

        <div className="sales-order-page">

            {/* Bordered page header */}



            {!modalMode && (

            <div className="sales-order-page-header">

                <div className="sales-order-heading-left">

                    <div className="sales-order-header-icon">

                        <FaShoppingCart />

                    </div>

                    <div>

                        <h2 className="sales-order-page-title">

                            {isEditMode

                                ? "Edit Sales Order"

                                : "Create Sales Order"}

                        </h2>

                        <p className="sales-order-page-subtitle">

                            Manage order details, products and pricing

                        </p>

                    </div>

                </div>



                <Link

                    to="/sales-orders"

                    className="sales-order-back-btn"

                >

                    <FaArrowLeft /> Back to Orders

                </Link>

            </div>

            )}



            <form onSubmit={handleSubmit}>

                {/* Order information */}

                <section className="sales-order-card">

                    <div className="sales-order-card-header">

                        <div className="sales-order-section-heading">

                            <span className="sales-order-section-icon">

                                <FaFileInvoice />

                            </span>

                            <div>

                                <h3>Order Information</h3>

                                <p>Enter the main order details</p>

                            </div>

                        </div>

                    </div>



                    <div className="sales-order-form-grid">

                        <div className="sales-order-form-group">

                            <label>

                                <FaFileInvoice /> Order Number

                            </label>

                            <input

                                name="orderNumber"

                                value={formData.orderNumber}

                                onChange={handleChange}

                                placeholder="Enter order number"

                            />

                            <small>

                                Leave blank if your backend generates it.

                            </small>

                        </div>



                        <div className="sales-order-form-group">

                            <label>

                                <FaUser /> Customer <span>*</span>

                            </label>

                            <select

                                name="customerId"

                                value={formData.customerId}

                                onChange={handleChange}

                                required

                            >

                                <option value="">Select customer</option>

                                {customers.map((customer) => {

                                    const customerId =

                                        customer.id ?? customer.customerId;



                                    return (

                                        <option

                                            key={customerId}

                                            value={customerId}

                                        >

                                            {customer.name ??

                                                customer.customerName ??

                                                `Customer ${customerId}`}

                                        </option>

                                    );

                                })}

                            </select>

                        </div>



                        <div className="sales-order-form-group">

                            <label>

                                <FaCalendarAlt /> Order Date <span>*</span>

                            </label>

                            <input

                                type="date"

                                name="orderDate"

                                value={formData.orderDate}

                                onChange={handleChange}

                                required

                            />

                        </div>



                        <div className="sales-order-form-group">

                            <label>

                                <FaCheckCircle /> Status

                            </label>

                            <select

                                name="status"

                                value={formData.status}

                                onChange={handleChange}

                            >

                                <option value="Draft">Draft</option>

                                <option value="Confirmed">Confirmed</option>

                                <option value="Processing">Processing</option>

                                <option value="Completed">Completed</option>

                                <option value="Cancelled">Cancelled</option>

                            </select>

                        </div>



                        <div className="sales-order-form-group sales-order-full-width">

                            <label>

                                <FaStickyNote /> Notes

                            </label>

                            <textarea

                                name="notes"

                                rows="3"

                                value={formData.notes}

                                onChange={handleChange}

                                placeholder="Add order notes or instructions..."

                            />

                        </div>

                    </div>

                </section>



                {/* Order items */}

                <section className="sales-order-card">

                    <div className="sales-order-card-header sales-order-items-heading">

                        <div className="sales-order-section-heading">

                            <span className="sales-order-section-icon">

                                <FaBoxOpen />

                            </span>

                            <div>

                                <h3>Order Items</h3>

                                <p>

                                    {formData.items.length} product(s) added

                                </p>

                            </div>

                        </div>



                        <button

                            type="button"

                            className="sales-order-add-item-btn"

                            onClick={openAddItemModal}

                        >

                            <FaPlus /> Add Item

                        </button>

                    </div>



                    {formData.items.length === 0 ? (

                        <div className="sales-order-empty-items">

                            <div className="sales-order-empty-icon">

                                <FaShoppingCart />

                            </div>

                            <h4>No products added yet</h4>

                            <p>

                                Add a product to start building this sales order.

                            </p>

                            <button

                                type="button"

                                className="sales-order-add-item-btn"

                                onClick={openAddItemModal}

                            >

                                <FaPlus /> Add First Item

                            </button>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table sales-order-items-table mb-0">

                                <thead>

                                    <tr>

                                        <th>#</th>

                                        <th>Product</th>

                                        <th>Qty</th>

                                        <th>Unit Price</th>

                                        <th>Discount</th>

                                        <th>Tax</th>

                                        <th>Total</th>

                                        <th className="text-end">Actions</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {formData.items.map((item, index) => (

                                        <tr key={`${item.id}-${index}`}>

                                            <td>{index + 1}</td>

                                            <td>

                                                <div className="sales-order-product-cell">

                                                    <span className="sales-order-product-icon">

                                                        <FaBoxOpen />

                                                    </span>

                                                    <span>

                                                        {item.productName ||

                                                            `Product ${item.productId}`}

                                                    </span>

                                                </div>

                                            </td>

                                            <td>{item.quantity}</td>

                                            <td>₹{formatAmount(item.unitPrice)}</td>

                                            <td>₹{formatAmount(item.discountAmount)}</td>

                                            <td>₹{formatAmount(item.taxAmount)}</td>

                                            <td>

                                                <strong>

                                                    ₹{formatAmount(

                                                        calculateItemTotal(item)

                                                    )}

                                                </strong>

                                            </td>

                                            <td className="text-end">

                                                <button

                                                    type="button"

                                                    className="sales-order-icon-btn edit"

                                                    title="Edit item"

                                                    onClick={() =>

                                                        openEditItemModal(index)

                                                    }

                                                >

                                                    <FaEdit />

                                                </button>

                                                <button

                                                    type="button"

                                                    className="sales-order-icon-btn delete"

                                                    title="Remove item"

                                                    onClick={() =>

                                                        removeItem(index)

                                                    }

                                                >

                                                    <FaTrash />

                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>



                {/* Totals */}

                <section className="sales-order-total-card">

                    <div className="sales-order-total-title">

                        <FaReceipt /> Order Summary

                    </div>

                    <div className="sales-order-total-row">

                        <span>Subtotal</span>

                        <strong>₹{formatAmount(formData.subtotal)}</strong>

                    </div>

                    <div className="sales-order-total-row">

                        <span>Discount</span>

                        <strong>− ₹{formatAmount(formData.discountAmount)}</strong>

                    </div>

                    <div className="sales-order-total-row">

                        <span>Tax</span>

                        <strong>₹{formatAmount(formData.taxAmount)}</strong>

                    </div>

                    <div className="sales-order-total-divider" />

                    <div className="sales-order-total-row sales-order-grand-total">

                        <span>Total Amount</span>

                        <strong>

                            <FaRupeeSign />

                            {formatAmount(formData.totalAmount)}

                        </strong>

                    </div>

                </section>



                {/* Form actions */}

                <div className="sales-order-form-actions">

                    <Link

                        to="/sales-orders"

                        className="sales-order-cancel-btn"

                    >

                        Cancel

                    </Link>

                    <button

                        type="submit"

                        className="sales-order-save-btn"

                        disabled={loading}

                    >

                        <FaSave />

                        {loading

                            ? "Saving..."

                            : isEditMode

                                ? "Update Sales Order"

                                : "Save Sales Order"}

                    </button>

                </div>

            </form>



            {/* Add/Edit item modal */}

            {itemModalOpen && (

                <div

                    className="sales-order-modal-overlay"

                    onMouseDown={(e) => {

                        if (e.target === e.currentTarget) {

                            closeItemModal();

                        }

                    }}

                >

                    <div

                        className="sales-order-item-modal"

                        role="dialog"

                        aria-modal="true"

                        aria-labelledby="sales-order-item-modal-title"

                    >

                        <div className="sales-order-modal-header">

                            <div className="sales-order-section-heading">

                                <span className="sales-order-section-icon">

                                    {editingItemIndex !== null

                                        ? <FaEdit />

                                        : <FaBoxOpen />}

                                </span>

                                <div>

                                    <h3 id="sales-order-item-modal-title">

                                        {editingItemIndex !== null

                                            ? "Edit Order Item"

                                            : "Add Product to Order"}

                                    </h3>

                                    <p>

                                        Select a product and enter pricing details

                                    </p>

                                </div>

                            </div>

                            <button

                                type="button"

                                className="sales-order-modal-close"

                                onClick={closeItemModal}

                                aria-label="Close popup"

                            >

                                <FaTimes />

                            </button>

                        </div>



                        <form onSubmit={saveItem}>

                            <div className="sales-order-modal-body">

                                <div className="sales-order-form-group sales-order-full-width">

                                    <label>

                                        <FaBoxOpen /> Product <span>*</span>

                                    </label>

                                    <select

                                        name="productId"

                                        value={itemDraft.productId}

                                        onChange={handleDraftProductChange}

                                        required

                                    >

                                        <option value="">Select product</option>

                                        {products.map((product) => {

                                            const productId =

                                                product.id ?? product.productId;



                                            return (

                                                <option

                                                    key={productId}

                                                    value={productId}

                                                >

                                                    {product.name ??

                                                        product.productName ??

                                                        `Product ${productId}`}

                                                </option>

                                            );

                                        })}

                                    </select>

                                    {products.length === 0 && (

                                        <small>

                                            No products loaded. Check the Products API.

                                        </small>

                                    )}

                                </div>



                                <div className="sales-order-form-grid modal-grid">

                                    <div className="sales-order-form-group">

                                        <label>Quantity <span>*</span></label>

                                        <input

                                            type="number"

                                            name="quantity"

                                            min="0.01"

                                            step="0.01"

                                            value={itemDraft.quantity}

                                            onChange={handleDraftChange}

                                            required

                                        />

                                    </div>



                                    <div className="sales-order-form-group">

                                        <label>

                                            <FaRupeeSign /> Unit Price <span>*</span>

                                        </label>

                                        <input

                                            type="number"

                                            name="unitPrice"

                                            min="0"

                                            step="0.01"

                                            value={itemDraft.unitPrice}

                                            onChange={handleDraftChange}

                                            required

                                        />

                                    </div>



                                    <div className="sales-order-form-group">

                                        <label>

                                            <FaPercent /> Discount Amount

                                        </label>

                                        <input

                                            type="number"

                                            name="discountAmount"

                                            min="0"

                                            step="0.01"

                                            value={itemDraft.discountAmount}

                                            onChange={handleDraftChange}

                                        />

                                    </div>



                                    <div className="sales-order-form-group">

                                        <label>

                                            <FaReceipt /> Tax Amount

                                        </label>

                                        <input

                                            type="number"

                                            name="taxAmount"

                                            min="0"

                                            step="0.01"

                                            value={itemDraft.taxAmount}

                                            onChange={handleDraftChange}

                                        />

                                    </div>

                                </div>



                                <div className="sales-order-modal-preview">

                                    <div>

                                        <span>Line total</span>

                                        <small>

                                            Qty × price − discount + tax

                                        </small>

                                    </div>

                                    <strong>

                                        ₹{formatAmount(

                                            calculateItemTotal(itemDraft)

                                        )}

                                    </strong>

                                </div>

                            </div>



                            <div className="sales-order-modal-footer">

                                <button

                                    type="button"

                                    className="sales-order-cancel-btn"

                                    onClick={closeItemModal}

                                >

                                    Cancel

                                </button>

                                <button

                                    type="submit"

                                    className="sales-order-save-btn"

                                >

                                    <FaCheckCircle />

                                    {editingItemIndex !== null

                                        ? "Update Item"

                                        : "Add Item"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};



export default SalesOrderForm;
