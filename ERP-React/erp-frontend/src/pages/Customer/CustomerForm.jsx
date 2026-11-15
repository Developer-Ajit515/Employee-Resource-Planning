
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FaUserPlus,
    FaUserEdit,
    FaTimes,
    FaSave,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaArrowLeft,
} from "react-icons/fa";

import CustomerService from "../../services/customerService";
import "./Customer.css";

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    isActive: true,
};

const unwrapCustomer = (response) =>
    response?.data?.data ?? response?.data ?? response;

const CustomerForm = ({
    customerId,
    isModal = false,
    onClose,
    onSaved,
}) => {
    const navigate = useNavigate();
    const params = useParams();

    const id = customerId ?? params.id;
    const isEdit = id !== undefined && id !== null && id !== "";

    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadCustomer = async () => {
            if (!isEdit) {
                setFormData(emptyForm);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const response = await CustomerService.getById(id);
                const customer = unwrapCustomer(response);

                if (cancelled) return;

                setFormData({
                    name: customer.name ?? customer.Name ?? "",
                    email: customer.email ?? customer.Email ?? "",
                    phone: customer.phone ?? customer.Phone ?? "",
                    address: customer.address ?? customer.Address ?? "",
                    isActive:
                        customer.isActive ?? customer.IsActive ?? true,
                });
            } catch (error) {
                console.error("Load customer error:", error);

                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to load customer"
                    );

                    if (isModal) {
                        onClose?.();
                    } else {
                        navigate("/customers");
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadCustomer();

        return () => {
            cancelled = true;
        };
    }, [id, isEdit, isModal, navigate, onClose]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Customer name is required");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                isActive: Boolean(formData.isActive),
            };

            if (isEdit) {
                await CustomerService.update(id, payload);
                toast.success("Customer updated successfully");
            } else {
                await CustomerService.create(payload);
                toast.success("Customer created successfully");
            }

            if (isModal) {
                await onSaved?.();
            } else {
                navigate("/customers");
            }
        } catch (error) {
            console.error("Customer save error:", error);

            const apiError = error?.response?.data;
            const message =
                apiError?.message ||
                apiError?.title ||
                (typeof apiError === "string" ? apiError : null) ||
                "Failed to save customer";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (saving) return;

        if (isModal) {
            onClose?.();
        } else {
            navigate("/customers");
        }
    };

    if (loading) {
        return (
            <div className="customer-form-loading">
                <span className="spinner-border text-primary" role="status" />
                <p>Loading customer...</p>
            </div>
        );
    }

    return (
        <div className={isModal ? "customer-form-modal-content" : "customer-page"}>
            <div className="customer-form-heading">
                <div className="customer-form-heading-main">
                    <div className="customer-form-heading-icon">
                        {isEdit ? <FaUserEdit /> : <FaUserPlus />}
                    </div>
                    <div>
                        <h2 id="customer-modal-title" className="customer-page-title">
                            {isEdit ? "Edit Customer" : "Add Customer"}
                        </h2>
                        <p className="customer-page-subtitle">
                            {isEdit
                                ? "Update customer contact information"
                                : "Enter the information to create a customer"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="customer-modal-close"
                    onClick={handleClose}
                    disabled={saving}
                    aria-label="Close customer form"
                    title="Close"
                >
                    {isModal ? <FaTimes /> : <FaArrowLeft />}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
                <div className="customer-form-section-title">
                    <FaUser />
                    <span>Customer Information</span>
                </div>

                <div className="customer-form-grid">
                    <div className="customer-form-field">
                        <label htmlFor="customer-name">
                            Customer Name <span>*</span>
                        </label>
                        <div className="customer-input-wrapper">
                            <FaUser />
                            <input
                                id="customer-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter customer name"
                                maxLength={150}
                                required
                                autoFocus={isModal}
                            />
                        </div>
                    </div>

                    <div className="customer-form-field">
                        <label htmlFor="customer-email">Email Address</label>
                        <div className="customer-input-wrapper">
                            <FaEnvelope />
                            <input
                                id="customer-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="customer@example.com"
                                maxLength={254}
                            />
                        </div>
                    </div>

                    <div className="customer-form-field">
                        <label htmlFor="customer-phone">Phone Number</label>
                        <div className="customer-input-wrapper">
                            <FaPhone />
                            <input
                                id="customer-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                maxLength={30}
                            />
                        </div>
                    </div>

                    <div className="customer-form-field">
                        <label htmlFor="customer-address">Address</label>
                        <div className="customer-input-wrapper">
                            <FaMapMarkerAlt />
                            <input
                                id="customer-address"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter customer address"
                                maxLength={300}
                            />
                        </div>
                    </div>
                </div>

                <label className="customer-active-toggle">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                    />
                    <span className="customer-toggle-icon">
                        <FaCheckCircle />
                    </span>
                    <span>
                        <strong>Active Customer</strong>
                        <small>Allow this customer to remain active</small>
                    </span>
                </label>

                <div className="customer-form-actions">
                    <button
                        type="button"
                        className="customer-form-cancel"
                        onClick={handleClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="customer-form-submit"
                        disabled={saving || loading}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                {isEdit ? "Update Customer" : "Save Customer"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
