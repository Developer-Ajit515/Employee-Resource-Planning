import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaEdit,
    FaClock,
    FaCalendarAlt,
    FaUser,
    FaTasks,
    FaFileAlt
} from "react-icons/fa";

import TimesheetService from "../../services/timesheetService";

import "./Timesheet.css";

function TimesheetDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [timesheet, setTimesheet] = useState(null);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Load Details
    // ==========================================
    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        try {
            setLoading(true);

            const response =
                await TimesheetService.getById(id);

            const data = response?.data ?? response;

            setTimesheet(data);

        } catch (error) {
            console.error(
                "Timesheet details error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Format Date
    // ==========================================
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="timesheet-page">
                <div className="timesheet-loading">
                    Loading timesheet details...
                </div>
            </div>
        );
    }

    if (!timesheet) {
        return (
            <div className="timesheet-page">

                <div className="timesheet-empty">
                    Timesheet not found.
                </div>

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate("/timesheets")
                    }
                >
                    <FaArrowLeft />
                    Back to Timesheets
                </button>

            </div>
        );
    }

    return (
        <div className="timesheet-page">

            {/* Header */}
            <div className="timesheet-form-header">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate("/timesheets")
                    }
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div>
                    <h2>
                        Timesheet Details
                    </h2>

                    <p>
                        View logged working hours
                    </p>
                </div>

                <button
                    className="edit-details-btn"
                    onClick={() =>
                        navigate(
                            `/timesheets/edit/${timesheet.id}`
                        )
                    }
                >
                    <FaEdit />
                    Edit
                </button>

            </div>

            {/* Details Card */}
            <div className="timesheet-details-card">

                <div className="details-top">

                    <div className="details-task">

                        <span className="details-label">
                            TASK
                        </span>

                        <h3>
                            {timesheet.projectTask?.title ||
                                `Task #${timesheet.projectTaskId}`}
                        </h3>

                        {timesheet.projectTask?.taskCode && (
                            <span className="task-code">
                                {timesheet.projectTask.taskCode}
                            </span>
                        )}

                    </div>

                    <div className="details-hours">

                        <FaClock />

                        <strong>
                            {timesheet.hours}
                        </strong>

                        <span>
                            hours
                        </span>

                    </div>

                </div>

                <div className="details-divider"></div>

                {/* Info Grid */}
                <div className="details-grid">

                    <div className="detail-item">

                        <div className="detail-icon">
                            <FaTasks />
                        </div>

                        <div>
                            <span>
                                Project Task ID
                            </span>

                            <strong>
                                #{timesheet.projectTaskId}
                            </strong>
                        </div>

                    </div>

                    <div className="detail-item">

                        <div className="detail-icon">
                            <FaUser />
                        </div>

                        <div>
                            <span>
                                Employee
                            </span>

                            <strong>
                                Employee #{timesheet.employeeId}
                            </strong>
                        </div>

                    </div>

                    <div className="detail-item">

                        <div className="detail-icon">
                            <FaCalendarAlt />
                        </div>

                        <div>
                            <span>
                                Work Date
                            </span>

                            <strong>
                                {formatDate(
                                    timesheet.workDate
                                )}
                            </strong>
                        </div>

                    </div>

                    <div className="detail-item">

                        <div className="detail-icon">
                            <FaFileAlt />
                        </div>

                        <div>
                            <span>
                                Billing
                            </span>

                            <strong
                                className={
                                    timesheet.isBillable
                                        ? "billable-text"
                                        : "nonbillable-text"
                                }
                            >
                                {timesheet.isBillable
                                    ? "Billable"
                                    : "Non-Billable"}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* Description */}
                <div className="details-description">

                    <h4>
                        Work Description
                    </h4>

                    <p>
                        {timesheet.description ||
                            "No description provided."}
                    </p>

                </div>

                {/* Created */}
                <div className="details-created">

                    Created on{" "}
                    <strong>
                        {formatDateTime(
                            timesheet.createdAt
                        )}
                    </strong>

                </div>

            </div>

        </div>
    );
}

export default TimesheetDetails;