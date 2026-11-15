import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import notification from "../../utils/notification";
import InventoryService from "../../services/inventoryService";
import { getProducts } from "../../services/productService";

import "./Inventory.css";

function StockAdjustment() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        productId: "",
        quantity: "",
        remarks: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error("Error loading products:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load products."
            );
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productId) {
           notification.error("Please select a product.");
            return;
        }

        if (!formData.quantity) {
            notification.error("Please enter adjustment quantity.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                productId: Number(formData.productId),
                quantity: Number(formData.quantity),
                remarks: formData.remarks,
            };

            await InventoryService.stockAdjustment(payload);

            notification.success("Stock adjustment completed successfully.");

            navigate("/inventory");
        } catch (error) {
            console.error(
                "Stock adjustment error:",
                error
            );

          notification.error(
    error.response?.data?.message ||
    "Failed to adjust stock."
);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inventory-container">

            <div className="inventory-header">
                <div>
                    <h2>Stock Adjustment</h2>

                    <p>
                        Adjust current inventory quantity
                    </p>
                </div>
            </div>

            <div className="inventory-form-card">

                <form
                    className="inventory-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">
                        <label>
                            Product
                        </label>

                        <select
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select Product
                            </option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            Adjustment Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Enter quantity"
                        />
                    </div>

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

                    <div className="form-buttons">

                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() =>
                                navigate("/inventory")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-adjustment"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Adjust Stock"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default StockAdjustment;