import api from "../api/axios";

// Get all users
export const getUsers = async () => {
    const response = await api.get("/User");
    return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
    const response = await api.get(`/User/${id}`);
    return response.data;
};

// Add new user
export const addUser = async (userData) => {
    const response = await api.post("/User", userData);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await api.put(
        `/User/${id}`,
        userData
    );

    return response.data;
};

// Delete user
export const deleteUser = async (id) => {
    const response = await api.delete(`/User/${id}`);
    return response.data;
};

export default {
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
};