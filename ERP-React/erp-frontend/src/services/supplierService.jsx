import axios from "axios";

const API_URL = "https://localhost:7011/api/Suppliers";

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getSuppliers = async () => {
    const response = await axios.get(
        API_URL,
        authConfig()
    );

    return response.data;
};

export const getSupplier = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        authConfig()
    );

    return response.data;
};

export const createSupplier = async (supplier) => {
    const response = await axios.post(
        API_URL,
        supplier,
        authConfig()
    );

    return response.data;
};

export const updateSupplier = async (id, supplier) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        supplier,
        authConfig()
    );

    return response.data;
};

export const deleteSupplier = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        authConfig()
    );

    return response.data;
};