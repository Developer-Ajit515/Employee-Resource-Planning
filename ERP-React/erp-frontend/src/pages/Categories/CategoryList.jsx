
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaTags,
    FaSearch,
    FaCheckCircle,
    FaBan,
} from "react-icons/fa";

import CategoryService from "../../services/categoryService";
import CategoryForm from "./CategoryForm";
import sweetAlert from "../../utils/sweetAlert";
import notification from "../../utils/notification";
import Pagination from "../../components/common/Pagination";

import "./Category.css";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const navigate = useNavigate();

    const openAddModal = () => {
        setSelectedCategoryId(null);
        setShowCategoryModal(true);
    };

    const openEditModal = (id) => {
        setSelectedCategoryId(id);
        setShowCategoryModal(true);
    };

    const openViewCategory = (id) => {
        // Open the category in the same form modal.
        openEditModal(id);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setSelectedCategoryId(null);
    };

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await CategoryService.getCategories();

            const categoryData = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                ? response.data
                : [];

            setCategories(categoryData);
            setFilteredCategories(categoryData);
        } catch (err) {
            console.error("Category loading error:", err);

            if (err.response?.status === 401) {
                setError("Unauthorized. Please login again.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load categories."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const searchText = search.trim().toLowerCase();

        const result = categories.filter((category) =>
            (category.name ?? "").toLowerCase().includes(searchText)
        );

        setFilteredCategories(result);
        setCurrentPage(1);
    }, [search, categories]);

    const totalPages = Math.ceil(
        filteredCategories.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentCategories = filteredCategories.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handleCategorySaved = async () => {
        await loadCategories();
    };

    const handleDelete = async (id, name) => {
        const confirmed = await sweetAlert.confirmDelete(`"${name}"`);

        if (!confirmed) return;

        try {
            await CategoryService.deleteCategory(id);

            setCategories((prev) =>
                prev.filter((category) => category.id !== id)
            );

            notification.success("Category deleted successfully");

            if (currentCategories.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            }
        } catch (err) {
            console.error("Delete category error:", err);

            notification.error(
                err.response?.data?.message ||
                "Unable to delete category."
            );
        }
    };

    if (loading) {
        return (
            <div className="category-page">
                <div className="category-loading">
                    Loading categories...
                </div>
            </div>
        );
    }

    return (
        <div className="category-page">
            <div className="category-header category-header-box">
                <div className="category-header-title">
                    <div className="category-header-icon">
                        <FaTags />
                    </div>

                    <div>
                        <h1>Categories</h1>
                        <p>
                            Manage and organize your product categories
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="category-add-btn"
                    onClick={openAddModal}
                >
                    <FaPlus /> Add Category
                </button>
            </div>

            {error && (
                <div className="category-error" role="alert">
                    {error}
                </div>
            )}

            <div className="category-stats-grid">
                <div className="category-stat-card">
                    <div className="category-stat-icon total">
                        <FaTags />
                    </div>

                    <div>
                        <p>Total Categories</p>
                        <h3>{categories.length}</h3>
                        <span>All registered categories</span>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon active">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <p>Active Categories</p>
                        <h3>
                            {categories.filter((c) => c.isActive).length}
                        </h3>
                        <span>Currently active</span>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon inactive">
                        <FaBan />
                    </div>

                    <div>
                        <p>Inactive Categories</p>
                        <h3>
                            {categories.filter((c) => !c.isActive).length}
                        </h3>
                        <span>Currently inactive</span>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon results">
                        <FaSearch />
                    </div>

                    <div>
                        <p>Search Results</p>
                        <h3>{filteredCategories.length}</h3>
                        <span>
                            {search
                                ? "Matching categories"
                                : "Showing all categories"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="category-content-card">
                <div className="category-toolbar category-toolbar-box">
                    <div>
                        <h2>Category Directory</h2>
                        <p>View and manage your categories</p>
                    </div>

                    <div className="category-search">
                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Search category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="category-table-container">
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentCategories.length > 0 ? (
                                currentCategories.map((category) => (
                                    <tr key={category.id}>
                                        <td>
                                            <span className="category-id">
                                                {category.id}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="category-name">
                                                <div className="category-icon">
                                                    <FaTags />
                                                </div>

                                                <strong>{category.name}</strong>
                                            </div>
                                        </td>

                                        <td>
                                            {category.description || "-"}
                                        </td>

                                        <td>
                                            {category.isActive ? (
                                                <span className="status active">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="status inactive">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <div className="category-actions">
                                                
{/* View Category Details */}
<button
    type="button"
    title="View Category"
    className="action-btn view"
    onClick={() => navigate(`/categories/${category.id}`)}
>
    <FaEye />
</button>


                                                <button
                                                    type="button"
                                                    title="Edit category"
                                                    aria-label={`Edit ${category.name}`}
                                                    className="action-btn edit"
                                                    onClick={() =>
                                                        openEditModal(category.id)
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Delete category"
                                                    aria-label={`Delete ${category.name}`}
                                                    className="action-btn delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id,
                                                            category.name
                                                        )
                                                    }
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="empty-categories"
                                    >
                                        <FaTags />
                                        <p>No categories found.</p>

                                        {search ? (
                                            <span>
                                                Try a different search term.
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="category-add-btn"
                                                onClick={openAddModal}
                                            >
                                                <FaPlus /> Add your first category
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>

            {showCategoryModal && (
                <CategoryForm
                    categoryId={selectedCategoryId}
                    onClose={closeCategoryModal}
                    onSaved={handleCategorySaved}
                />
            )}
        </div>
    );
};

export default CategoryList;
