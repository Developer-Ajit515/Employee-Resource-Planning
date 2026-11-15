import React, { useEffect, useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    FaTags,
    FaEdit,
    FaArrowLeft,
    FaTrash,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa";

import CategoryService from "../../services/categoryService";

import "./Category.css";

const CategoryDetails = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const [category, setCategory] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        loadCategory();
    }, [id]);

    const loadCategory = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await CategoryService.getCategoryById(id);

            const categoryData =
                data?.data || data;

            setCategory(categoryData);

        } catch (err) {
            console.error(
                "Category details error:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Unauthorized. Please login again."
                );
            } else if (err.response?.status === 404) {
                setError(
                    "Category not found."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load category."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmDelete) return;

        try {
            await CategoryService.deleteCategory(id);

            navigate("/categories");

        } catch (err) {
            console.error(
                "Delete category error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete category."
            );
        }
    };

    if (loading) {
        return (
            <div className="category-page">

                <div className="category-loading">
                    Loading category details...
                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="category-page">

                <div className="category-error">
                    {error}
                </div>

                <button
                    type="button"
                    className="category-back-btn"
                    onClick={() =>
                        navigate("/categories")
                    }
                >
                    <FaArrowLeft />
                    Back to Categories
                </button>

            </div>
        );
    }

    if (!category) {
        return (
            <div className="category-page">

                <div className="category-empty">
                    <FaTags />

                    <h3>
                        Category not found
                    </h3>

                    <button
                        type="button"
                        className="category-back-btn"
                        onClick={() =>
                            navigate("/categories")
                        }
                    >
                        <FaArrowLeft />
                        Back to Categories
                    </button>
                </div>

            </div>
        );
    }

    return (
        <div className="category-page">

            {/* Header */}

            <div className="category-header">

                <div>

                    <h1>
                        <FaTags />
                        Category Details
                    </h1>

                    <p>
                        View category information
                    </p>

                </div>

                <button
                    type="button"
                    className="category-back-btn"
                    onClick={() =>
                        navigate("/categories")
                    }
                >
                    <FaArrowLeft />
                    Back
                </button>

            </div>

            {/* Details Card */}

            <div className="category-details-card">

                {/* Details Header */}

                <div className="category-details-header">

                    <div className="category-details-title">

                        <div className="category-details-icon">
                            <FaTags />
                        </div>

                        <div>

                            <h2>
                                {category.name}
                            </h2>

                            <span>
                                Category ID: #{category.id}
                            </span>

                        </div>

                    </div>

                    {/* Status */}

                    <div>

                        {category.isActive ? (

                            <span className="category-detail-status active">

                                <FaCheckCircle />

                                Active

                            </span>

                        ) : (

                            <span className="category-detail-status inactive">

                                <FaTimesCircle />

                                Inactive

                            </span>

                        )}

                    </div>

                </div>

                {/* Information */}

                <div className="category-details-body">

                    <div className="category-detail-item">

                        <span className="detail-label">
                            Category ID
                        </span>

                        <strong>
                            {category.id}
                        </strong>

                    </div>

                    <div className="category-detail-item">

                        <span className="detail-label">
                            Category Name
                        </span>

                        <strong>
                            {category.name || "-"}
                        </strong>

                    </div>

                    <div className="category-detail-item">

                        <span className="detail-label">
                            Status
                        </span>

                        <strong>
                            {category.isActive
                                ? "Active"
                                : "Inactive"}
                        </strong>

                    </div>

                    <div className="category-detail-item full-width">

                        <span className="detail-label">
                            Description
                        </span>

                        <p>
                            {category.description ||
                                "No description available."}
                        </p>

                    </div>

                </div>

                {/* Footer */}

                <div className="category-details-footer">

                    <button
                        type="button"
                        className="category-cancel-btn"
                        onClick={() =>
                            navigate("/categories")
                        }
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <div className="category-detail-actions">

                        <button
                            type="button"
                            className="category-edit-btn"
                            onClick={() =>
                                navigate(
                                    `/categories/edit/${category.id}`
                                )
                            }
                        >
                            <FaEdit />
                            Edit Category
                        </button>

                        <button
                            type="button"
                            className="category-delete-btn"
                            onClick={handleDelete}
                        >
                            <FaTrash />
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CategoryDetails;