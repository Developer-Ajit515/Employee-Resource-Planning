import React, { useEffect, useState } from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import toast from "react-hot-toast";

import SalesOrderService from "../../services/salesOrderService";

import "./SalesOrder.css";


const SalesOrderDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [order, setOrder] = useState(null);

    const [loading, setLoading] = useState(true);


    // ==========================================
    // Load Sales Order
    // ==========================================

    const loadOrder = async () => {

        try {

            setLoading(true);

            const data =
                await SalesOrderService.getSalesOrderById(id);

            setOrder(data);

        } catch (error) {

            console.error(
                "Sales order details error:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                "Failed to load sales order"
            );

            navigate("/sales-orders");

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadOrder();

    }, [id]);


    // ==========================================
    // Format Date
    // ==========================================

    const formatDate = (date) => {

        if (!date) {

            return "-";

        }

        const parsedDate =
            new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {

            return "-";

        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==========================================
    // Format Amount
    // ==========================================

    const formatAmount = (amount) => {

        return Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    // ==========================================
    // Status
    // ==========================================

    const getStatusClass = (status) => {

        switch (
            status?.toString().toLowerCase()
        ) {

            case "completed":
            case "delivered":
                return "completed";

            case "confirmed":
            case "approved":
                return "confirmed";

            case "cancelled":
            case "canceled":
                return "cancelled";

            case "processing":
                return "processing";

            default:
                return "pending";

        }

    };


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (

            <div className="sales-order-loading-page">

                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p>
                    Loading sales order details...
                </p>

            </div>

        );

    }


    if (!order) {

        return (

            <div className="sales-order-empty">

                <div className="sales-order-empty-icon">
                    🛒
                </div>

                <h5>
                    Sales Order Not Found
                </h5>

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate("/sales-orders")
                    }
                >

                    Back to Sales Orders

                </button>

            </div>

        );

    }


    const orderNumber =
        order.orderNumber ||
        order.salesOrderNumber ||
        order.code ||
        `SO-${order.id}`;


    const customerName =
        order.customer?.name ||
        order.customerName ||
        "-";


    const items =
        order.items ||
        order.salesOrderItems ||
        order.orderItems ||
        [];


    return (

        <div className="sales-order-page">

            {/* ==================================
                Header
            ================================== */}

            <div className="sales-order-page-header">

                <div>

                    <h3 className="sales-order-page-title">

                        Sales Order Details

                    </h3>

                    <p className="sales-order-page-subtitle">

                        View sales order information

                    </p>

                </div>


                <div>

                    <Link
                        to="/sales-orders"
                        className="btn btn-outline-secondary me-2"
                    >

                        ← Back

                    </Link>


                    <Link
                        to={`/sales-orders/edit/${order.id}`}
                        className="btn btn-primary"
                    >

                        Edit Order

                    </Link>

                </div>

            </div>


            {/* ==================================
                Order Summary
            ================================== */}

            <div className="row">

                <div className="col-lg-4 mb-3">

                    <div className="card sales-order-summary-card">

                        <div className="card-body">

                            <div className="sales-order-detail-icon">
                                🛒
                            </div>


                            <h4 className="sales-order-detail-number">

                                {orderNumber}

                            </h4>


                            <p className="sales-order-detail-customer">

                                {customerName}

                            </p>


                            <span
                                className={`sales-order-status ${getStatusClass(
                                    order.status
                                )}`}
                            >

                                {order.status || "Pending"}

                            </span>


                            <div className="sales-order-summary-divider" />


                            <div className="sales-order-summary-row">

                                <span>
                                    Order Date
                                </span>

                                <strong>
                                    {formatDate(
                                        order.orderDate ||
                                        order.date ||
                                        order.createdAt
                                    )}
                                </strong>

                            </div>


                            <div className="sales-order-summary-row">

                                <span>
                                    Customer ID
                                </span>

                                <strong>
                                    {order.customerId || "-"}
                                </strong>

                            </div>


                            <div className="sales-order-summary-row">

                                <span>
                                    Total Amount
                                </span>

                                <strong className="sales-order-total">

                                    ₹
                                    {formatAmount(
                                        order.totalAmount ||
                                        order.total ||
                                        order.grandTotal
                                    )}

                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    Information
                ================================== */}

                <div className="col-lg-8 mb-3">

                    <div className="card sales-order-details-card">

                        <div className="card-header">

                            <h5 className="mb-0">
                                Sales Order Information
                            </h5>

                        </div>


                        <div className="card-body">

                            <div className="row">

                                <div className="col-md-6 mb-4">

                                    <div className="sales-order-detail-label">
                                        Order Number
                                    </div>

                                    <div className="sales-order-detail-value">
                                        {orderNumber}
                                    </div>

                                </div>


                                <div className="col-md-6 mb-4">

                                    <div className="sales-order-detail-label">
                                        Customer
                                    </div>

                                    <div className="sales-order-detail-value">
                                        {customerName}
                                    </div>

                                </div>


                                <div className="col-md-6 mb-4">

                                    <div className="sales-order-detail-label">
                                        Order Date
                                    </div>

                                    <div className="sales-order-detail-value">
                                        {formatDate(
                                            order.orderDate ||
                                            order.date ||
                                            order.createdAt
                                        )}
                                    </div>

                                </div>


                                <div className="col-md-6 mb-4">

                                    <div className="sales-order-detail-label">
                                        Status
                                    </div>

                                    <div className="sales-order-detail-value">

                                        <span
                                            className={`sales-order-status ${getStatusClass(
                                                order.status
                                            )}`}
                                        >

                                            {order.status ||
                                                "Pending"}

                                        </span>

                                    </div>

                                </div>


                                <div className="col-md-6 mb-4">

                                    <div className="sales-order-detail-label">
                                        Customer ID
                                    </div>

                                    <div className="sales-order-detail-value">
                                        {order.customerId || "-"}
                                    </div>

                                </div>


                                <div className="col-md-6 mb-4">

                                    <div className="sales-order-detail-label">
                                        Order ID
                                    </div>

                                    <div className="sales-order-detail-value">
                                        #{order.id}
                                    </div>

                                </div>


                                <div className="col-12 mb-3">

                                    <div className="sales-order-detail-label">
                                        Shipping Address
                                    </div>

                                    <div className="sales-order-detail-value">

                                        {order.shippingAddress ||
                                            order.address ||
                                            "-"}

                                    </div>

                                </div>


                                <div className="col-12">

                                    <div className="sales-order-detail-label">
                                        Notes
                                    </div>

                                    <div className="sales-order-detail-value">

                                        {order.notes || "-"}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================
                Order Items
            ================================== */}

            {items.length > 0 && (

                <div className="card sales-order-items-card">

                    <div className="card-header">

                        <h5 className="mb-0">
                            Order Items
                        </h5>

                    </div>


                    <div className="table-responsive">

                        <table className="table sales-order-items-table mb-0">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Unit Price
                                    </th>

                                    <th className="text-end">
                                        Total
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {items.map(
                                    (item, index) => {

                                        const quantity =
                                            item.quantity ||
                                            item.qty ||
                                            0;

                                        const price =
                                            item.unitPrice ||
                                            item.price ||
                                            0;

                                        const total =
                                            item.total ||
                                            item.totalPrice ||
                                            quantity * price;


                                        return (

                                            <tr
                                                key={
                                                    item.id ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>

                                                    {item.product?.name ||
                                                        item.productName ||
                                                        item.name ||
                                                        "-"}

                                                </td>

                                                <td>
                                                    {quantity}
                                                </td>

                                                <td>

                                                    ₹
                                                    {formatAmount(
                                                        price
                                                    )}

                                                </td>

                                                <td className="text-end">

                                                    <strong>

                                                        ₹
                                                        {formatAmount(
                                                            total
                                                        )}

                                                    </strong>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>

    );

};


export default SalesOrderDetails;