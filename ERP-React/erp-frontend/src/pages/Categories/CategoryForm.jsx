
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTags, FaSave, FaTimes } from "react-icons/fa";
import CategoryService from "../../services/categoryService";
import notification from "../../utils/notification";
import "./Category.css";

const CategoryForm = ({ categoryId, onClose, onSaved }) => {
    const params = useParams();
    const navigate = useNavigate();

    const id = categoryId ?? params.id;
    const isModal = typeof onClose === "function";
    const isEditMode = id !== undefined && id !== null && id !== "";

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadCategory = async () => {
            if (!isEditMode) {
                setFormData({
                    name: "",
                    description: "",
                    isActive: true,
                });
                setError("");
                setLoadingCategory(false);
                return;
            }

            try {
                setLoadingCategory(true);
                setError("");

                const response =
                    await CategoryService.getCategoryById(id);

                const category = response?.data ?? response;

                if (!category) {
                    throw new Error("Category not found.");
                }

                if (!cancelled) {
                    setFormData({
                        name: category.name ?? "",
                        description: category.description ?? "",
                        isActive: category.isActive ?? true,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load category."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingCategory(false);
                }
            }
        };

        loadCategory();

        return () => {
            cancelled = true;
        };
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleClose = () => {
        if (loading) return;

        if (isModal) {
            onClose();
        } else {
            navigate("/categories");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            setError("Category name is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const payload = {
                name,
                description: formData.description.trim(),
                isActive: formData.isActive,
            };

            if (isEditMode) {
                await CategoryService.updateCategory(id, payload);
            } else {
                await CategoryService.createCategory(payload);
            }

            notification.success(
                isEditMode
                    ? "Category updated successfully"
                    : "Category added successfully"
            );

            if (isModal) {
                onSaved?.();
                onClose();
            } else {
                navigate("/categories");
            }
        } catch (err) {
            console.error("Save category error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save category."
            );
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <>
            <div className="category-modal-header">
                <div className="category-modal-heading">
                    <div className="category-modal-icon">
                        <FaTags />
                    </div>

                    <div>
                        <h2 id="category-modal-title">
                            {isEditMode ? "Edit Category" : "Add Category"}
                        </h2>

                        <p>
                            {isEditMode
                                ? "Update category information"
                                : "Create a new category"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="category-modal-close"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Close"
                >
                    <FaTimes />
                </button>
            </div>

            {error && (
                <div className="category-error" role="alert">
                    {error}
                </div>
            )}

            {loadingCategory ? (
                <div className="category-loading">
                    Loading category...
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="category-modal-body">
                        <div className="form-group">
                            <label htmlFor="category-name">
                                Category Name <span>*</span>
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter category name"
                                maxLength={100}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category-description">
                                Description
                            </label>

                            <textarea
                                id="category-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter category description"
                                rows={4}
                            />
                        </div>

                        <div className="category-status-field">
                            <div>
                                <strong>Category Status</strong>
                                <p>
                                    Control whether this category is active.
                                </p>
                            </div>

                            <label className="switch-container">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />

                                <span className="switch" />

                                <span>
                                    {formData.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="category-modal-footer">
                        <button
                            type="button"
                            className="category-cancel-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="category-add-btn"
                            disabled={loading || loadingCategory}
                        >
                            <FaSave />

                            {loading
                                ? "Saving..."
                                : isEditMode
                                ? "Update Category"
                                : "Save Category"}
                        </button>
                    </div>
                </form>
            )}
        </>
    );

    if (!isModal) {
        return (
            <div className="category-page">
                {content}
            </div>
        );
    }

    return (
        <div
            className="category-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className="category-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-modal-title"
            >
                {content}
            </div>
        </div>
    );
};

export default CategoryForm;
