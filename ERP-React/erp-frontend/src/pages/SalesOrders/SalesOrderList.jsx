import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import Swal from "sweetalert2";

import toast from "react-hot-toast";

import {

  FaBoxOpen,

  FaWallet,

  FaReceipt,

  FaPercent,

  FaPlus,

  FaSearch,

  FaTimes,

  FaShoppingCart,

} from "react-icons/fa";

import { createPortal } from "react-dom";

import SalesOrderService from "../../services/salesOrderService";

import SalesOrderForm from "./SalesOrderForm";

import "./SalesOrder.css";





const SalesOrderList = () => {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState(null);



  const openAddModal = () => {

  setSelectedOrderId(null);

  setModalOpen(true);

};



  const openEditModal = (id) => {

  setSelectedOrderId(id);

  setModalOpen(true);

};



  const closeModal = () => {

  setModalOpen(false);

  setSelectedOrderId(null);

};



  const handleModalSaved = async () => {

  closeModal();

  await loadOrders();

};



  // ------------------------------------------*

  // Load Sales Orders*

  // ------------------------------------------*

  const loadOrders = async () => {

    try {

      setLoading(true);



      const response = await SalesOrderService.getSalesOrders();
      const body = response?.data ?? response;
      const data = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.items)
        ? body.items
        : Array.isArray(body?.$values)
        ? body.$values
        : Array.isArray(body?.data?.$values)
        ? body.data.$values
        : [];

      setOrders(data);

    } catch (error) {

      console.error("Sales order loading error:", error);



      toast.error(

        error?.response?.data?.message ||

          "Failed to load sales orders"

      );



      setOrders([]);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    loadOrders();

  }, []);



  // ------------------------------------------*

  // Helpers*

  // ------------------------------------------*

  const getOrderId = (order) =>

    order.id ?? order.salesOrderId ?? order.orderId;



  const getOrderNumber = (order) =>

    order.orderNumber ||

    order.salesOrderNumber ||

    order.code ||

    `SO-${getOrderId(order)}`;



  const getCustomerName = (order) =>

    order.customer?.name ||

    order.customer?.customerName ||

    order.customerName ||

    "-";



  const getOrderAmount = (order) =>

    Number(

      order.totalAmount ??

        order.total ??

        order.grandTotal ??

        0

    );



  const formatAmount = (amount) =>

    Number(amount || 0).toLocaleString("en-IN", {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

    });



  const formatDate = (date) => {

    if (!date) return "-";



    const parsedDate = new Date(date);



    if (Number.isNaN(parsedDate.getTime())) {

      return "-";

    }



    return parsedDate.toLocaleDateString("en-IN", {

      day: "2-digit",

      month: "short",

      year: "numeric",

    });

  };



  const getStatusClass = (status) => {

    switch (String(status || "").toLowerCase()) {

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



      case "pending":

      case "draft":

      default:

        return "pending";

    }

  };



  // ------------------------------------------*

  // Delete Sales Order*

  // ------------------------------------------*

  const handleDelete = async (id) => {

    if (id == null) {

      toast.error("Sales order ID is missing.");

      return;

    }



    const result = await Swal.fire({

      title: "Delete Sales Order?",

      text: "This sales order will be permanently deleted.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#dc3545",

      cancelButtonColor: "#6c757d",

      confirmButtonText: "Yes, Delete",

      cancelButtonText: "Cancel",

    });



    if (!result.isConfirmed) return;



    try {

      await SalesOrderService.deleteSalesOrder(id);



      toast.success("Sales order deleted successfully");

      await loadOrders();

    } catch (error) {

      console.error("Delete sales order error:", error);



      toast.error(

        error?.response?.data?.message ||

          "Failed to delete sales order"

      );

    }

  };



  // ------------------------------------------*

  // Search*

  // ------------------------------------------*

  const searchText = search.toLowerCase().trim();



  const filteredOrders = orders.filter((order) => {

    const orderNumber = getOrderNumber(order).toLowerCase();

    const customerName = getCustomerName(order).toLowerCase();

    const status = String(order.status || "").toLowerCase();



    return (

      orderNumber.includes(searchText) ||

      customerName.includes(searchText) ||

      status.includes(searchText)

    );

  });



  // ------------------------------------------*

  // Summary Cards*

  // ------------------------------------------*

  const totalOrders = orders.length;



  const totalSales = orders.reduce(

    (sum, order) => sum + getOrderAmount(order),

    0

  );



  const pendingOrders = orders.filter((order) =>

    ["pending", "draft"].includes(

      String(order.status || "").toLowerCase()

    )

  ).length;



  const completedOrders = orders.filter((order) =>

    ["completed", "delivered"].includes(

      String(order.status || "").toLowerCase()

    )

  ).length;



  // ------------------------------------------*

  // UI*

  // ------------------------------------------*

  return (

    <div className="sales-order-page">

      {/* Header */}

      <div className="sales-order-page-header">

        <div>

          <h3 className="sales-order-page-title">

            Sales Orders

          </h3>



          <p className="sales-order-page-subtitle">

            Manage customer sales orders and order information

          </p>

        </div>



        <button

  type="button"

  className="btn btn-primary sales-order-add-btn"

  onClick={openAddModal}

>

  <FaPlus className="me-2" />

  Add Sales Order

</button>

      </div>



      {/* Search Toolbar */}

      <div className="sales-order-toolbar">

        <div className="sales-order-search">

          <FaSearch className="sales-order-search-icon" />



          <input

            type="text"

            className="form-control"

            placeholder="Search order number, customer or status..."

            value={search}

            onChange={(e) => setSearch(e.target.value)}

          />

        </div>

      </div>



      {/* Summary Cards */}

      <div className="so-summary-grid">

        <div className="so-summary-card">

          <div className="so-summary-icon subtotal">

            <FaBoxOpen />

          </div>



          <div>

            <p>Total Orders</p>

            <h3>{totalOrders}</h3>

          </div>

        </div>



        <div className="so-summary-card">

          <div className="so-summary-icon total">

            <FaWallet />

          </div>



          <div>

            <p>Total Sales</p>

            <h3>₹{formatAmount(totalSales)}</h3>

          </div>

        </div>



        <div className="so-summary-card">

          <div className="so-summary-icon discount">

            <FaReceipt />

          </div>



          <div>

            <p>Pending / Draft</p>

            <h3>{pendingOrders}</h3>

          </div>

        </div>



        <div className="so-summary-card">

          <div className="so-summary-icon tax">

            <FaPercent />

          </div>



          <div>

            <p>Completed Orders</p>

            <h3>{completedOrders}</h3>

          </div>

        </div>

      </div>



      {/* Sales Orders Table */}

      <div className="card sales-order-card">

        <div className="card-body p-0">

          {loading ? (

            <div className="sales-order-loading">

              <div

                className="spinner-border text-primary"

                role="status"

              />



              <p>Loading sales orders...</p>

            </div>

          ) : filteredOrders.length === 0 ? (

            <div className="sales-order-empty">

              <div className="sales-order-empty-icon">

                <FaShoppingCart />

              </div>



              <h5>

                {search

                  ? "No Sales Orders Found"

                  : "No Sales Orders Yet"}

              </h5>



              <p>

                {search

                  ? "No sales order matches your search."

                  : "Start by creating your first sales order."}

              </p>



              {!search && (

                <Link

                  to="/sales-orders/add"

                  className="btn btn-primary"

                >

                  <FaPlus className="me-2" />

                  Add Sales Order

                </Link>

              )}

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table sales-order-table mb-0">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Order Number</th>

                    <th>Customer</th>

                    <th>Order Date</th>

                    <th>Total Amount</th>

                    <th>Status</th>

                    <th className="text-end">Actions</th>

                  </tr>

                </thead>



                <tbody>

                  {filteredOrders.map((order, index) => {

                    const id = getOrderId(order);

                    const orderNumber = getOrderNumber(order);

                    const customerName = getCustomerName(order);



                    return (

                      <tr key={id ?? orderNumber}>

                        <td>{index + 1}</td>



                        <td>

                          <Link

                            to={`/sales-orders/details/${id}`}

                            className="sales-order-number"

                          >

                            {orderNumber}

                          </Link>

                        </td>



                        <td>

                          <div className="sales-order-customer">

                            <div className="sales-order-avatar">

                              {customerName

                                .charAt(0)

                                .toUpperCase() || "C"}

                            </div>



                            <span>{customerName}</span>

                          </div>

                        </td>



                        <td>

                          {formatDate(

                            order.orderDate ||

                              order.date ||

                              order.createdAt

                          )}

                        </td>



                        <td>

                          <strong className="sales-order-amount">

                            ₹{formatAmount(getOrderAmount(order))}

                          </strong>

                        </td>



                        <td>

                          <span

                            className={`sales-order-status ${getStatusClass(

                              order.status

                            )}`}

                          >

                            {order.status || "Pending"}

                          </span>

                        </td>



                        <td className="text-end">

                          <Link

                            to={`/sales-orders/details/${id}`}

                            className="btn btn-sm btn-outline-secondary me-1"

                          >

                            View

                          </Link>



                          <button

  type="button"

  className="btn btn-sm btn-outline-primary me-1"

  onClick={() => openEditModal(getOrderId(order))}

>

  Edit

</button>



                          <button

                            type="button"

                            className="btn btn-sm btn-outline-danger"

                            onClick={() => handleDelete(id)}

                          >

                            Delete

                          </button>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>
      </div>

      {modalOpen &&
        createPortal(
          <div
            className="sales-order-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="sales-order-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={selectedOrderId ? "Edit sales order" : "Add sales order"}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="sales-order-modal-content">
                <SalesOrderForm
                  key={selectedOrderId ?? "new-sales-order"}
                  modalMode={true}
                  orderId={selectedOrderId}
                  onClose={closeModal}
                  onSaved={handleModalSaved}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

  );

};



export default SalesOrderList;
