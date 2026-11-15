
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import AttendanceService from "../../services/attendanceService";
import "./Attendance.css";

function AttendanceDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendanceDetails();
    }, [id]);

    // LOAD ATTENDANCE DETAILS
    const loadAttendanceDetails = async () => {
        try {
            setLoading(true);

            const response =
                await AttendanceService.getAttendanceById(id);

            const data = response?.data || response;

            if (!data || !data.attendanceId) {
                setAttendance(null);
                return;
            }

            setAttendance(data);
        } catch (error) {
            console.error("Attendance Details Error:", error);
            console.error("API Response:", error?.response?.data);

            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                    "Unable to load attendance details.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // STATUS BADGE
    const getStatusClass = (status) => {
        switch (status) {
            case "Present":
                return "attendance-present";
            case "Absent":
                return "attendance-absent";
            case "Late":
                return "attendance-late";
            case "HalfDay":
                return "attendance-halfday";
            case "Leave":
                return "attendance-leave";
            default:
                return "";
        }
    };

    // FORMAT DATE
    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "-";

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // FORMAT TIME
    const formatTime = (time) => {
        if (!time) return "-";

        const value = String(time);

        // Handles values such as "09:05:00" or "09:05"
        const parts = value.split(":");

        if (parts.length < 2) return value;

        const hours = Number(parts[0]);
        const minutes = parts[1];

        if (
            Number.isNaN(hours) ||
            !/^\d{2}$/.test(minutes)
        ) {
            return value;
        }

        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;

        return `${String(formattedHours).padStart(2, "0")}:${minutes} ${period}`;
    };

    if (loading) {
        return (
            <div className="attendance-page">
                <div className="attendance-loading">
                    Loading attendance details...
                </div>
            </div>
        );
    }

    if (!attendance) {
        return (
            <div className="attendance-page">
                <div className="attendance-empty">
                    <h3>Attendance record not found</h3>

                    <button
                        type="button"
                        className="attendance-secondary-btn"
                        onClick={() => navigate("/attendance")}
                    >
                        Back to Attendance
                    </button>
                </div>
            </div>
        );
    }

    const employeeName =
        attendance.employeeName ||
        [
            attendance.employee?.firstName,
            attendance.employee?.lastName
        ]
            .filter(Boolean)
            .join(" ") ||
        "-";

    return (
        <div className="attendance-page">
            {/* HEADER */}
            <div className="attendance-details-header">
                <div className="attendance-details-title-box">
                    <h2>Attendance Details</h2>
                    <p>View complete employee attendance information</p>
                </div>

                <div className="attendance-details-header-actions">
                    <button
                        type="button"
                        className="attendance-secondary-btn"
                        onClick={() => navigate("/attendance")}
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        className="attendance-primary-btn"
                        onClick={() =>
                            navigate(
                                `/attendance/edit/${attendance.attendanceId}`
                            )
                        }
                    >
                        Edit Attendance
                    </button>
                </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="attendance-details-summary">
                <div className="attendance-employee-avatar">
                    {employeeName !== "-"
                        ? employeeName.charAt(0).toUpperCase()
                        : "E"}
                </div>

                <div className="attendance-employee-info">
                    <h3>{employeeName}</h3>
                    <p>
                        Employee ID:{" "}
                        {attendance.employeeId ?? "-"}
                    </p>
                    <p>
                        Attendance Date:{" "}
                        {formatDate(attendance.attendanceDate)}
                    </p>
                </div>

                <div className="attendance-details-status">
                    <span
                        className={`attendance-status ${getStatusClass(
                            attendance.status
                        )}`}
                    >
                        {attendance.status || "Unknown"}
                    </span>
                </div>
            </div>

            {/* ATTENDANCE INFORMATION */}
            <div className="attendance-details-card">
                <div className="attendance-details-card-header">
                    <h3>Attendance Information</h3>
                    <span>Record #{attendance.attendanceId}</span>
                </div>

                <div className="attendance-details-grid">
                    <div className="attendance-detail-item">
                        <span className="attendance-detail-label">
                            Employee Name
                        </span>
                        <strong>{employeeName}</strong>
                    </div>

                    <div className="attendance-detail-item">
                        <span className="attendance-detail-label">
                            Employee ID
                        </span>
                        <strong>
                            {attendance.employeeId ?? "-"}
                        </strong>
                    </div>

                    <div className="attendance-detail-item">
                        <span className="attendance-detail-label">
                            Attendance Date
                        </span>
                        <strong>
                            {formatDate(attendance.attendanceDate)}
                        </strong>
                    </div>

                    <div className="attendance-detail-item">
                        <span className="attendance-detail-label">
                            Attendance Status
                        </span>
                        <strong>
                            <span
                                className={`attendance-status ${getStatusClass(
                                    attendance.status
                                )}`}
                            >
                                {attendance.status || "Unknown"}
                            </span>
                        </strong>
                    </div>

                    <div className="attendance-detail-item">
                        <span className="attendance-detail-label">
                            Check In Time
                        </span>
                        <strong>
                            {formatTime(attendance.checkInTime)}
                        </strong>
                    </div>

                    <div className="attendance-detail-item">
                        <span className="attendance-detail-label">
                            Check Out Time
                        </span>
                        <strong>
                            {formatTime(attendance.checkOutTime)}
                        </strong>
                    </div>

                    <div className="attendance-detail-item attendance-detail-full">
                        <span className="attendance-detail-label">
                            Remarks
                        </span>
                        <p className="attendance-detail-remarks">
                            {attendance.remarks || "No remarks provided."}
                        </p>
                    </div>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="attendance-details-footer">
                <button
                    type="button"
                    className="attendance-secondary-btn"
                    onClick={() => navigate("/attendance")}
                >
                    Back to List
                </button>

                <button
                    type="button"
                    className="attendance-primary-btn"
                    onClick={() =>
                        navigate(
                            `/attendance/edit/${attendance.attendanceId}`
                        )
                    }
                >
                    Edit Attendance
                </button>
            </div>
        </div>
    );
}

export default AttendanceDetails;
