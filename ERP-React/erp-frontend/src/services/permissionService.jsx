import axios from "axios";

const API_URL = "https://localhost:7011/api/Permission";

// Get JWT token
const getToken = () => {
    return localStorage.getItem("token");
};

// Authorization headers
const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    },
});

const PermissionService = {

    // ==========================================
    // GET ALL PERMISSIONS
    // GET: /api/Permission
    // ==========================================
    getAll: async () => {
        const response = await axios.get(
            API_URL,
            getHeaders()
        );

        return response.data;
    },

    // ==========================================
    // GET PERMISSION BY ID
    // GET: /api/Permission/{id}
    // ==========================================
    getById: async (id) => {
        const response = await axios.get(
            `${API_URL}/${id}`,
            getHeaders()
        );

        return response.data;
    },

    // ==========================================
    // CREATE PERMISSION
    // POST: /api/Permission
    // ==========================================
    create: async (permissionData) => {
        const response = await axios.post(
            API_URL,
            permissionData,
            getHeaders()
        );

        return response.data;
    },

    // ==========================================
    // UPDATE PERMISSION
    // PUT: /api/Permission
    // ==========================================
    update: async (permissionData) => {
        const response = await axios.put(
            API_URL,
            permissionData,
            getHeaders()
        );

        return response.data;
    },

    // ==========================================
    // DELETE PERMISSION
    // DELETE: /api/Permission/{id}
    // ==========================================
    delete: async (id) => {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            getHeaders()
        );

        return response.data;
    },
};

export default PermissionService;