
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaSave, FaArrowLeft } from "react-icons/fa";

import WarehouseService from "../../services/warehouseService";

import "./Warehouse.css";

function WarehouseForm() {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        phone: "",
        email: "",
        isActive: true
    });

    // ==========================================
    // Load Warehouse For Edit
    // ==========================================
    useEffect(() => {

        if (isEditMode) {
            loadWarehouse();
        }

    }, [id]);

    const loadWarehouse = async () => {

        try {

            setLoading(true);

            const data =
                await WarehouseService.getWarehouseById(id);

            setFormData({
                name: data.name || "",
                code: data.code || "",
                description: data.description || "",
                address: data.address || "",
                city: data.city || "",
                state: data.state || "",
                country: data.country || "",
                postalCode: data.postalCode || "",
                phone: data.phone || "",
                email: data.email || "",
                isActive: data.isActive ?? true
            });

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load warehouse"
            );

            navigate("/warehouses");

        } finally {

            setLoading(false);

        }
    };

    // ==========================================
    // Handle Input
    // ==========================================
    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox"
                ? checked
                : value
        }));
    };

    // ==========================================
    // Submit
    // ==========================================
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.name.trim()) {

            toast.error("Warehouse name is required");

            return;
        }

        try {

            setLoading(true);

            if (isEditMode) {

                await WarehouseService.updateWarehouse({
                    id: Number(id),
                    ...formData
                });

                toast.success(
                    "Warehouse updated successfully"
                );

            } else {

                await WarehouseService.createWarehouse(
                    formData
                );

                toast.success(
                    "Warehouse created successfully"
                );
            }

            navigate("/warehouses");

        } catch (error) {

            console.error(
                "Warehouse save error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to save warehouse"
            );

        } finally {

            setLoading(false);

        }
    };

    if (loading && isEditMode) {

        return (
            <div className="warehouse-page">
                <div className="warehouse-loading">
                    Loading warehouse...
                </div>
            </div>
        );
    }

    return (
        <div className="warehouse-page">

            {/* Header */}
            <div className="warehouse-header">

                <div>
                    <h2>
                        {isEditMode
                            ? "Edit Warehouse"
                            : "Add Warehouse"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Update warehouse information"
                            : "Create a new warehouse"}
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/warehouses")}
                >
                    <FaArrowLeft />
                    Back
                </button>

            </div>

            {/* Form */}
            <div className="warehouse-form-card">

                <form onSubmit={handleSubmit}>

                    {/* Basic Information */}
                    <div className="warehouse-section">

                        <h4>Basic Information</h4>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label>
                                    Warehouse Name
                                    <span className="required">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter warehouse name"
                                    required
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label>Warehouse Code</label>

                                <input
                                    type="text"
                                    name="code"
                                    className="form-control"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g. WH-001"
                                />

                            </div>

                            <div className="col-12 mb-3">

                                <label>Description</label>

                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter warehouse description"
                                />

                            </div>

                        </div>

                    </div>

                    {/* Address */}
                    <div className="warehouse-section">

                        <h4>Address Information</h4>

                        <div className="row">

                            <div className="col-12 mb-3">

                                <label>Address</label>

                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                />

                            </div>

                            <div className="col-md-4 mb-3">

                                <label>City</label>

                                <input
                                    type="text"
                                    name="city"
                                    className="form-control"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />

                            </div>

                            <div className="col-md-4 mb-3">

                                <label>State</label>

                                <input
                                    type="text"
                                    name="state"
                                    className="form-control"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                />

                            </div>

                            <div className="col-md-4 mb-3">

                                <label>Country</label>

                                <input
                                    type="text"
                                    name="country"
                                    className="form-control"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Enter country"
                                />

                            </div>

                            <div className="col-md-4 mb-3">

                                <label>Postal Code</label>

                                <input
                                    type="text"
                                    name="postalCode"
                                    className="form-control"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    placeholder="Enter postal code"
                                />

                            </div>

                        </div>

                    </div>

                    {/* Contact */}
                    <div className="warehouse-section">

                        <h4>Contact Information</h4>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label>Phone</label>

                                <input
                                    type="text"
                                    name="phone"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label>Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                />

                            </div>

                        </div>

                    </div>

                    {/* Status */}
                    <div className="warehouse-section">

                        <h4>Status</h4>

                        <div className="form-check form-switch">

                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />

                            <label
                                className="form-check-label"
                                htmlFor="isActive"
                            >
                                Active Warehouse
                            </label>

                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="warehouse-form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/warehouses")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >

                            <FaSave />

                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Warehouse"
                                    : "Save Warehouse"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default WarehouseForm;

