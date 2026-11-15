
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import AttendanceService from "../../services/attendanceService";
import "./Attendance.css";

const EMPLOYEE_API_URL =
    "https://localhost:7011/api/Employee";

function AttendanceForm({ id: propId, onClose, onSaved }) {
    const navigate = useNavigate();
    const params = useParams();

    const id = propId ?? params.id;
    const isEditMode = Boolean(id);
    const isModal = typeof onClose === "function";

    const handleCancel = () => {
        if (isModal) {
            onClose();
        } else {
            navigate("/attendance");
        }
    };

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
      employeeId: "",
      attendanceDate: new Date().toISOString().slice(0, 10),
      checkInTime: "",
      checkOutTime: "",
      status: "Present",
      remarks: ""
});
    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [loadingAttendance, setLoadingAttendance] =
        useState(false);
        // FORM DATA


// EMPLOYEE LIST
const [employees, setEmployees] = useState([]);


    // ==========================================
    // AUTH CONFIG
    // ==========================================

    const getAuthConfig = () => {

        const token =
            localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };
    };


    // ==========================================
    // LOAD EMPLOYEES
    // ==========================================

    useEffect(() => {

        loadEmployees();

    }, []);


    const loadEmployees = async () => {

        try {

            setLoadingEmployees(true);

            const response =
                await axios.get(
                    EMPLOYEE_API_URL,
                    getAuthConfig()
                );

            console.log(
                "Employee API Response:",
                response.data
            );

            const employeeData =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];

            setEmployees(employeeData);

        } catch (error) {

            console.error(
                "Employee Loading Error:",
                error
            );

            console.error(
                "API Error:",
                error?.response?.data
            );

            Swal.fire(
                "Error",
                "Unable to load employees.",
                "error"
            );

        } finally {

            setLoadingEmployees(false);

        }
    };


    // ==========================================
    // LOAD ATTENDANCE FOR EDIT
    // ==========================================

    useEffect(() => {

        if (isEditMode) {
            loadAttendance();
        }

    }, [id]);


    const loadAttendance = async () => {

        try {

            setLoadingAttendance(true);

            console.log(
                "Loading Attendance ID:",
                id
            );

            const response =
                await AttendanceService
                    .getAttendanceById(id);

            console.log(
                "Attendance Details:",
                response
            );

            const data =
                response?.data || response;

            if (!data) {
    await Swal.fire(
        "Error",
        "Attendance record not found.",
        "error"
    );

    handleCancel();
    return;
}

const closeModalAfterSave = async () => {
    await onSaved?.();
    onClose?.();
};

            // ==========================================
            // FORMAT DATE
            // ==========================================

            const formattedDate =
                data.attendanceDate
                    ? data.attendanceDate.substring(0, 10)
                    : "";


            // ==========================================
            // FORMAT TIME
            // Backend:
            // 09:05:00
            //
            // HTML time input:
            // 09:05
            // ==========================================

            const formattedCheckIn =
                data.checkInTime
                    ? data.checkInTime.substring(0, 5)
                    : "";

            const formattedCheckOut =
                data.checkOutTime
                    ? data.checkOutTime.substring(0, 5)
                    : "";


            setFormData({

                employeeId:
                    data.employeeId?.toString() || "",

                attendanceDate:
                    formattedDate,

                checkInTime:
                    formattedCheckIn,

                checkOutTime:
                    formattedCheckOut,

                status:
                    data.status || "Present",

                remarks:
                    data.remarks || ""

            });

        } catch (error) {

            console.error(
                "Attendance Loading Error:",
                error
            );

            console.error(
                "API Response:",
                error?.response?.data
            );

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                "Unable to load attendance record.",
                "error"
            );

            navigate("/attendance");

        } finally {

            setLoadingAttendance(false);

        }
    };


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    // ==========================================
    // VALIDATION
    // ==========================================

    const validateForm = () => {

        if (!formData.employeeId) {

            Swal.fire(
                "Validation",
                "Please select an employee.",
                "warning"
            );

            return false;
        }


        if (!formData.attendanceDate) {

            Swal.fire(
                "Validation",
                "Please select attendance date.",
                "warning"
            );

            return false;
        }


        if (
            formData.checkInTime &&
            formData.checkOutTime &&
            formData.checkOutTime <
            formData.checkInTime
        ) {

            Swal.fire(
                "Validation",
                "Check-out time cannot be earlier than check-in time.",
                "warning"
            );

            return false;
        }


        return true;
    };


    // ==========================================
    // SUBMIT
    // CREATE / UPDATE
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validateForm()) {
            return;
        }


        const attendanceData = {

            employeeId:
                Number(formData.employeeId),

            attendanceDate:
                formData.attendanceDate,

            checkInTime:
                formData.checkInTime || null,

            checkOutTime:
                formData.checkOutTime || null,

            status:
                formData.status,

            remarks:
                formData.remarks.trim() || null

        };


        try {

            setLoading(true);


            console.log(
                isEditMode
                    ? "Attendance Update Request:"
                    : "Attendance Create Request:",
                JSON.stringify(
                    attendanceData,
                    null,
                    2
                )
            );


            // ==========================================
            // UPDATE
            // ==========================================

            if (isEditMode) {

                await AttendanceService
                    .updateAttendance(
                        id,
                        attendanceData
                    );


                await Swal.fire({

                    icon: "success",

                    title: "Updated",

                    text:
                        "Attendance updated successfully.",

                    timer: 1500,

                    showConfirmButton: false

                });

            }

            // ==========================================
            // CREATE
            // ==========================================

            else {

                await AttendanceService
                    .createAttendance(
                        attendanceData
                    );


                await Swal.fire({

                    icon: "success",

                    title: "Success",

                    text:
                        "Attendance marked successfully.",

                    timer: 1500,

                    showConfirmButton: false

                });

            }


            if (isModal) {
    closeModalAfterSave();
} else {
    navigate("/attendance");
}

        } catch (error) {

            console.error(
                "Attendance Save Error:",
                error
            );

            console.log(
                "STATUS:",
                error?.response?.status
            );

            console.log(
                "API RESPONSE DATA:",
                JSON.stringify(
                    error?.response?.data,
                    null,
                    2
                )
            );

            console.log(
                "REQUEST DATA:",
                JSON.stringify(
                    attendanceData,
                    null,
                    2
                )
            );


            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                "Unable to save attendance.";


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

    if (
        loadingEmployees ||
        loadingAttendance
    ) {

        return (

            <div className="attendance-loading">

                {loadingAttendance
                    ? "Loading attendance..."
                    : "Loading employees..."
                }

            </div>
        );
    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="attendance-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="attendance-header">

                <div>

                    <h2>

                        {isEditMode
                            ? "Edit Attendance"
                            : "Mark Attendance"
                        }

                    </h2>

                    <p>

                        {isEditMode
                            ? "Update employee attendance record"
                            : "Create employee attendance record"
                        }

                    </p>

                </div>

<button
    type="button"
    className="attendance-secondary-btn"
    onClick={handleCancel}
>
    Cancel
</button>

            </div>


            {/* ==========================================
                FORM CARD
            ========================================== */}

            <div className="attendance-form-card">

                <form onSubmit={handleSubmit}>

                    {/* ==========================================
                        FORM GRID
                    ========================================== */}

                    <div className="attendance-form-grid">


                        {/* ==========================================
                            EMPLOYEE
                        ========================================== */}

                        <div className="form-group">

                            <label>
                                Employee
                            </label>

                            <select
                                name="employeeId"
                                value={
                                    formData.employeeId
                                }
                                onChange={
                                    handleChange
                                }
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

                                            {
                                                employee.firstName
                                            }{" "}

                                            {
                                                employee.lastName
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* ==========================================
                            ATTENDANCE DATE
                        ========================================== */}

                        <div className="form-group">

                            <label>
                                Attendance Date
                            </label>

                            <input
                                type="date"
                                name="attendanceDate"
                                value={
                                    formData.attendanceDate
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* ==========================================
                            CHECK IN
                        ========================================== */}

                        <div className="form-group">

                            <label>
                                Check In Time
                            </label>

                            <input
                                type="time"
                                name="checkInTime"
                                value={
                                    formData.checkInTime
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* ==========================================
                            CHECK OUT
                        ========================================== */}

                        <div className="form-group">

                            <label>
                                Check Out Time
                            </label>

                            <input
                                type="time"
                                name="checkOutTime"
                                value={
                                    formData.checkOutTime
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* ==========================================
                            STATUS
                        ========================================== */}

                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="Present">
                                    Present
                                </option>

                                <option value="Absent">
                                    Absent
                                </option>

                                <option value="Late">
                                    Late
                                </option>

                                <option value="HalfDay">
                                    Half Day
                                </option>

                                <option value="Leave">
                                    Leave
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* ==========================================
                        REMARKS
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Remarks
                        </label>

                        <textarea
                            name="remarks"
                            value={
                                formData.remarks
                            }
                            onChange={
                                handleChange
                            }
                            rows="4"
                            placeholder="Enter remarks..."
                        />

                    </div>


                    {/* ==========================================
                        ACTION BUTTONS
                    ========================================== */}

                    <div className="attendance-form-actions">

                        <button
    type="button"
    className="attendance-secondary-btn"
    onClick={handleCancel}
>
    Cancel
</button>


                        <button
                            type="submit"
                            className="attendance-primary-btn"
                            disabled={loading}
                        >

                            {loading

                                ? "Saving..."

                                : isEditMode
                                    ? "Update Attendance"
                                    : "Mark Attendance"

                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AttendanceForm;

