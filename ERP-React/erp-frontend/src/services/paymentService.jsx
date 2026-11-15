import axios from "axios";

const API_URL = "https://localhost:7011/api/Payment";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

const getAll = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

const getById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const create = async (data) => {
    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

const update = async (id, data) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig()
    );

    return response.data;
};

const deletePayment = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const createStripeCheckoutSession = async (invoiceId) => {
    const response = await axios.post(
        `${API_URL}/stripe/create-checkout-session`,
        {
            invoiceId: Number(invoiceId),
        },
        getAuthConfig()
    );

    return response.data;
};

const PaymentService = {
    getAll,
    getById,
    create,
    update,
    delete: deletePayment,
    createStripeCheckoutSession,
};

export default PaymentService;