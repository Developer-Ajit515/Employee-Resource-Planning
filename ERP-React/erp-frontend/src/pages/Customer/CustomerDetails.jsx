
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaArrowLeft,
    FaEdit,
    FaCheckCircle,
    FaTimesCircle,
    FaAddressCard,
} from "react-icons/fa";

import CustomerService from "../../services/customerService";
import "./Customer.css";

const unwrapCustomer = (response) =>
    response?.data?.data ?? response?.data ?? response;

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadCustomer = useCallback(async () => {
        try {
            setLoading(true);

            const response = await CustomerService.getById(id);
            const data = unwrapCustomer(response);

            if (!data || typeof data !== "object") {
                throw new Error("Customer was not found");
            }

            setCustomer({
                ...data,
                id: data.id ?? data.customerId ?? data.CustomerId,
                name: data.name ?? data.Name ?? "",
                email: data.email ?? data.Email ?? "",
                phone: data.phone ?? data.Phone ?? "",
                address: data.address ?? data.Address ?? "",
                isActive: data.isActive ?? data.IsActive,
            });
        } catch (error) {
            console.error("Customer details error:", error);
            toast.error(
                error?.response?.data?.message ||
                    error.message ||
                    "Failed to load customer"
            );
            navigate("/customers", { replace: true });
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadCustomer();
    }, [loadCustomer]);

    if (loading) {
        return (
            <div className="customer-loading-page">
                <span className="spinner-border text-primary" role="status" />
                <p>Loading customer details...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="customer-page">
                <div className="customer-empty">
                    <h3>Customer not found</h3>
                    <Link to="/customers" className="customer-add-btn">
                        <FaArrowLeft /> Back to Customers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <div className="customer-heading-main">
                    <div className="customer-heading-icon">
                        <FaAddressCard />
                    </div>
                    <div>
                        <h2 className="customer-page-title">
                            Customer Details
                        </h2>
                        <p className="customer-page-subtitle">
                            Customer profile and contact information
                        </p>
                    </div>
                </div>

                <div className="customer-header-actions">
                    <Link to="/customers" className="customer-detail-back">
                        <FaArrowLeft /> Back
                    </Link>
                    <Link
                        to={`/customers/edit/${customer.id}`}
                        className="customer-add-btn"
                    >
                        <FaEdit /> Edit Customer
                    </Link>
                </div>
            </div>

            <div className="customer-detail-layout">
                <div className="customer-detail-profile">
                    <div className="customer-detail-avatar">
                        {customer.name.trim().charAt(0).toUpperCase() || "C"}
                    </div>

                    <h3>{customer.name || "Unnamed Customer"}</h3>
                    <p>Customer ID: #{customer.id}</p>

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
                            Status Unknown
                        </span>
                    )}
                </div>

                <div className="customer-detail-information">
                    <div className="customer-detail-card-heading">
                        <FaAddressCard />
                        <div>
                            <h3>Contact Information</h3>
                            <p>Registered customer details</p>
                        </div>
                    </div>

                    <div className="customer-detail-grid">
                        <div className="customer-detail-item">
                            <span className="customer-detail-icon">
                                <FaUser />
                            </span>
                            <div>
                                <small>Customer Name</small>
                                <strong>{customer.name || "-"}</strong>
                            </div>
                        </div>

                        <div className="customer-detail-item">
                            <span className="customer-detail-icon">
                                <FaEnvelope />
                            </span>
                            <div>
                                <small>Email Address</small>
                                <strong>{customer.email || "-"}</strong>
                            </div>
                        </div>

                        <div className="customer-detail-item">
                            <span className="customer-detail-icon">
                                <FaPhone />
                            </span>
                            <div>
                                <small>Phone Number</small>
                                <strong>{customer.phone || "-"}</strong>
                            </div>
                        </div>

                        <div className="customer-detail-item">
                            <span className="customer-detail-icon">
                                <FaMapMarkerAlt />
                            </span>
                            <div>
                                <small>Address</small>
                                <strong>{customer.address || "-"}</strong>
                            </div>
                        </div>

                        <div className="customer-detail-item">
                            <span className="customer-detail-icon">
                                <FaAddressCard />
                            </span>
                            <div>
                                <small>Customer ID</small>
                                <strong>#{customer.id}</strong>
                            </div>
                        </div>

                        <div className="customer-detail-item">
                            <span className="customer-detail-icon">
                                {customer.isActive
                                    ? <FaCheckCircle />
                                    : <FaTimesCircle />}
                            </span>
                            <div>
                                <small>Account Status</small>
                                <strong>
                                    {customer.isActive === true
                                        ? "Active"
                                        : customer.isActive === false
                                          ? "Inactive"
                                          : "Unknown"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
