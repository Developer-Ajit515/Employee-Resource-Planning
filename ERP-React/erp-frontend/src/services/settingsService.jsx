
import axios from "axios";

const API_URL = "https://localhost:7011/api/Settings";

const getAuthConfig = () => {

    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// Get Settings
const getSettings = async () => {

    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Update Settings
const updateSettings = async (data) => {

    const response = await axios.put(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

const SettingsService = {

    getSettings,
    updateSettings,

};

export default SettingsService;

