
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import LeaveService from "../../services/leaveService";

import "./Leave.css";

const EMPLOYEE_API_URL = "https://localhost:7011/api/Employee";

function LeaveForm({ onClose, onSaved }) {
    const navigate = useNavigate();

    const isModal = typeof onClose === "function";

    const handleCancel = () => {
        if (isModal) {
            onClose();
        } else {
            navigate("/leave");
        }
    };

    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [formData, setFormData] = useState({
        employeeId: "",
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: ""
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // ==========================================
    // AUTH CONFIG
    // ==========================================

    const getAuthConfig = () => {

        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };
    };

    // ==========================================
    // LOAD EMPLOYEES + LEAVE TYPES
    // ==========================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoadingData(true);

            const [employeeResponse, leaveTypeResponse] =
                await Promise.all([
                    axios.get(
                        EMPLOYEE_API_URL,
                        getAuthConfig()
                    ),

                    LeaveService.getLeaveTypes()
                ]);

            console.log(
                "Employee API Response:",
                employeeResponse.data
            );

            console.log(
                "Leave Type API Response:",
                leaveTypeResponse
            );

            // ==========================================
            // EMPLOYEES
            // ==========================================

            const employeeData =
                Array.isArray(employeeResponse.data)
                    ? employeeResponse.data
                    : employeeResponse.data?.data || [];

            setEmployees(employeeData);

            // ==========================================
            // LEAVE TYPES
            // ==========================================

            const leaveTypeData =
                Array.isArray(leaveTypeResponse)
                    ? leaveTypeResponse
                    : leaveTypeResponse?.data || [];

            setLeaveTypes(leaveTypeData);

        } catch (error) {

            console.error(
                "Load Leave Form Data Error:",
                error
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            const message =
                error?.response?.data?.message ||
                "Unable to load employees or leave types.";

            Swal.fire(
                "Error",
                message,
                "error"
            );

        } finally {

            setLoadingData(false);
        }
    };

    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ==========================================
    // CALCULATE DAYS
    // ==========================================

    const calculateDays = () => {

        if (
            !formData.fromDate ||
            !formData.toDate
        ) {
            return 0;
        }

        const from =
            new Date(formData.fromDate);

        const to =
            new Date(formData.toDate);

        const difference =
            Math.ceil(
                (to - from) /
                (1000 * 60 * 60 * 24)
            ) + 1;

        return difference > 0
            ? difference
            : 0;
    };

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.employeeId) {

            Swal.fire(
                "Validation",
                "Please select an employee.",
                "warning"
            );

            return;
        }

        if (!formData.leaveTypeId) {

            Swal.fire(
                "Validation",
                "Please select a leave type.",
                "warning"
            );

            return;
        }

        if (
            !formData.fromDate ||
            !formData.toDate
        ) {

            Swal.fire(
                "Validation",
                "Please select leave dates.",
                "warning"
            );

            return;
        }

        if (
            formData.fromDate >
            formData.toDate
        ) {

            Swal.fire(
                "Validation",
                "From date cannot be greater than To date.",
                "warning"
            );

            return;
        }

        if (!formData.reason.trim()) {

            Swal.fire(
                "Validation",
                "Please enter a reason.",
                "warning"
            );

            return;
        }

        try {

            setLoading(true);

            await LeaveService.createLeaveRequest({

                employeeId:
                    Number(formData.employeeId),

                leaveTypeId:
                    Number(formData.leaveTypeId),

                fromDate:
                    formData.fromDate,

                toDate:
                    formData.toDate,

                reason:
                    formData.reason.trim()
            });

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: "Leave request submitted successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            if (isModal) {
    await onSaved?.();
} else {
    navigate("/leave");
}

        } catch (error) {

            console.error(
                "Create Leave Error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                "Unable to create leave request.";

            Swal.fire(
                "Error",
                message,
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loadingData) {

        return (
            <div className="leave-loading">
                Loading...
            </div>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="leave-page">

            <div className="leave-header">

                <div>

                    <h2>
                        Apply Leave
                    </h2>

                    <p>
                        Create a new employee leave request
                    </p>

                </div>

               {!isModal && (
    <button
        type="button"
        className="leave-secondary-btn"
        onClick={handleCancel}
    >
        Back
    </button>
)}

            </div>


            <div className="leave-form-card">

                <form onSubmit={handleSubmit}>

                    <div className="leave-form-grid">

                        {/* =========================
                            EMPLOYEE
                        ========================== */}

                        <div className="form-group">

                            <label>
                                Employee
                            </label>

                            <select
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Employee
                                </option>

                                {employees.map(
                                    (employee) => (

                                        <option
                                            key={
                                                employee.employeeId
                                            }
                                            value={
                                                employee.employeeId
                                            }
                                        >

                                            {employee.firstName}{" "}
                                            {employee.lastName}

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =========================
                            LEAVE TYPE
                        ========================== */}

                        <div className="form-group">

                            <label>
                                Leave Type
                            </label>

                            <select
                                name="leaveTypeId"
                                value={formData.leaveTypeId}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Leave Type
                                </option>

                                {leaveTypes.map(
                                    (type) => (

                                        <option
                                            key={
                                                type.leaveTypeId
                                            }
                                            value={
                                                type.leaveTypeId
                                            }
                                        >

                                            {type.name}

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =========================
                            FROM DATE
                        ========================== */}

                        <div className="form-group">

                            <label>
                                From Date
                            </label>

                            <input
                                type="date"
                                name="fromDate"
                                value={
                                    formData.fromDate
                                }
                                onChange={handleChange}
                            />

                        </div>


                        {/* =========================
                            TO DATE
                        ========================== */}

                        <div className="form-group">

                            <label>
                                To Date
                            </label>

                            <input
                                type="date"
                                name="toDate"
                                value={
                                    formData.toDate
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* =========================
                        TOTAL DAYS
                    ========================== */}

                    <div className="leave-days-box">

                        <span>
                            Total Leave Days
                        </span>

                        <strong>
                            {calculateDays()}
                        </strong>

                    </div>


                    {/* =========================
                        REASON
                    ========================== */}

                    <div className="form-group">

                        <label>
                            Reason
                        </label>

                        <textarea
                            name="reason"
                            value={
                                formData.reason
                            }
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter reason for leave..."
                        />

                    </div>


                    {/* =========================
                        ACTIONS
                    ========================== */}

                    <div className="leave-form-actions">

                       <button
    type="button"
    className="leave-secondary-btn"
    onClick={handleCancel}
>
    Cancel
</button>

                        <button
                            type="submit"
                            className="leave-primary-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Submitting..."
                                : "Submit Leave"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default LeaveForm;

