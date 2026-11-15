
import axios from "axios";

const API_URL =
    "https://localhost:7011/api/WarehouseInventory";

// ==========================================
// Authentication Config
// ==========================================
const getAuthConfig = () => {

    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ==========================================
// Get All Warehouse Inventory
// ==========================================
const getAll = async () => {

    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Get Products By Warehouse
// ==========================================
const getByWarehouseId = async (warehouseId) => {

    const response = await axios.get(
        `${API_URL}/warehouse/${warehouseId}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Get Mapping By ID
// ==========================================
const getById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Map Product To Warehouse
// ==========================================
const create = async (data) => {

    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Update Mapping
// ==========================================
const update = async (data) => {

    const response = await axios.put(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Remove Product From Warehouse
// ==========================================
const remove = async (id) => {

    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const WarehouseInventoryService = {

    getAll,
    getByWarehouseId,
    getById,
    create,
    update,
    remove,

};

export default WarehouseInventoryService;

