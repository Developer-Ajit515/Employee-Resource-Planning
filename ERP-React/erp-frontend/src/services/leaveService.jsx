
import axios from "axios";

const API_URL = "https://localhost:7011/api/LeaveRequest";
const LEAVE_TYPE_API_URL = "https://localhost:7011/api/LeaveType";

const getAuthConfig = () => {

    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ===============================
// LEAVE REQUESTS
// ===============================

// Get all leave requests
const getLeaveRequests = async () => {

    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Get leave request by ID
const getLeaveRequestById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// Create leave request
const createLeaveRequest = async (data) => {

    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Approve leave request
const approveLeave = async (id, approvedBy) => {

    const response = await axios.put(
        `${API_URL}/${id}/approve?approvedBy=${approvedBy}`,
        {},
        getAuthConfig()
    );

    return response.data;
};

// Reject leave request
const rejectLeave = async (
    id,
    approvedBy,
    remarks
) => {

    const response = await axios.put(
        `${API_URL}/${id}/reject?approvedBy=${approvedBy}`,
        remarks,
        getAuthConfig()
    );

    return response.data;
};

// Cancel leave request
const cancelLeave = async (id) => {

    const response = await axios.put(
        `${API_URL}/${id}/cancel`,
        {},
        getAuthConfig()
    );

    return response.data;
};


// ===============================
// LEAVE TYPES
// ===============================

// Get all leave types
const getLeaveTypes = async () => {

    const response = await axios.get(
        LEAVE_TYPE_API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Get leave type by ID
const getLeaveTypeById = async (id) => {

    const response = await axios.get(
        `${LEAVE_TYPE_API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// Create leave type
const createLeaveType = async (data) => {

    const response = await axios.post(
        LEAVE_TYPE_API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Update leave type
const updateLeaveType = async (id, data) => {

    const response = await axios.put(
        `${LEAVE_TYPE_API_URL}/${id}`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Delete leave type
const deleteLeaveType = async (id) => {

    const response = await axios.delete(
        `${LEAVE_TYPE_API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};


// ===============================
// EXPORT SERVICE
// ===============================

const LeaveService = {

    // Leave Requests
    getLeaveRequests,
    getLeaveRequestById,
    createLeaveRequest,
    approveLeave,
    rejectLeave,
    cancelLeave,

    // Leave Types
    getLeaveTypes,
    getLeaveTypeById,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
};

export default LeaveService;

