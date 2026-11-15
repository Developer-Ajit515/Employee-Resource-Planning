
import axios from "axios";

const API_URL = "https://localhost:7011/api/GoodsReceipts";
const PURCHASE_ORDER_URL = "https://localhost:7011/api/PurchaseOrder";

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getGoodsReceipts = async () => {
    const response = await axios.get(API_URL, authConfig());
    return response.data;
};

export const getGoodsReceiptById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, authConfig());
    return response.data;
};

export const createGoodsReceipt = async (data) => {
    const response = await axios.post(API_URL, data, authConfig());
    return response.data;
};

export const updateGoodsReceipt = async (id, data) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        authConfig()
    );
    return response.data;
};

export const deleteGoodsReceipt = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        authConfig()
    );
    return response.data;
};

export const getPurchaseOrdersForReceipt = async () => {
    const response = await axios.get(
        PURCHASE_ORDER_URL,
        authConfig()
    );

    return response.data;
};

