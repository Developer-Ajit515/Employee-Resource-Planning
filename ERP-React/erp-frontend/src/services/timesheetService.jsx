import axios from "axios";

const API_URL = "https://localhost:7011/api/Timesheet";

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
// Get All Timesheets
// ==========================================
const getTimesheets = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Get Timesheet By ID
// ==========================================
const getTimesheetById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Create Timesheet
// ==========================================
const createTimesheet = async (data) => {
    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Update Timesheet
// ==========================================
const updateTimesheet = async (id, data) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Delete Timesheet
// ==========================================
const deleteTimesheet = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ==========================================
// Export
// ==========================================
const TimesheetService = {
    getTimesheets,
    getTimesheetById,
    createTimesheet,
    updateTimesheet,
    deleteTimesheet,
};

export default TimesheetService;