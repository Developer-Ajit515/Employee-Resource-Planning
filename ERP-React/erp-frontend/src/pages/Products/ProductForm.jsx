
import React, { useEffect, useState } from "react";

import {
    createProduct,
    getProductById,
    updateProduct
} from "../../api/productApi";

import "./Product.css";

import notification from "../../utils/notification";

import { useNavigate, useParams } from "react-router-dom";

import {
    FaSave,
    FaTimes
} from "react-icons/fa";


const ProductForm = ({
    id: propId,
    isModal = false,
    onCancel,
    onSuccess
}) => {
    const { id: routeId } = useParams();
    const navigate = useNavigate();

    const id = propId ?? routeId;
    const isEdit = Boolean(id);


    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        price: "",
        stock: "",
        categoryId: ""
    });

    const [loading, setLoading] = useState(false);

    // ==============================
    // LOAD PRODUCT FOR EDIT
    // ==============================

    useEffect(() => {
        if (isEdit) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);

            const data = await getProductById(id);

            setFormData({
                id: data.id,
                name: data.name || "",
                price: data.price ?? "",
                stock: data.stock ?? "",
                categoryId: data.categoryId ?? ""
            });

        } catch (error) {
            console.error("Error loading product:", error);

            notification.error(
                error.response?.data?.message ||
                "Unable to load product."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // HANDLE INPUT
    // ==============================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ==============================
    // SUBMIT
    // ==============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const productData = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                categoryId: Number(formData.categoryId)
            };

            if (isEdit) {
                await updateProduct(productData);

                notification.success(
                    "Product updated successfully"
                );
            } else {
                await createProduct(productData);

                notification.success(
                    "Product created successfully"
                );
            }

            navigate("/products");

        } catch (error) {
            console.error("Product save error:", error);

            notification.error(
                error.response?.data?.message ||
                "Unable to save product."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-page">

            {/* PAGE HEADER */}

            <div className="product-page-header">

                <div>
                    <h1 className="product-page-title">
                        {isEdit
                            ? "Edit Product"
                            : "Add Product"}
                    </h1>

                    <p className="product-page-subtitle">
                        {isEdit
                            ? "Update product information"
                            : "Create a new product"}
                    </p>
                </div>

            </div>


            {/* FORM CARD */}

            <div className="product-form-card">

                <div className="product-form-body">

                    <form onSubmit={handleSubmit}>

                        {/* PRODUCT NAME */}

                        <div className="product-form-group">

                            <label className="product-form-label">
                                Product Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                className="product-form-input"
                                placeholder="Enter product name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* CATEGORY */}

                        <div className="product-form-group">

                            <label className="product-form-label">
                                Category ID
                            </label>

                            <input
                                type="number"
                                name="categoryId"
                                className="product-form-input"
                                placeholder="Enter category ID"
                                min="1"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* PRICE */}

                        <div className="product-form-group">

                            <label className="product-form-label">
                                Price
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                className="product-form-input"
                                placeholder="Enter product price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* STOCK */}

                        <div className="product-form-group">

                            <label className="product-form-label">
                                Stock
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="stock"
                                className="product-form-input"
                                placeholder="Enter stock quantity"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* BUTTONS */}

                        <div className="product-form-actions">

                            <button
                                type="submit"
                                className="product-save-btn"
                                disabled={loading}
                            >

                                <FaSave
                                    style={{
                                        marginRight: "7px"
                                    }}
                                />

                                {loading
                                    ? "Saving..."
                                    : isEdit
                                        ? "Update Product"
                                        : "Create Product"
                                }

                            </button>


                            <button
                                type="button"
                                className="product-cancel-btn"
                                disabled={loading}
                              
                                onClick={() => {
                                if (onCancel) {
                                onCancel();
                                } else {
                                navigate("/products");
                                }
                                }}

                            >

                                <FaTimes
                                    style={{
                                        marginRight: "7px"
                                    }}
                                />

                                Cancel

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default ProductForm;

