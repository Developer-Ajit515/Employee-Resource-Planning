import axios from "axios";

const API_URL = "https://localhost:7011/api/SalesOrder";

const getAuthConfig = () => {

    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// Get all sales orders
const getSalesOrders = async () => {

    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Get sales order by ID
const getSalesOrderById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// Create sales order
const createSalesOrder = async (data) => {

    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Update sales order
const updateSalesOrder = async (id, data) => {

    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Delete sales order
const deleteSalesOrder = async (id) => {

    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const SalesOrderService = {

    getSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,

};

export default SalesOrderService;