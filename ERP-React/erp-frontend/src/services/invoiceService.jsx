import axios from "axios";

const API_URL = "https://localhost:7011/api/Invoice";

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
// Get All Invoices
// ==========================================

const getAll = async () => {

    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Get Invoice By ID
// ==========================================

const getById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Create Invoice
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
// Update Invoice
// ==========================================

const update = async (id, data) => {

    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Delete Invoice
// ==========================================

const deleteInvoice = async (id) => {

    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Invoice Service
// ==========================================

const InvoiceService = {

    getAll,
    getById,
    create,
    update,
    delete: deleteInvoice,

};

export default InvoiceService;