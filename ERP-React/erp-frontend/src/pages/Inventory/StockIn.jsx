
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InventoryService from "../../services/inventoryService";
import { getProducts } from "../../services/productService";
import notification from "../../utils/notification";

import "./Inventory.css";

function StockIn() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        productId: "",
        quantity: "",
        remarks: "",
    });

    // ========================================
    // LOAD PRODUCTS
    // ========================================

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoadingProducts(true);

            const data = await getProducts();

            setProducts(
                Array.isArray(data)
                    ? data
                    : data?.data || []
            );
        } catch (error) {
            console.error(
                "Error loading products:",
                error
            );

            notification.error(
                error.response?.data?.message ||
                "Failed to load products."
            );
        } finally {
            setLoadingProducts(false);
        }
    };

    // ========================================
    // CHANGE
    // ========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ========================================
    // SUBMIT
    // ========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productId) {
            notification.error(
                "Please select a product."
            );
            return;
        }

        if (
            !formData.quantity ||
            Number(formData.quantity) <= 0
        ) {
            notification.error(
                "Please enter a valid quantity."
            );
            return;
        }

        try {
            setLoading(true);

            const payload = {
                productId: Number(
                    formData.productId
                ),
                quantity: Number(
                    formData.quantity
                ),
                remarks: formData.remarks,
            };

            await InventoryService.stockIn(
                payload
            );

            notification.success(
                "Stock In completed successfully."
            );

            navigate("/inventory");

        } catch (error) {
            console.error(
                "Stock In error:",
                error
            );

            notification.error(
                error.response?.data?.message ||
                "Failed to add stock."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inventory-container">

            <div className="inventory-header">

                <div>
                    <h2>Stock In</h2>

                    <p>
                        Add stock to inventory
                    </p>
                </div>

            </div>

            <div className="inventory-form-card">

                <form
                    className="inventory-form"
                    onSubmit={handleSubmit}
                >

                    {/* PRODUCT */}

                    <div className="form-group">

                        <label>
                            Product
                        </label>

                        <select
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            disabled={loadingProducts}
                        >

                            <option value="">
                                {loadingProducts
                                    ? "Loading products..."
                                    : "Select Product"}
                            </option>

                            {products.map(
                                (product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* QUANTITY */}

                    <div className="form-group">

                        <label>
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            placeholder="Enter quantity"
                        />

                    </div>

                    {/* REMARKS */}

                    <div className="form-group">

                        <label>
                            Remarks
                        </label>

                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Enter remarks"
                            rows="4"
                        />

                    </div>

                    {/* BUTTONS */}

                    <div className="form-buttons">

                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() =>
                                navigate(
                                    "/inventory"
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-stock-in"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Stock In"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default StockIn;

