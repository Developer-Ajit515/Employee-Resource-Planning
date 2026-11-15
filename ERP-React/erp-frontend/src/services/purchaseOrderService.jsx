import axios from "axios";

const API_URL = "https://localhost:7011/api/PurchaseOrder";

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getPurchaseOrders = async () => {
    const response = await axios.get(API_URL, authConfig());
    return response.data;
};

export const getPurchaseOrderById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, authConfig());
    return response.data;
};

export const createPurchaseOrder = async (data) => {
    const response = await axios.post(API_URL, data, authConfig());
    return response.data;
};

export const updatePurchaseOrder = async (id, data) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        authConfig()
    );
    return response.data;
};

export const deletePurchaseOrder = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        authConfig()
    );
    return response.data;
};