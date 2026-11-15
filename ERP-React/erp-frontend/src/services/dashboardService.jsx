import api from "../api/axios";

const getDashboard = async () => {
    const response = await api.get("/Dashboard");

    return response.data;
};

export default {
    getDashboard
};