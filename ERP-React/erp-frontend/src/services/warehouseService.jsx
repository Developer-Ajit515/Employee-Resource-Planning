
import axios from "axios";

const API_URL = "https://localhost:7011/api/Warehouse";

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
// Get All Warehouses
// GET: api/Warehouse
// ==========================================
const getWarehouses = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Get Warehouse By ID
// GET: api/Warehouse/{id}
// ==========================================
const getWarehouseById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Create Warehouse
// POST: api/Warehouse
// ==========================================
const createWarehouse = async (data) => {
    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Update Warehouse
// PUT: api/Warehouse
// ==========================================
const updateWarehouse = async (data) => {
    const response = await axios.put(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Delete Warehouse
// DELETE: api/Warehouse/{id}
// ==========================================
const deleteWarehouse = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Warehouse Service
// ==========================================
const WarehouseService = {
    getWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
};

export default WarehouseService;

