
import axios from "axios";

const API_URL = "https://localhost:7011/api/Customer";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
        },
    };
};

const getAll = async () => {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
};

const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

const create = async (data) => {
    const response = await axios.post(API_URL, data, getAuthConfig());
    return response.data;
};

const update = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthConfig());
    return response.data;
};

const deleteCustomer = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

const CustomerService = {
    getAll,
    getById,
    create,
    update,
    delete: deleteCustomer,

    // Backward-compatible aliases
    getCustomerById: getById,
    createCustomer: create,
    updateCustomer: update,
    deleteCustomer,
};

export default CustomerService;
