
import api from "../api/axios";


// Get all products
export const getProducts = async () => {
    const response = await api.get("/Product");
    return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
    const response = await api.get(`/Product/${id}`);
    return response.data;
};

// Create product
export const createProduct = async (product) => {
    const response = await api.post("/Product", product);
    return response.data;
};

// Update product
export const updateProduct = async (product) => {
    const response = await api.put("/Product", product);
    return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
    const response = await api.delete(`/Product/${id}`);
    return response.data;
};

// Get low-stock products
export const getLowStockProducts = async (threshold = 10) => {
    const response = await api.get(
        `/Product/low-stock?threshold=${threshold}`
    );
    return response.data;
};

