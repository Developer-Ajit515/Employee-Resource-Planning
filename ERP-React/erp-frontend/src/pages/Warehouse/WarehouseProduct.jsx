
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { getProducts }
    from "../../services/productService";

import WarehouseInventoryService
    from "../../services/warehouseInventoryService";



function WarehouseProducts({ warehouseId }) {

    const [products, setProducts] = useState([]);

    const [allProducts, setAllProducts] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        productId: "",
        quantity: 0,
        reorderLevel: 0
    });

    const [loading, setLoading] = useState(true);

    // ==========================================
    // Load Warehouse Products
    // ==========================================
    const loadProducts = async () => {

        try {

            setLoading(true);

            const data =
                await WarehouseInventoryService
                    .getByWarehouseId(warehouseId);

            setProducts(
                Array.isArray(data) ? data : []
            );

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load warehouse products"
            );

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // Load All Products
    // ==========================================
  const loadAllProducts = async () => {

    try {

        const data = await getProducts();

        setAllProducts(
            Array.isArray(data)
                ? data
                : []
        );

    } catch (error) {

        console.error(
            "Products loading error:",
            error
        );

        toast.error(
            "Failed to load products"
        );
    }
};
    useEffect(() => {

        if (warehouseId) {

            loadProducts();
            loadAllProducts();

        }

    }, [warehouseId]);

    // ==========================================
    // Handle Change
    // ==========================================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ==========================================
    // Open Add Form
    // ==========================================
    const handleAdd = () => {

        setEditingId(null);

        setFormData({
            productId: "",
            quantity: 0,
            reorderLevel: 0
        });

        setShowForm(true);
    };

    // ==========================================
    // Edit
    // ==========================================
    const handleEdit = (item) => {

        setEditingId(item.id);

        setFormData({
            productId: item.productId,
            quantity: item.quantity,
            reorderLevel: item.reorderLevel
        });

        setShowForm(true);
    };

    // ==========================================
    // Save
    // ==========================================
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.productId) {

            toast.error("Please select a product");

            return;
        }

        try {

            const data = {

                ...(editingId && {
                    id: editingId
                }),

                warehouseId: Number(warehouseId),

                productId:
                    Number(formData.productId),

                quantity:
                    Number(formData.quantity),

                reorderLevel:
                    Number(formData.reorderLevel)
            };

            if (editingId) {

                await WarehouseInventoryService.update(
                    data
                );

                toast.success(
                    "Warehouse product updated"
                );

            } else {

                await WarehouseInventoryService.create(
                    data
                );

                toast.success(
                    "Product mapped to warehouse"
                );
            }

            setShowForm(false);

            loadProducts();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save warehouse product"
            );
        }
    };

    // ==========================================
    // Delete
    // ==========================================
    const handleDelete = async (id) => {

        const result = await Swal.fire({

            title: "Remove Product?",

            text:
                "This will remove the product from this warehouse.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Yes, Remove",

            cancelButtonText: "Cancel"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            await WarehouseInventoryService.remove(id);

            toast.success(
                "Product removed from warehouse"
            );

            loadProducts();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to remove product"
            );
        }
    };

    return (
        <div className="warehouse-products-section">

            {/* Header */}
            <div className="warehouse-products-header">

                <div>
                    <h4>Warehouse Products</h4>

                    <p>
                        Products currently stored in this warehouse
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAdd}
                >
                    <FaPlus />
                    Add Product
                </button>

            </div>

            {/* Form */}
            {showForm && (

                <div className="warehouse-product-form">

                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-5 mb-3">

                                <label>
                                    Product
                                </label>

                                <select
                                    name="productId"
                                    className="form-control"
                                    value={
                                        formData.productId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Product
                                    </option>

                                    {allProducts.map(
                                        product => (

                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >
                                                {
                                                    product.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            <div className="col-md-3 mb-3">

                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    className="form-control"
                                    value={
                                        formData.quantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            <div className="col-md-3 mb-3">

                                <label>
                                    Reorder Level
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="reorderLevel"
                                    className="form-control"
                                    value={
                                        formData.reorderLevel
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            <div className="col-md-1 mb-3 d-flex align-items-end">

                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            )}

            {/* Table */}
            <div className="table-responsive">

                <table className="table warehouse-products-table">

                    <thead>

                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center"
                                >
                                    Loading...
                                </td>
                            </tr>

                        ) : products.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center"
                                >
                                    No products mapped to this
                                    warehouse.
                                </td>
                            </tr>

                        ) : (

                            products.map((item, index) => {

                                const lowStock =
                                    item.quantity <=
                                    item.reorderLevel;

                                return (
                                    <tr key={item.id}>

                                        <td>
                                            {index + 1}
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    item.productName ||
                                                    "Unknown Product"
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {item.quantity}
                                        </td>

                                        <td>
                                            {
                                                item.reorderLevel
                                            }
                                        </td>

                                        <td>

                                            {lowStock ? (

                                                <span className="warehouse-stock-badge low">
                                                    Low Stock
                                                </span>

                                            ) : (

                                                <span className="warehouse-stock-badge normal">
                                                    In Stock
                                                </span>

                                            )}

                                        </td>

                                        <td>

                                            <div className="warehouse-product-actions">

                                                <button
                                                    type="button"
                                                    className="warehouse-action edit"
                                                    onClick={() =>
                                                        handleEdit(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="warehouse-action delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default WarehouseProducts;

