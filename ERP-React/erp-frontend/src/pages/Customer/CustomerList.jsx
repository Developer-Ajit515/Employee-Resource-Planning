
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
    FaUsers,
    FaUserPlus,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaSearch,
    FaEye,
    FaEdit,
    FaTrash,
    FaSyncAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaAddressBook,
    FaUserCheck,
    FaUserSlash,
    FaPlus,
    FaRedo,
} from "react-icons/fa";

import CustomerService from "../../services/customerService";
import CustomerForm from "./CustomerForm";
import "./Customer.css";

const getCustomersArray = (response) => {
    const result = response?.data ?? response;

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.items)) return result.data.items;

    return [];
};

const normalizeCustomer = (customer) => ({
    ...customer,
    id: customer.id ?? customer.customerId ?? customer.CustomerId,
    name: customer.name ?? customer.Name ?? "",
    email: customer.email ?? customer.Email ?? "",
    phone: customer.phone ?? customer.Phone ?? "",
    address: customer.address ?? customer.Address ?? "",
    isActive: customer.isActive ?? customer.IsActive,
});

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await CustomerService.getAll();
            setCustomers(getCustomersArray(response).map(normalizeCustomer));
        } catch (error) {
            console.error("Customer loading error:", error);
            toast.error(
                error?.response?.data?.message || "Failed to load customers"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const openAddModal = () => {
        setSelectedCustomerId(null);
        setModalOpen(true);
    };

    const openEditModal = (id) => {
        setSelectedCustomerId(id);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCustomerId(null);
    };

    const handleSaved = async () => {
        closeModal();
        await loadCustomers();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Customer?",
            text: "Are you sure you want to delete this customer?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await CustomerService.delete(id);
            toast.success("Customer deleted successfully");
            await loadCustomers();
        } catch (error) {
            console.error("Delete customer error:", error);
            toast.error(
                error?.response?.data?.message || "Failed to delete customer"
            );
        }
    };

    const filteredCustomers = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return customers.filter((customer) => {
            const matchesSearch = [
                customer.name,
                customer.email,
                customer.phone,
                customer.address,
                customer.id,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(searchText)
            );

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && customer.isActive === true) ||
                (statusFilter === "inactive" && customer.isActive === false);

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    const activeCount = customers.filter(
        (customer) => customer.isActive === true
    ).length;

    const inactiveCount = customers.filter(
        (customer) => customer.isActive === false
    ).length;

    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <div className="customer-heading-main">
                    <div className="customer-heading-icon">
                        <FaUsers />
                    </div>
                    <div>
                        <h2 className="customer-page-title">
                            Customer Management
                        </h2>
                        <p className="customer-page-subtitle">
                            Manage customer profiles and contact information
                        </p>
                    </div>
                </div>

                <div className="customer-header-actions">
                    <button
                        type="button"
                        className="customer-refresh-btn"
                        onClick={loadCustomers}
                        disabled={loading}
                    >
                        <FaRedo className={loading ? "customer-spin" : ""} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        className="customer-add-btn"
                        onClick={openAddModal}
                    >
                        <FaUserPlus />
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="customer-summary-grid">
                <div className="customer-summary-card">
                    <div className="customer-summary-icon customer-purple">
                        <FaUsers />
                    </div>
                    <div>
                        <span>Total Customers</span>
                        <strong>{customers.length}</strong>
                        <small>All registered customers</small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon customer-green">
                        <FaUserCheck />
                    </div>
                    <div>
                        <span>Active Customers</span>
                        <strong>{activeCount}</strong>
                        <small>Active customer accounts</small>
                    </div>
                </div>

                <div className="customer-summary-card">
                    <div className="customer-summary-icon customer-orange">
                        <FaUserSlash />
                    </div>
                    <div>
                        <span>Inactive Customers</span>
                        <strong>{inactiveCount}</strong>
                        <small>Inactive customer accounts</small>
                    </div>
                </div>
            </div>

            <div className="card customer-card">
                <div className="customer-card-heading">
                    <div className="customer-table-heading">
                        <div className="customer-table-heading-icon">
                            <FaAddressBook />
                        </div>
                        <div>
                            <h3>Customer Directory</h3>
                            <p>View and manage your customer records</p>
                        </div>
                    </div>

                    <div className="customer-toolbar">
                        <div className="customer-search">
                            <FaSearch />
                            <input
                                type="search"
                                placeholder="Search name, email, phone..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Search customers"
                            />
                        </div>

                        <select
                            className="customer-status-filter"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            aria-label="Filter by status"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="customer-results-bar">
                    <span>
                        <FaUsers />
                        Showing <strong>{filteredCustomers.length}</strong> of{" "}
                        <strong>{customers.length}</strong> customers
                    </span>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="customer-loading">
                            <FaSyncAlt className="customer-spin" />
                            <p>Loading customers...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="customer-empty">
                            <div className="customer-empty-icon">
                                <FaUsers />
                            </div>
                            <h3>No Customers Found</h3>
                            <p>
                                {search || statusFilter !== "all"
                                    ? "Try changing your search or status filter."
                                    : "Start by adding your first customer."}
                            </p>

                            {search || statusFilter !== "all" ? (
                                <button
                                    type="button"
                                    className="customer-reset-btn"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("all");
                                    }}
                                >
                                    <FaRedo /> Clear Filters
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="customer-add-btn"
                                    onClick={openAddModal}
                                >
                                    <FaPlus /> Add Customer
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table customer-table mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCustomers.map((customer, index) => (
                                        <tr key={customer.id ?? index}>
                                            <td>
                                                <span className="customer-row-number">
                                                    {index + 1}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="customer-name-wrapper">
                                                    <div className="customer-avatar">
                                                        {customer.name
                                                            .trim()
                                                            .charAt(0)
                                                            .toUpperCase() || "C"}
                                                    </div>
                                                    <div className="customer-name-details">
                                                        <Link
                                                            to={`/customers/details/${customer.id}`}
                                                            className="customer-name"
                                                        >
                                                            {customer.name ||
                                                                "Unnamed Customer"}
                                                        </Link>
                                                        <small>
                                                            ID: {customer.id}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-contact-cell">
                                                    <FaEnvelope />
                                                    <span>{customer.email || "-"}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-contact-cell">
                                                    <FaPhone />
                                                    <span>{customer.phone || "-"}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-contact-cell customer-address-cell">
                                                    <FaMapMarkerAlt />
                                                    <span>{customer.address || "-"}</span>
                                                </div>
                                            </td>

                                            <td>
                                                {customer.isActive === true ? (
                                                    <span className="customer-status-badge active">
                                                        <FaCheckCircle /> Active
                                                    </span>
                                                ) : customer.isActive === false ? (
                                                    <span className="customer-status-badge inactive">
                                                        <FaTimesCircle /> Inactive
                                                    </span>
                                                ) : (
                                                    <span className="customer-status-badge unknown">
                                                        Unknown
                                                    </span>
                                                )}
                                            </td>

                                            <td className="text-end">
                                                <div className="customer-row-actions">
                                                    {/* View opens the separate details page */}
                                                    <Link
                                                        to={`/customers/details/${customer.id}`}
                                                        className="customer-icon-btn view"
                                                        title="View customer details"
                                                        aria-label="View customer details"
                                                    >
                                                        <FaEye />
                                                    </Link>

                                                    {/* Edit opens modal */}
                                                    <button
                                                        type="button"
                                                        className="customer-icon-btn edit"
                                                        title="Edit customer"
                                                        aria-label="Edit customer"
                                                        onClick={() =>
                                                            openEditModal(customer.id)
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="customer-icon-btn delete"
                                                        title="Delete customer"
                                                        aria-label="Delete customer"
                                                        onClick={() =>
                                                            handleDelete(customer.id)
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && (
                <div
                    className="customer-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <section
                        className="customer-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="customer-modal-title"
                    >
                        <CustomerForm
                            key={selectedCustomerId ?? "new-customer"}
                            customerId={selectedCustomerId}
                            isModal
                            onClose={closeModal}
                            onSaved={handleSaved}
                        />
                    </section>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
