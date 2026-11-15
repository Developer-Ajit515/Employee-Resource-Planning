import axios from "axios";

const API_URL = "https://localhost:7011/api/task";

const getToken = () => {
    return localStorage.getItem("token");
};

const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

const taskService = {

    getAll: async () => {
        const response = await axios.get(
            API_URL,
            getHeaders()
        );

        return response.data;
    },

    getById: async (id) => {
        const response = await axios.get(
            `${API_URL}/${id}`,
            getHeaders()
        );

        return response.data;
    },

    create: async (task) => {
        const response = await axios.post(
            API_URL,
            task,
            getHeaders()
        );

        return response.data;
    },

    update: async (id, task) => {
        const response = await axios.put(
            `${API_URL}/${id}`,
            task,
            getHeaders()
        );

        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            getHeaders()
        );

        return response.data;
    }
};

export default taskService;