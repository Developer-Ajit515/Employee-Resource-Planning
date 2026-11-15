
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaEdit,
    FaWarehouse,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope
} from "react-icons/fa";
import toast from "react-hot-toast";
import WarehouseProducts from "./WarehouseProduct";
import WarehouseService from "../../services/warehouseService";

import "./Warehouse.css";

function WarehouseDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Load Warehouse
    // ==========================================
    useEffect(() => {
        loadWarehouse();
    }, [id]);

    const loadWarehouse = async () => {

        try {

            setLoading(true);

            const data =
                await WarehouseService.getWarehouseById(id);

            setWarehouse(data);

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

    if (loading) {

        return (
            <div className="warehouse-page">

                <div className="warehouse-loading">
                    Loading warehouse details...
                </div>

            </div>
        );
    }

    if (!warehouse) {
        return null;
    }

    return (
        <div className="warehouse-page">

            {/* Header */}
            <div className="warehouse-header">

                <div>

                    <h2>Warehouse Details</h2>

                    <p>
                        View warehouse information
                    </p>

                </div>

                <div className="warehouse-header-actions">

                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate("/warehouses")
                        }
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            navigate(
                                `/warehouses/edit/${warehouse.id}`
                            )
                        }
                    >
                        <FaEdit />
                        Edit
                    </button>

                </div>

            </div>

            {/* Main Details */}
            <div className="warehouse-details-grid">

                {/* Basic Information */}
                <div className="warehouse-detail-card">

                    <div className="warehouse-detail-title">

                        <FaWarehouse />

                        <h4>Basic Information</h4>

                    </div>

                    <div className="warehouse-products-card">

    <WarehouseProducts
        warehouseId={warehouse.id}
    />

</div>

                    <div className="warehouse-detail-row">

                        <span>Name</span>

                        <strong>
                            {warehouse.name || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Code</span>

                        <strong>
                            {warehouse.code || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Description</span>

                        <strong>
                            {warehouse.description || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Status</span>

                        {warehouse.isActive ? (
                            <span className="warehouse-status active">
                                Active
                            </span>
                        ) : (
                            <span className="warehouse-status inactive">
                                Inactive
                            </span>
                        )}

                    </div>

                </div>

                {/* Address */}
                <div className="warehouse-detail-card">

                    <div className="warehouse-detail-title">

                        <FaMapMarkerAlt />

                        <h4>Address</h4>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Address</span>

                        <strong>
                            {warehouse.address || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>City</span>

                        <strong>
                            {warehouse.city || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>State</span>

                        <strong>
                            {warehouse.state || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Country</span>

                        <strong>
                            {warehouse.country || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Postal Code</span>

                        <strong>
                            {warehouse.postalCode || "-"}
                        </strong>

                    </div>

                </div>

                {/* Contact */}
                <div className="warehouse-detail-card">

                    <div className="warehouse-detail-title">

                        <FaPhone />

                        <h4>Contact Information</h4>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Phone</span>

                        <strong>
                            {warehouse.phone || "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Email</span>

                        <strong>
                            {warehouse.email || "-"}
                        </strong>

                    </div>

                </div>

                {/* Dates */}
                <div className="warehouse-detail-card">

                    <div className="warehouse-detail-title">

                        <FaWarehouse />

                        <h4>Record Information</h4>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Warehouse ID</span>

                        <strong>
                            {warehouse.id}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Created At</span>

                        <strong>
                            {warehouse.createdAt
                                ? new Date(
                                    warehouse.createdAt
                                ).toLocaleString()
                                : "-"}
                        </strong>

                    </div>

                    <div className="warehouse-detail-row">

                        <span>Updated At</span>

                        <strong>
                            {warehouse.updatedAt
                                ? new Date(
                                    warehouse.updatedAt
                                ).toLocaleString()
                                : "-"}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default WarehouseDetails;

