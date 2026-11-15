
import axios from "axios";

const API_URL = "https://localhost:7011/api/Attendance";

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
// Get All Attendance
// ==========================================

const getAttendance = async () => {

    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};


// ==========================================
// Get Attendance By ID
// ==========================================

const getAttendanceById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};


// ==========================================
// Create Attendance
// ==========================================

const createAttendance = async (data) => {

    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};


// ==========================================
// Update Attendance
// ==========================================

const updateAttendance = async (id, data) => {

    const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig()
    );

    return response.data;
};


// ==========================================
// Delete Attendance
// ==========================================

const deleteAttendance = async (id) => {

    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};


// ==========================================
// Export
// ==========================================

const AttendanceService = {

    getAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
};

export default AttendanceService;

