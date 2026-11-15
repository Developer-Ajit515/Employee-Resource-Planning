import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
    getProducts,
    deleteProduct
} from "../../api/productApi";

import ProductForm from "./ProductForm";
import "./Product.css";

import {
    FaPlus,
    FaSearch,
    FaEye,
    FaEdit,
    FaTrash,
    FaBoxOpen,
    FaTimes
} from "react-icons/fa";

import notification from "../../utils/notification";
import Pagination from "../../components/common/Pagination";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    // =========================
    // Load Products
    // =========================
    const loadProducts = async () => {
        try {
            setLoading(true);

            const response = await getProducts();

            // Support both array and common API response formats
            const data = Array.isArray(response)
                ? response
                : response?.data ?? response?.items ?? [];

            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading products:", error);

            notification.error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // =========================
    // Search
    // =========================
    const filteredProducts = products.filter((product) =>
        (product.name || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // =========================
    // Pagination
    // =========================
    const totalPages = Math.ceil(
        filteredProducts.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentProducts = filteredProducts.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // =========================
    // Delete Product
    // =========================
    const handleDelete = async (id, name) => {
        if (deletingId !== null) return;

        const result = await Swal.fire({
            title: "Delete Product?",
            text: `Are you sure you want to delete "${name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
            focusCancel: true
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingId(id);

            // Call backend DELETE API
            await deleteProduct(id);

            // Update local state only after API succeeds
            setProducts((previousProducts) =>
                previousProducts.filter(
                    (product) => product.id !== id
                )
            );

            notification.success("Product deleted successfully.");

            // Move back if current page becomes empty
            const remainingItems = filteredProducts.length - 1;

            if (
                remainingItems > 0 &&
                (currentPage - 1) * itemsPerPage >= remainingItems
            ) {
                setCurrentPage((page) => Math.max(1, page - 1));
            }
        } catch (error) {
            console.error("Delete product error:", error);

            const message =
                error.response?.data?.message ||
                error.response?.data?.title ||
                (error.response?.status === 401
                    ? "Your session has expired. Please log in again."
                    : error.response?.status === 403
                    ? "You do not have permission to delete this product."
                    : error.response?.status === 404
                    ? "Product was not found. Refresh the list and try again."
                    : "Unable to delete product.");

            notification.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    // =========================
    // Stock Styling
    // =========================
    const getStockClass = (stock) => {
        const quantity = Number(stock) || 0;

        if (quantity <= 5) {
            return "product-stock product-stock-low";
        }

        if (quantity <= 15) {
            return "product-stock product-stock-medium";
        }

        return "product-stock product-stock-normal";
    };

    // =========================
    // Product Form Success
    // =========================
    const handleFormSuccess = async () => {
        setShowProductModal(false);
        setSelectedProductId(null);
        await loadProducts();
    };

    return (
        <div className="product-page">

            {/* PAGE HEADER */}
            <div className="product-page-header product-header-bordered">
                <div>
                    <h1 className="product-page-title">Products</h1>
                    <p className="product-page-subtitle">
                        Manage your products and inventory
                    </p>
                </div>

                <div className="product-header-right">
                    <div className="product-total-box">
                        <div className="product-total-icon">
                            <FaBoxOpen />
                        </div>

                        <div>
                            <span className="product-total-label">
                                Total Products
                            </span>

                            <strong className="product-total-count">
                                {products.length}
                            </strong>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="product-add-btn"
                        onClick={() => {
                            setSelectedProductId(null);
                            setShowProductModal(true);
                        }}
                    >
                        <FaPlus style={{ marginRight: "7px" }} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* PRODUCT CARD */}
            <div className="product-card">
                <div className="product-card-body">

                    {/* SEARCH */}
                    <div className="product-search-wrapper">
                        <FaSearch className="product-search-icon" />

                        <input
                            type="text"
                            className="product-search-input"
                            placeholder="Search product..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    {/* LOADING */}
                    {loading ? (
                        <div className="product-loading">
                            <div className="product-loading-spinner" />
                            <span>Loading products...</span>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentProducts.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="product-empty-state"
                                            >
                                                <div className="product-empty-icon">
                                                    <FaBoxOpen />
                                                </div>

                                                <div className="product-empty-title">
                                                    No Products Found
                                                </div>

                                                <p className="product-empty-text">
                                                    {search
                                                        ? "No products match your search."
                                                        : "No products have been added yet."}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentProducts.map(
                                            (product, index) => (
                                                <tr key={product.id}>
                                                    {/* NUMBER */}
                                                    <td>
                                                        {startIndex + index + 1}
                                                    </td>

                                                    {/* PRODUCT */}
                                                    <td>
                                                        <div className="product-name-wrapper">
                                                            <div className="product-icon">
                                                                <FaBoxOpen />
                                                            </div>

                                                            <span className="product-name">
                                                                {product.name}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* PRICE */}
                                                    <td>
                                                        <span className="product-price">
                                                            ₹
                                                            {Number(
                                                                product.price || 0
                                                            ).toLocaleString("en-IN")}
                                                        </span>
                                                    </td>

                                                    {/* STOCK */}
                                                    <td>
                                                        <span
                                                            className={getStockClass(
                                                                product.stock
                                                            )}
                                                        >
                                                            {product.stock ?? 0}
                                                        </span>
                                                    </td>

                                                    {/* CATEGORY */}
                                                    <td>
                                                        <span className="product-category">
                                                            {product.category?.name || "-"}
                                                        </span>
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td>
                                                        <div className="product-actions">
                                                            {/* VIEW */}
                                                            <button
                                                                type="button"
                                                                className="product-action-btn product-view-btn"
                                                                title="View Product"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/products/${product.id}`
                                                                    )
                                                                }
                                                            >
                                                                <FaEye />
                                                            </button>

                                                            {/* EDIT */}
                                                            <button
                                                                type="button"
                                                                className="product-action-btn product-edit-btn"
                                                                title="Edit Product"
                                                                onClick={() => {
                                                                    setSelectedProductId(
                                                                        product.id
                                                                    );
                                                                    setShowProductModal(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <FaEdit />
                                                            </button>

                                                            {/* DELETE */}
                                                            <button
                                                                type="button"
                                                                className="product-action-btn product-delete-btn"
                                                                title="Delete Product"
                                                                disabled={
                                                                    deletingId !== null
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product.id,
                                                                        product.name
                                                                    )
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>

                            {/* PAGINATION */}
                            {totalPages > 0 && (
                                <Pagination
                                    currentPage={Math.min(
                                        currentPage,
                                        totalPages
                                    )}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* ADD / EDIT PRODUCT MODAL */}
                {showProductModal && (
                    <div
                        className="product-modal-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setShowProductModal(false);
                            }
                        }}
                    >
                        <div
                            className="product-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="product-modal-title"
                        >
                            <div className="product-modal-header">
                                <h2 id="product-modal-title">
                                    {selectedProductId
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                                <button
                                    type="button"
                                    className="product-modal-close"
                                    onClick={() => {
                                        setShowProductModal(false);
                                        setSelectedProductId(null);
                                    }}
                                    aria-label="Close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="product-modal-body">
                                <ProductForm
                                    key={
                                        selectedProductId ?? "new-product"
                                    }
                                    id={selectedProductId}
                                    isModal
                                    onCancel={() => {
                                        setShowProductModal(false);
                                        setSelectedProductId(null);
                                    }}
                                    onSuccess={handleFormSuccess}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;