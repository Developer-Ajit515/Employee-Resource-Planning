import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import PermissionService from "../../services/permissionService";

import "./Permission.css";

function PermissionDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [permission, setPermission] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    // ==========================================
    // LOAD
    // ==========================================
    useEffect(() => {
        loadPermission();
    }, [id]);

    const loadPermission = async () => {
        try {
            setLoading(true);

            const data =
                await PermissionService.getById(id);

            setPermission(data);

        } catch (error) {
            console.error(
                "Error loading permission:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                "Failed to load permission"
            );

            navigate("/permissions");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="permission-page">
                <div className="permission-loading">
                    <div className="spinner-border">
                    </div>

                    <p>
                        Loading permission...
                    </p>
                </div>
            </div>
        );
    }

    if (!permission) {
        return null;
    }

    return (
        <div className="permission-page">

            {/* HEADER */}
            <div className="permission-header">

                <div>
                    <h2>
                        Permission Details
                    </h2>

                    <p>
                        View permission information
                    </p>
                </div>

                <button
                    className="permission-back-btn"
                    onClick={() =>
                        navigate("/permissions")
                    }
                >
                    ← Back
                </button>

            </div>

            {/* DETAILS CARD */}
            <div className="permission-details-card">

                <div className="permission-details-header">

                    <div className="permission-details-icon">
                        🔐
                    </div>

                    <div>
                        <h3>
                            {permission.name}
                        </h3>

                        <span className="permission-badge">
                            Permission
                        </span>
                    </div>

                </div>

                <div className="permission-details-grid">

                    <div className="permission-detail-item">

                        <label>
                            Permission ID
                        </label>

                        <div>
                            {permission.id}
                        </div>

                    </div>

                    <div className="permission-detail-item">

                        <label>
                            Permission Name
                        </label>

                        <div>
                            {permission.name}
                        </div>

                    </div>

                    <div className="permission-detail-item permission-detail-full">

                        <label>
                            Description
                        </label>

                        <div>
                            {permission.description ||
                                "No description available."}
                        </div>

                    </div>

                </div>

                {/* ACTIONS */}
                <div className="permission-details-actions">

                    <button
                        className="permission-edit-btn"
                        onClick={() =>
                            navigate(
                                `/permissions/edit/${permission.id}`
                            )
                        }
                    >
                        Edit Permission
                    </button>

                    <button
                        className="permission-cancel-btn"
                        onClick={() =>
                            navigate("/permissions")
                        }
                    >
                        Back to List
                    </button>

                </div>

            </div>

        </div>
    );
}

export default PermissionDetails;