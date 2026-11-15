import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSupplier } from "../../services/supplierService";
import "./Supplier.css";

const SupplierDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSupplier = async () => {
            try {
                const data = await getSupplier(id);
                setSupplier(data);
            } catch (error) {
                console.error(error);
                alert("Unable to load supplier.");
                navigate("/suppliers");
            } finally {
                setLoading(false);
            }
        };

        loadSupplier();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="supplier-page">
                <div className="supplier-loading">
                    Loading supplier details...
                </div>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="supplier-page">
                <div className="supplier-empty-details">
                    Supplier not found.
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-details-page">

            {/* Header */}
            <div className="supplier-details-header">

                <div>
                    <div className="supplier-breadcrumb">
                        <Link to="/suppliers">Suppliers</Link>
                        <span>/</span>
                        <span>Details</span>
                    </div>

                    <div className="supplier-title-row">

                        <div className="supplier-company-icon">
                            {supplier.companyName
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                        </div>

                        <div>
                            <h2>
                                {supplier.companyName}
                            </h2>

                            <p>
                                {supplier.supplierCode || "No supplier code"}
                            </p>
                        </div>

                    </div>
                </div>

                <div className="supplier-details-header-actions">

                    <Link
                        to={`/suppliers/edit/${supplier.id}`}
                        className="supplier-edit-btn"
                    >
                        Edit Supplier
                    </Link>

                    <button
                        className="supplier-back-btn"
                        onClick={() => navigate("/suppliers")}
                    >
                        Back
                    </button>

                </div>

            </div>

            {/* Status */}
            <div className="supplier-status-card">

                <div>
                    <span className="detail-label">
                        Supplier Status
                    </span>

                    <span
                        className={
                            supplier.isActive
                                ? "status-active"
                                : "status-inactive"
                        }
                    >
                        {supplier.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>
                </div>

                <div>
                    <span className="detail-label">
                        Supplier Code
                    </span>

                    <strong>
                        {supplier.supplierCode || "-"}
                    </strong>
                </div>

            </div>

            {/* Basic Information */}
            <div className="supplier-detail-section">

                <div className="detail-section-header">
                    <div>
                        <h3>Basic Information</h3>
                        <p>Supplier company and contact information</p>
                    </div>
                </div>

                <div className="supplier-detail-grid">

                    <DetailItem
                        label="Company Name"
                        value={supplier.companyName}
                    />

                    <DetailItem
                        label="Supplier Code"
                        value={supplier.supplierCode}
                    />

                    <DetailItem
                        label="Contact Person"
                        value={supplier.contactPerson}
                    />

                    <DetailItem
                        label="Email"
                        value={supplier.email}
                    />

                    <DetailItem
                        label="Phone"
                        value={supplier.phone}
                    />

                    <DetailItem
                        label="GST Number"
                        value={supplier.gstNumber}
                    />

                </div>

            </div>

            {/* Address */}
            <div className="supplier-detail-section">

                <div className="detail-section-header">
                    <div>
                        <h3>Address</h3>
                        <p>Supplier location details</p>
                    </div>
                </div>

                <div className="supplier-detail-grid">

                    <DetailItem
                        label="Address"
                        value={supplier.address}
                        full
                    />

                    <DetailItem
                        label="City"
                        value={supplier.city}
                    />

                    <DetailItem
                        label="State"
                        value={supplier.state}
                    />

                    <DetailItem
                        label="Country"
                        value={supplier.country}
                    />

                    <DetailItem
                        label="Postal Code"
                        value={supplier.postalCode}
                    />

                </div>

            </div>

            {/* Payment & Banking */}
            <div className="supplier-detail-section">

                <div className="detail-section-header">
                    <div>
                        <h3>Payment & Banking</h3>
                        <p>Payment terms and bank information</p>
                    </div>
                </div>

                <div className="supplier-detail-grid">

                    <DetailItem
                        label="Payment Terms"
                        value={supplier.paymentTerms}
                    />

                    <DetailItem
                        label="Bank Name"
                        value={supplier.bankName}
                    />

                    <DetailItem
                        label="Account Number"
                        value={supplier.bankAccountNumber}
                    />

                    <DetailItem
                        label="IFSC Code"
                        value={supplier.ifscCode}
                    />

                </div>

            </div>

        </div>
    );
};


/* Reusable detail component */

const DetailItem = ({
    label,
    value,
    full = false
}) => {

    return (
        <div
            className={
                full
                    ? "supplier-detail-item full"
                    : "supplier-detail-item"
            }
        >
            <span className="detail-label">
                {label}
            </span>

            <span className="detail-value">
                {value || "-"}
            </span>
        </div>
    );
};

export default SupplierDetails;