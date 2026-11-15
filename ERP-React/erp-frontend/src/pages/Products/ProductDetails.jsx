
import React, { useEffect, useState } from "react";
import { getProductById } from "../../api/productApi";
import { useNavigate, useParams } from "react-router-dom";
import "./Product.css";

import {
    FaArrowLeft,
    FaEdit,
    FaBoxOpen
} from "react-icons/fa";

const ProductDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadProduct();

    }, [id]);


    const loadProduct = async () => {

        try {

            setLoading(true);

            const data = await getProductById(id);

            setProduct(data);

        } catch (error) {

            console.error(
                "Error loading product:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // ==============================
    // LOADING
    // ==============================

    if (loading) {

        return (

            <div className="product-page">

                <div className="product-loading">

                    <div className="product-loading-spinner"></div>

                    <span>
                        Loading product...
                    </span>

                </div>

            </div>

        );
    }


    // ==============================
    // NOT FOUND
    // ==============================

    if (!product) {

        return (

            <div className="product-page">

                <div className="product-empty-state">

                    <div className="product-empty-icon">
                        <FaBoxOpen />
                    </div>

                    <div className="product-empty-title">
                        Product Not Found
                    </div>

                    <p className="product-empty-text">
                        The requested product could not be found.
                    </p>

                    <button
                        className="product-cancel-btn"
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        <FaArrowLeft
                            style={{
                                marginRight: "7px"
                            }}
                        />
                        Back to Products
                    </button>

                </div>

            </div>

        );
    }


    return (

        <div className="product-page">

            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="product-page-header">

                <div>

                    <h1 className="product-page-title">
                        Product Details
                    </h1>

                    <p className="product-page-subtitle">
                        View product information
                    </p>

                </div>


                <button
                    className="product-cancel-btn"
                    onClick={() =>
                        navigate("/products")
                    }
                >

                    <FaArrowLeft
                        style={{
                            marginRight: "7px"
                        }}
                    />

                    Back to Products

                </button>

            </div>


            {/* =================================
                DETAILS CARD
            ================================= */}

            <div className="product-details-card">


                {/* HEADER */}

                <div className="product-details-header">

                    <div className="product-name-wrapper">

                        <div className="product-icon">
                            <FaBoxOpen />
                        </div>

                        <div>

                            <h2 className="product-page-title">
                                {product.name}
                            </h2>

                            <p className="product-page-subtitle">
                                Product ID: #{product.id}
                            </p>

                        </div>

                    </div>

                </div>


                {/* CONTENT */}

                <div className="product-details-content">

                    <div className="product-detail-item">

                        <span className="product-detail-label">
                            Product Name
                        </span>

                        <p className="product-detail-value">
                            {product.name}
                        </p>

                    </div>


                    <div className="product-detail-item">

                        <span className="product-detail-label">
                            Category
                        </span>

                        <p className="product-detail-value">
                            {product.category?.name || "-"}
                        </p>

                    </div>


                    <div className="product-detail-item">

                        <span className="product-detail-label">
                            Price
                        </span>

                        <p className="product-detail-value product-price">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                    </div>


                    <div className="product-detail-item">

                        <span className="product-detail-label">
                            Stock
                        </span>

                        <p className="product-detail-value">

                            <span
                                className={
                                    product.stock <= 5
                                        ? "product-stock product-stock-low"
                                        : product.stock <= 15
                                            ? "product-stock product-stock-medium"
                                            : "product-stock product-stock-normal"
                                }
                            >
                                {product.stock} Units
                            </span>

                        </p>

                    </div>


                    {/* ACTIONS */}

                    <div className="product-form-actions">

                        <button
                            className="product-save-btn"
                            onClick={() =>
                                navigate(
                                    `/products/edit/${product.id}`
                                )
                            }
                        >

                            <FaEdit
                                style={{
                                    marginRight: "7px"
                                }}
                            />

                            Edit Product

                        </button>


                        <button
                            className="product-cancel-btn"
                            onClick={() =>
                                navigate("/products")
                            }
                        >

                            <FaArrowLeft
                                style={{
                                    marginRight: "7px"
                                }}
                            />

                            Back

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProductDetails;

