
import axios from "axios";

const API_URL = "https://localhost:7011/api/Department";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// Get all departments
const getDepartments = async () => {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
};

// Get department by ID
const getDepartmentById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

// Create department
const createDepartment = async (department) => {
    const response = await axios.post(
        API_URL,
        department,
        getAuthConfig()
    );

    return response.data;
};

// Update department
const updateDepartment = async (id, department) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        department,
        getAuthConfig()
    );

    return response.data;
};

// Delete department
const deleteDepartment = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const DepartmentService = {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};

export default DepartmentService;

