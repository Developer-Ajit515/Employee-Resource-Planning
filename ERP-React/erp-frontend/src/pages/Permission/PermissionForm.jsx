
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import PermissionService from "../../services/permissionService";
import "./Permission.css";

function PermissionForm({ permissionId, onClose, onSaved }) {
    const params = useParams();
    const id = permissionId ?? params.id;
    const isEditMode = Boolean(id);
    const isModal = typeof onClose === "function";

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isEditMode) {
            setLoading(false);
            setFormData({ name: "", description: "" });
            return;
        }

        let active = true;

        const loadPermission = async () => {
            try {
                setLoading(true);

                const response = await PermissionService.getById(id);
                const data = response?.data ?? response;

                if (!active) return;

                setFormData({
                    name: data?.name ?? data?.Name ?? "",
                    description:
                        data?.description ?? data?.Description ?? ""
                });
            } catch (error) {
                console.error("Error loading permission:", error);
                toast.error(
                    error?.response?.data?.message ||
                    "Failed to load permission"
                );

                if (active && isModal) onClose();
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPermission();

        return () => {
            active = false;
        };
    }, [id, isEditMode, isModal, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    const validate = () => {
        const nextErrors = {};
        const name = formData.name.trim();

        if (!name) {
            nextErrors.name = "Permission name is required.";
        } else if (name.length > 100) {
            nextErrors.name =
                "Permission name cannot exceed 100 characters.";
        }

        if (formData.description.length > 500) {
            nextErrors.description =
                "Description cannot exceed 500 characters.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || null
            };

            if (isEditMode) {
                await PermissionService.update({
                    id: Number(id),
                    ...payload
                });

                toast.success("Permission updated successfully");
            } else {
                await PermissionService.create(payload);
                toast.success("Permission created successfully");
            }

            if (typeof onSaved === "function") {
                await onSaved();
            } else {
                // Supports older standalone create/edit routes.
                window.location.assign("/permissions");
            }
        } catch (error) {
            console.error("Save permission error:", error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to save permission"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="permission-modal-overlay">
                <div className="permission-modal permission-loading">
                    <div className="spinner-border" role="status" />
                    <p>Loading permission...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="permission-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving && isModal) {
                    onClose();
                }
            }}
        >
            <div
                className="permission-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="permission-modal-title"
            >
                <div className="permission-modal-header">
                    <div>
                        <span className="permission-eyebrow">
                            ACCESS CONTROL
                        </span>
                        <h3 id="permission-modal-title">
                            {isEditMode
                                ? "Edit Permission"
                                : "Add New Permission"}
                        </h3>
                        <p>
                            {isEditMode
                                ? "Update the permission details below."
                                : "Enter the details to create a permission."}
                        </p>
                    </div>

                    {isModal && (
                        <button
                            type="button"
                            className="permission-modal-close"
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="permission-modal-body">
                        <div className="permission-form-group">
                            <label htmlFor="permission-name">
                                Permission Name <span>*</span>
                            </label>

                            <input
                                id="permission-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Example: Users.View"
                                maxLength={100}
                                className={errors.name ? "input-error" : ""}
                                autoFocus
                            />

                            {errors.name && (
                                <small className="error-message">
                                    {errors.name}
                                </small>
                            )}

                            <small className="field-hint">
                                Examples: Users.View, Products.Create,
                                Tasks.Edit
                            </small>
                        </div>

                        <div className="permission-form-group">
                            <label htmlFor="permission-description">
                                Description
                            </label>

                            <textarea
                                id="permission-description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe what this permission allows..."
                                maxLength={500}
                                className={
                                    errors.description ? "input-error" : ""
                                }
                            />

                            {errors.description && (
                                <small className="error-message">
                                    {errors.description}
                                </small>
                            )}

                            <small className="field-hint">
                                Maximum 500 characters.
                            </small>
                        </div>
                    </div>

                    <div className="permission-form-actions">
                        {isModal && (
                            <button
                                type="button"
                                className="permission-cancel-btn"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            className="permission-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Permission"
                                    : "Create Permission"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PermissionForm;
