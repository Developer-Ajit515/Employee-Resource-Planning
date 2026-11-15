
import axios from "axios";

const API_BASE_URL = "https://localhost:7011/api/Reports";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
    };
};

const reportService = {
    getSummary: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/summary`,
            getAuthConfig()
        );
        return response.data;
    },

    getTasks: async (filters = {}) => {
        const params = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params[key] = value;
            }
        });

        const response = await axios.get(
            `${API_BASE_URL}/tasks`,
            {
                ...getAuthConfig(),
                params
            }
        );

        return response.data;
    },

    getProjects: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/projects`,
            getAuthConfig()
        );
        return response.data;
    },

    getEmployees: async () => {
        const response = await axios.get(
            `${API_BASE_URL}/employees`,
            getAuthConfig()
        );
        return response.data;
    }
};

export default reportService;
