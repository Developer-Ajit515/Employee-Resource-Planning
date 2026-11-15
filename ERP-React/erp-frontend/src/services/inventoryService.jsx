import axios from "axios";

const API_URL = "https://localhost:7011/api/Inventory";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// Get all inventory
const getInventory = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Get inventory by ID
const getInventoryById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// Get inventory by Product ID
const getInventoryByProductId = async (productId) => {
    const response = await axios.get(
        `${API_URL}/product/${productId}`,
        getAuthConfig()
    );

    return response.data;
};

// Stock In
const stockIn = async (data) => {
    const response = await axios.post(
        `${API_URL}/stock-in`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Stock Out
const stockOut = async (data) => {
    const response = await axios.post(
        `${API_URL}/stock-out`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Stock Adjustment
const stockAdjustment = async (data) => {
    const response = await axios.post(
        `${API_URL}/adjustment`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Delete inventory
const deleteInventory = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const InventoryService = {
    getInventory,
    getInventoryById,
    getInventoryByProductId,
    stockIn,
    stockOut,
    stockAdjustment,
    deleteInventory,
};

export default InventoryService;