
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBuilding, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

import DepartmentService from "../../services/DepartmentService";
import "./Department.css";

const DepartmentForm = ({ departmentId, onClose, onSaved }) => {
    const params = useParams();
    const navigate = useNavigate();

    const id = departmentId ?? params.id;
    const isEditMode = Boolean(id);
    const isModal = typeof onClose === "function";

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [loadingDepartment, setLoadingDepartment] = useState(isEditMode);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEditMode) {
            setFormData({
                name: "",
                description: "",
                isActive: true
            });
            setLoadingDepartment(false);
            setError("");
            return;
        }

        let isMounted = true;

        const loadDepartment = async () => {
            try {
                setLoadingDepartment(true);
                setError("");

                const response =
                    await DepartmentService.getDepartmentById(id);

                const department = response?.data ?? response;

                if (!isMounted) return;

                setFormData({
                    name: department?.name ?? department?.Name ?? "",
                    description:
                        department?.description ??
                        department?.Description ??
                        "",
                    isActive:
                        department?.isActive ??
                        department?.IsActive ??
                        true
                });
            } catch (err) {
                console.error("Department loading error:", err);

                const message =
                    err.response?.data?.message ||
                    "Unable to load department.";

                if (isMounted) {
                    setError(message);
                    if (isModal) {
                        await Swal.fire({
                            icon: "error",
                            title: "Unable to Load",
                            text: message
                        });
                        onClose();
                    }
                }
            } finally {
                if (isMounted) setLoadingDepartment(false);
            }
        };

        loadDepartment();

        return () => {
            isMounted = false;
        };
    }, [id, isEditMode, isModal, onClose]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Department name is required.");

            await Swal.fire({
                icon: "warning",
                title: "Validation",
                text: "Department name is required."
            });

            return;
        }

        if (formData.name.trim().length > 100) {
            setError("Department name cannot exceed 100 characters.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                isActive: formData.isActive
            };

            if (isEditMode) {
                await DepartmentService.updateDepartment(id, payload);
            } else {
                await DepartmentService.createDepartment(payload);
            }

            await Swal.fire({
                icon: "success",
                title: isEditMode ? "Department Updated" : "Department Created",
                text: isEditMode
                    ? "Department updated successfully."
                    : "Department added successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            if (typeof onSaved === "function") {
                await onSaved();
            } else {
                navigate("/departments");
            }
        } catch (err) {
            console.error("Save department error:", err);

            const message =
                err.response?.data?.message ||
                "Unable to save department.";

            setError(message);

            await Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: message
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingDepartment) {
        return (
            <div className="department-modal-overlay">
                <div className="department-modal department-modal-loading">
                    <div className="department-spinner" />
                    <p>Loading department...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="department-modal-overlay"
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    isModal &&
                    !loading
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="department-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="department-modal-title"
            >
                <div className="department-modal-header">
                    <div>
                        <span className="department-eyebrow">
                            ORGANIZATION MANAGEMENT
                        </span>

                        <h3 id="department-modal-title">
                            {isEditMode
                                ? "Edit Department"
                                : "Add New Department"}
                        </h3>

                        <p>
                            {isEditMode
                                ? "Update department information below."
                                : "Enter the details for your new department."}
                        </p>
                    </div>

                    {isModal && (
                        <button
                            type="button"
                            className="department-modal-close"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="department-modal-body">
                        {error && (
                            <div className="department-error">
                                {error}
                            </div>
                        )}

                        <div className="department-modal-section-title">
                            <FaBuilding />
                            Department Information
                        </div>

                        <div className="department-modal-form-group">
                            <label htmlFor="department-name">
                                Department Name <span>*</span>
                            </label>

                            <input
                                id="department-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Example: Human Resources"
                                maxLength={100}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="department-modal-form-group">
                            <label htmlFor="department-description">
                                Description
                            </label>

                            <textarea
                                id="department-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter department description..."
                                rows={4}
                            />
                        </div>

                        <div className="department-modal-status">
                            <div>
                                <strong>Department Status</strong>
                                <p>
                                    {formData.isActive
                                        ? "This department is active."
                                        : "This department is inactive."}
                                </p>
                            </div>

                            <label className="department-switch">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span className="department-switch-track" />
                            </label>
                        </div>
                    </div>

                    <div className="department-modal-actions">
                        {isModal && (
                            <button
                                type="button"
                                className="department-cancel-btn"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            className="department-save-btn"
                            disabled={loading}
                        >
                            <FaSave />
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Department"
                                    : "Save Department"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentForm;
