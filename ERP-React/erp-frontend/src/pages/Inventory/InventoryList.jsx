
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
    FaBoxes,
    FaBoxOpen,
    FaArrowDown,
    FaArrowUp,
    FaSlidersH,
    FaTimes,
    FaTrash,
    FaPlus,
    FaMinus,
    FaSyncAlt,
    FaSearch,
    FaWarehouse,
    FaClipboardList,
    FaExclamationTriangle,
    FaCalendarAlt,
} from "react-icons/fa";

import InventoryService from "../../services/inventoryService";
import { getProducts } from "../../services/productService";
import Pagination from "../../components/common/Pagination";

import "./Inventory.css";

const ACTIONS = {
    stockIn: {
        title: "Stock In",
        subtitle: "Add stock to your inventory",
        icon: FaArrowDown,
        buttonText: "Add Stock",
        buttonClass: "btn-stock-in",
        colorClass: "stock-in-theme",
        successMessage: "Stock added successfully.",
    },
    stockOut: {
        title: "Stock Out",
        subtitle: "Remove stock from your inventory",
        icon: FaArrowUp,
        buttonText: "Remove Stock",
        buttonClass: "btn-stock-out",
        colorClass: "stock-out-theme",
        successMessage: "Stock removed successfully.",
    },
    stockAdjustment: {
        title: "Stock Adjustment",
        subtitle: "Record a stock adjustment",
        icon: FaSlidersH,
        buttonText: "Save Adjustment",
        buttonClass: "btn-adjustment",
        colorClass: "adjustment-theme",
        successMessage: "Stock adjustment completed successfully.",
    },
};

function getArrayResponse(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    return [];
}

function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalType, setModalType] = useState(null);

    const [formData, setFormData] = useState({
        productId: "",
        quantity: "",
        remarks: "",
    });

    const itemsPerPage = 10;
    const modalConfig = modalType ? ACTIONS[modalType] : null;
    const ModalIcon = modalConfig?.icon;

    const loadInventory = async (resetPage = false) => {
        try {
            setLoading(true);
            const response = await InventoryService.getInventory();
            setInventory(getArrayResponse(response));

            if (resetPage) {
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Error loading inventory:", error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Failed to load inventory.",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await getProducts();
            setProducts(getArrayResponse(response));
        } catch (error) {
            console.error("Error loading products:", error);

            Swal.fire({
                icon: "error",
                title: "Products unavailable",
                text:
                    error.response?.data?.message ||
                    "Unable to load products. Please try again.",
            });
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    // Load products when the user opens any stock-action modal.
    useEffect(() => {
        if (modalType) {
            loadProducts();
        }
    }, [modalType]);

    // Close the popup with Escape.
    useEffect(() => {
        if (!modalType) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !saving) {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [modalType, saving]);

    const openModal = (type, productId = "") => {
        setFormData({
            productId: productId ? String(productId) : "",
            quantity: "",
            remarks: "",
        });
        setModalType(type);
    };

    const closeModal = () => {
        if (saving) return;
        setModalType(null);
        setFormData({
            productId: "",
            quantity: "",
            remarks: "",
        });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.productId) {
            Swal.fire({
                icon: "warning",
                title: "Select a product",
                text: "Please select a product before continuing.",
            });
            return;
        }

        const quantity = Number(formData.quantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid quantity",
                text: "Quantity must be greater than zero.",
            });
            return;
        }

        const serviceMethod = InventoryService[modalType];

        if (typeof serviceMethod !== "function") {
            Swal.fire({
                icon: "error",
                title: "Configuration error",
                text: `InventoryService.${modalType}() is not available.`,
            });
            return;
        }

        const payload = {
            productId: Number(formData.productId),
            quantity,
            remarks: formData.remarks.trim(),
        };

        try {
            setSaving(true);

            await serviceMethod(payload);

            setModalType(null);
            setFormData({
                productId: "",
                quantity: "",
                remarks: "",
            });

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: ACTIONS[modalType].successMessage,
                timer: 1600,
                showConfirmButton: false,
            });

            await loadInventory(true);
        } catch (error) {
            console.error(`${modalType} error:`, error);

            Swal.fire({
                icon: "error",
                title: "Operation failed",
                text:
                    error.response?.data?.message ||
                    `Unable to complete ${ACTIONS[modalType].title.toLowerCase()}.`,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Inventory Record?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await InventoryService.deleteInventory(id);

            await Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "Inventory record deleted successfully.",
                timer: 1500,
                showConfirmButton: false,
            });

            await loadInventory();
        } catch (error) {
            console.error("Delete error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Failed to delete inventory record.",
            });
        }
    };

    const filteredInventory = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return inventory;

        return inventory.filter((row) =>
            [
                row.productName,
                row.transactionType,
                row.remarks,
                row.id,
            ]
                .filter((value) => value !== null && value !== undefined)
                .some((value) =>
                    String(value).toLowerCase().includes(search)
                )
        );
    }, [inventory, searchTerm]);

    const totalPages = Math.ceil(
        filteredInventory.length / itemsPerPage
    );

    const paginatedInventory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInventory, currentPage]);

    const totalQuantity = inventory.reduce(
        (sum, row) => sum + (Number(row.quantity) || 0),
        0
    );

    const zeroStockCount = inventory.filter(
        (row) => Number(row.quantity) === 0
    ).length;

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className="inventory-container">
                <div className="inventory-page-heading">
                    <div className="inventory-heading-icon">
                        <FaWarehouse />
                    </div>
                    <div>
                        <h2>Inventory Management</h2>
                        <p>Manage product stock and inventory transactions</p>
                    </div>
                </div>

                <div className="inventory-card">
                    <div className="inventory-loading">
                        <FaSyncAlt className="inventory-spin" />
                        <span>Loading inventory...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-container">
            {/* Bordered page header */}
            <div className="inventory-page-heading">
                <div className="inventory-heading-icon">
                    <FaWarehouse />
                </div>

                <div className="inventory-heading-content">
                    <h2>Inventory Management</h2>
                    <p>Manage product stock and inventory transactions</p>
                </div>

                <div className="inventory-heading-count">
                    <FaBoxes />
                    <span>{inventory.length} records</span>
                </div>
            </div>

            {/* Summary cards */}
            <div className="inventory-summary-grid">
                <div className="inventory-summary-card">
                    <div className="inventory-summary-icon summary-purple">
                        <FaBoxes />
                    </div>
                    <div>
                        <span>Total Records</span>
                        <strong>{inventory.length}</strong>
                        <small>Inventory transactions</small>
                    </div>
                </div>

                <div className="inventory-summary-card">
                    <div className="inventory-summary-icon summary-green">
                        <FaBoxOpen />
                    </div>
                    <div>
                        <span>Total Quantity</span>
                        <strong>{totalQuantity.toLocaleString()}</strong>
                        <small>Quantity across records</small>
                    </div>
                </div>

                <div className="inventory-summary-card">
                    <div className="inventory-summary-icon summary-orange">
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <span>Zero-Stock Records</span>
                        <strong>{zeroStockCount}</strong>
                        <small>Records with zero quantity</small>
                    </div>
                </div>
            </div>

            {/* Stock action buttons */}
            <div className="inventory-actions-panel">
                <div className="inventory-actions-heading">
                    <div>
                        <h3>Stock Operations</h3>
                        <p>Choose an action to manage your stock</p>
                    </div>
                    <FaClipboardList className="inventory-actions-heading-icon" />
                </div>

                <div className="inventory-header-actions">
                    <button
                        type="button"
                        className="inventory-action-button btn-stock-in"
                        onClick={() => openModal("stockIn")}
                    >
                        <FaArrowDown />
                        <span>Stock In</span>
                        <FaPlus className="inventory-action-end-icon" />
                    </button>

                    <button
                        type="button"
                        className="inventory-action-button btn-stock-out"
                        onClick={() => openModal("stockOut")}
                    >
                        <FaArrowUp />
                        <span>Stock Out</span>
                        <FaMinus className="inventory-action-end-icon" />
                    </button>

                    <button
                        type="button"
                        className="inventory-action-button btn-adjustment"
                        onClick={() => openModal("stockAdjustment")}
                    >
                        <FaSlidersH />
                        <span>Stock Adjustment</span>
                        <FaPlus className="inventory-action-end-icon" />
                    </button>
                </div>
            </div>

            {/* Inventory table */}
            <div className="inventory-card">
                <div className="inventory-table-heading">
                    <div className="inventory-table-title">
                        <div className="inventory-table-title-icon">
                            <FaBoxes />
                        </div>
                        <div>
                            <h3>Inventory Transactions</h3>
                            <p>View and manage inventory records</p>
                        </div>
                    </div>

                    <div className="inventory-search">
                        <FaSearch />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search inventory..."
                            aria-label="Search inventory"
                        />
                    </div>
                </div>

                {filteredInventory.length === 0 ? (
                    <div className="inventory-empty">
                        <div className="inventory-empty-icon">
                            <FaBoxes />
                        </div>
                        <h3>No inventory records found</h3>
                        <p>
                            {searchTerm
                                ? "Try another search term."
                                : "Use Stock In to add your first inventory transaction."}
                        </p>
                    </div>
                ) : (
                    <div className="inventory-table-wrapper">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Transaction</th>
                                    <th>Remarks</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedInventory.map((row) => {
                                    const transaction = String(
                                        row.transactionType || ""
                                    ).toLowerCase().replace(/\s+/g, "-");

                                    return (
                                        <tr key={row.id}>
                                            <td>
                                                <span className="inventory-id">
                                                    #{row.id}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="inventory-product-cell">
                                                    <span className="inventory-product-icon">
                                                        <FaBoxOpen />
                                                    </span>
                                                    <strong>
                                                        {row.productName || "-"}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        Number(row.quantity) === 0
                                                            ? "stock-zero"
                                                            : "stock-available"
                                                    }
                                                >
                                                    {row.quantity ?? 0}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`transaction-badge transaction-${transaction}`}
                                                >
                                                    {row.transactionType || "-"}
                                                </span>
                                            </td>

                                            <td className="inventory-remarks">
                                                {row.remarks || "-"}
                                            </td>

                                            <td>
                                                <span className="inventory-date">
                                                    <FaCalendarAlt />
                                                    {row.createdAt
                                                        ? new Date(
                                                              row.createdAt
                                                          ).toLocaleString()
                                                        : "-"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="inventory-row-actions">
                                                    <button
                                                        type="button"
                                                        className="table-action-btn stock-in-action"
                                                        title="Stock In"
                                                        onClick={() =>
                                                            openModal(
                                                                "stockIn",
                                                                row.productId
                                                            )
                                                        }
                                                    >
                                                        <FaArrowDown />
                                                        <span>In</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="table-action-btn stock-out-action"
                                                        title="Stock Out"
                                                        onClick={() =>
                                                            openModal(
                                                                "stockOut",
                                                                row.productId
                                                            )
                                                        }
                                                    >
                                                        <FaArrowUp />
                                                        <span>Out</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="table-action-btn delete"
                                                        title="Delete record"
                                                        onClick={() =>
                                                            handleDelete(row.id)
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredInventory.length > 0 && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Stock action modal */}
            {modalType && modalConfig && (
                <div
                    className="inventory-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className={`inventory-modal ${modalConfig.colorClass}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inventory-modal-title"
                    >
                        <div className="inventory-modal-header">
                            <div className="inventory-modal-heading-icon">
                                <ModalIcon />
                            </div>

                            <div className="inventory-modal-heading-text">
                                <h2 id="inventory-modal-title">
                                    {modalConfig.title}
                                </h2>
                                <p>{modalConfig.subtitle}</p>
                            </div>

                            <button
                                type="button"
                                className="inventory-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close modal"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form
                            className="inventory-modal-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="inventory-modal-info">
                                <FaClipboardList />
                                <span>
                                    Complete the fields below to record this
                                    stock transaction.
                                </span>
                            </div>

                            <div className="inventory-form-group">
                                <label htmlFor="inventory-product">
                                    Product <span>*</span>
                                </label>

                                <select
                                    id="inventory-product"
                                    name="productId"
                                    value={formData.productId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loadingProducts || saving}
                                >
                                    <option value="">
                                        {loadingProducts
                                            ? "Loading products..."
                                            : "Select a product"}
                                    </option>

                                    {products.map((product) => (
                                        <option
                                            key={
                                                product.productId ??
                                                product.id
                                            }
                                            value={
                                                product.productId ??
                                                product.id
                                            }
                                        >
                                            {product.productName ??
                                                product.name ??
                                                product.title ??
                                                `Product #${
                                                    product.productId ??
                                                    product.id
                                                }`}
                                        </option>
                                    ))}
                                </select>

                                {!loadingProducts && products.length === 0 && (
                                    <small className="inventory-field-hint">
                                        No products found. Add a product first.
                                    </small>
                                )}
                            </div>

                            <div className="inventory-form-group">
                                <label htmlFor="inventory-quantity">
                                    Quantity <span>*</span>
                                </label>

                                <div className="inventory-input-with-icon">
                                    <FaBoxes />
                                    <input
                                        id="inventory-quantity"
                                        type="number"
                                        name="quantity"
                                        min="0.01"
                                        step="any"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="Enter quantity"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <small className="inventory-field-hint">
                                    Quantity must be greater than zero.
                                </small>
                            </div>

                            <div className="inventory-form-group">
                                <label htmlFor="inventory-remarks">
                                    Remarks
                                    <span className="inventory-optional">
                                        Optional
                                    </span>
                                </label>

                                <textarea
                                    id="inventory-remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    placeholder="Enter transaction notes..."
                                    rows="3"
                                    maxLength="500"
                                    disabled={saving}
                                />
                            </div>

                            <div className="inventory-modal-footer">
                                <button
                                    type="button"
                                    className="inventory-modal-cancel"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    <FaTimes />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={`inventory-modal-submit ${modalConfig.buttonClass}`}
                                    disabled={saving || loadingProducts}
                                >
                                    {saving ? (
                                        <>
                                            <FaSyncAlt className="inventory-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ModalIcon />
                                            {modalConfig.buttonText}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InventoryList;
