import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaSave, FaArrowLeft } from "react-icons/fa";

import TimesheetService from "../../services/timesheetService";
import TaskService from "../../services/taskService";
import EmployeeService from "../../services/employeeService";

import "./Timesheet.css";

function unwrapArray(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.$values)) return data.data.$values;
    if (Array.isArray(data?.items)) return data.items;

    return [];
}

function unwrapObject(response) {
    let data = response?.data ?? response;

    if (data?.$values) return null;

    if (data?.data && !Array.isArray(data.data)) {
        data = data.data;
    }

    return data && typeof data === "object" ? data : null;
}

function TimesheetForm({
    modalMode = false,
    timesheetId = null,
    onSaved,
    onCancel
}) {
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const id = timesheetId ?? routeId ?? null;
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [dropdownLoading, setDropdownLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        projectTaskId: "",
        employeeId: "",
        workDate: new Date().toISOString().slice(0, 10),
        hours: "",
        description: "",
        isBillable: false
    });

    const loadTasks = useCallback(async () => {
        try {
            const response = await TaskService.getAll();
            const data = unwrapArray(response);

            setTasks(data);
        } catch (error) {
            console.error(
                "Task loading error:",
                error?.response?.data || error?.message
            );

            setTasks([]);

            Swal.fire({
                title: "Task Loading Error",
                text:
                    error?.response?.data?.message ||
                    "Unable to load tasks. Please check the Task API.",
                icon: "error"
            });
        }
    }, []);

    const loadEmployees = useCallback(async () => {
        try {
            const response = await EmployeeService.getEmployees();
            const data = unwrapArray(response);

            setEmployees(
                data.filter(
                    (employee) =>
                        employee &&
                        (employee.employeeId ?? employee.id) != null &&
                        employee.status !== false &&
                        employee.isActive !== false
                )
            );
        } catch (error) {
            console.error(
                "Employee loading error:",
                error?.response?.data || error?.message
            );

            setEmployees([]);

            Swal.fire({
                title: "Employee Loading Error",
                text:
                    error?.response?.data?.message ||
                    "Unable to load employees. Please check the Employee API.",
                icon: "error"
            });
        }
    }, []);

    const loadTimesheet = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);

            const response =
                await TimesheetService.getTimesheetById(id);

            const item = unwrapObject(response);

            if (!item || item.id == null) {
                throw new Error("Timesheet record was not found.");
            }

            setFormData({
                projectTaskId: String(item.projectTaskId ?? ""),
                employeeId: String(item.employeeId ?? ""),
                workDate: item.workDate
                    ? String(item.workDate).slice(0, 10)
                    : "",
                hours: item.hours ?? "",
                description: item.description ?? "",
                isBillable: Boolean(item.isBillable)
            });
        } catch (error) {
            console.error(
                "Timesheet loading error:",
                error?.response?.data || error?.message
            );

            await Swal.fire({
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load timesheet.",
                icon: "error"
            });

            if (!modalMode) {
                navigate("/timesheets");
            } else if (onCancel) {
                onCancel();
            }
        } finally {
            setLoading(false);
        }
    }, [id, modalMode, navigate, onCancel]);

    useEffect(() => {
        let active = true;

        const loadDropdowns = async () => {
            setDropdownLoading(true);

            try {
                await Promise.all([loadTasks(), loadEmployees()]);
            } finally {
                if (active) setDropdownLoading(false);
            }
        };

        loadDropdowns();

        return () => {
            active = false;
        };
    }, [loadTasks, loadEmployees]);

    useEffect(() => {
        if (id) {
            loadTimesheet();
        }
    }, [id, loadTimesheet]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCancel = () => {
        if (modalMode && onCancel) {
            onCancel();
        } else {
            navigate("/timesheets");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.projectTaskId) {
            await Swal.fire(
                "Validation",
                "Please select a task.",
                "warning"
            );
            return;
        }

        if (!formData.employeeId) {
            await Swal.fire(
                "Validation",
                "Please select an employee.",
                "warning"
            );
            return;
        }

        if (!formData.workDate) {
            await Swal.fire(
                "Validation",
                "Please select work date.",
                "warning"
            );
            return;
        }

        const hours = Number(formData.hours);

        if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
            await Swal.fire(
                "Validation",
                "Hours must be greater than 0 and cannot exceed 24 per day.",
                "warning"
            );
            return;
        }

        try {
            setLoading(true);

            const payload = {
                projectTaskId: Number(formData.projectTaskId),
                employeeId: Number(formData.employeeId),
                workDate: formData.workDate,
                hours,
                description: formData.description.trim() || null,
                isBillable: Boolean(formData.isBillable)
            };

            if (isEditMode) {
                await TimesheetService.updateTimesheet(id, payload);
            } else {
                await TimesheetService.createTimesheet(payload);
            }

            if (modalMode && onSaved) {
                await Swal.fire({
                    title: isEditMode ? "Updated!" : "Created!",
                    text: isEditMode
                        ? "Timesheet updated successfully."
                        : "Timesheet created successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

                await onSaved();
            } else {
                await Swal.fire({
                    title: isEditMode ? "Updated!" : "Created!",
                    text: isEditMode
                        ? "Timesheet updated successfully."
                        : "Timesheet created successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

                navigate("/timesheets");
            }
        } catch (error) {
            console.error(
                "Save timesheet error:",
                error?.response?.data || error?.message
            );

            const responseData = error?.response?.data;

            const message =
                responseData?.message ||
                responseData?.title ||
                (typeof responseData === "string" ? responseData : null) ||
                error?.message ||
                "Unable to save timesheet.";

            Swal.fire({
                title: "Error",
                text: message,
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`timesheet-form-page ${
                modalMode ? "timesheet-form-modal-mode" : ""
            }`}
        >
            {!modalMode && (
                <div className="timesheet-form-header">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={handleCancel}
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <div>
                        <h2>
                            {isEditMode
                                ? "Edit Timesheet"
                                : "Add Timesheet"}
                        </h2>

                        <p>
                            {isEditMode
                                ? "Update logged working hours"
                                : "Log working hours against a task"}
                        </p>
                    </div>
                </div>
            )}

            {loading && isEditMode ? (
                <div className="timesheet-form-loading">
                    <div className="timesheet-spinner" />
                    <span>Loading timesheet details...</span>
                </div>
            ) : (
                <form
                    className="timesheet-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-grid">
                        {/* Task */}
                        <div className="form-group">
                            <label htmlFor="projectTaskId">
                                Task <span>*</span>
                            </label>

                            <select
                                id="projectTaskId"
                                name="projectTaskId"
                                value={formData.projectTaskId}
                                onChange={handleChange}
                                required
                                disabled={dropdownLoading || loading}
                            >
                                <option value="">
                                    {dropdownLoading
                                        ? "Loading tasks..."
                                        : tasks.length
                                          ? "Select Task"
                                          : "No tasks available"}
                                </option>

                                {tasks.map((task) => {
                                    const taskId = task.id ?? task.projectTaskId;

                                    if (taskId == null) return null;

                                    return (
                                        <option
                                            key={taskId}
                                            value={taskId}
                                        >
                                            {task.taskCode
                                                ? `${task.taskCode} - ${
                                                      task.title ||
                                                      `Task #${taskId}`
                                                  }`
                                                : task.title ||
                                                  `Task #${taskId}`}
                                        </option>
                                    );
                                })}
                            </select>

                            {!dropdownLoading && tasks.length === 0 && (
                                <small className="timesheet-field-hint">
                                    No tasks were returned by the Task API.
                                </small>
                            )}
                        </div>

                        {/* Employee */}
                        <div className="form-group">
                            <label htmlFor="employeeId">
                                Employee <span>*</span>
                            </label>

                            <select
                                id="employeeId"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                required
                                disabled={dropdownLoading || loading}
                            >
                                <option value="">
                                    {dropdownLoading
                                        ? "Loading employees..."
                                        : employees.length
                                          ? "Select Employee"
                                          : "No employees available"}
                                </option>

                                {employees.map((employee) => {
                                    const employeeId =
                                        employee.employeeId ?? employee.id;

                                    if (employeeId == null) return null;

                                    const fullName =
                                        [
                                            employee.firstName,
                                            employee.lastName
                                        ]
                                            .filter(Boolean)
                                            .join(" ") ||
                                        employee.name ||
                                        employee.fullName ||
                                        `Employee #${employeeId}`;

                                    return (
                                        <option
                                            key={employeeId}
                                            value={employeeId}
                                        >
                                            {fullName}
                                        </option>
                                    );
                                })}
                            </select>

                            {!dropdownLoading &&
                                employees.length === 0 && (
                                    <small className="timesheet-field-hint">
                                        No employees were returned by the Employee API.
                                    </small>
                                )}
                        </div>

                        {/* Work Date */}
                        <div className="form-group">
                            <label htmlFor="workDate">
                                Work Date <span>*</span>
                            </label>

                            <input
                                id="workDate"
                                type="date"
                                name="workDate"
                                value={formData.workDate}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Hours */}
                        <div className="form-group">
                            <label htmlFor="hours">
                                Hours <span>*</span>
                            </label>

                            <input
                                id="hours"
                                type="number"
                                name="hours"
                                value={formData.hours}
                                onChange={handleChange}
                                placeholder="e.g. 8"
                                min="0.1"
                                max="24"
                                step="0.25"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group full-width">
                            <label htmlFor="description">
                                Work Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the work completed..."
                                rows={4}
                                maxLength={1000}
                                disabled={loading}
                            />

                            <small className="timesheet-character-count">
                                {formData.description.length}/1000
                            </small>
                        </div>

                        {/* Billable */}
                        <div className="form-group full-width checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isBillable"
                                    checked={formData.isBillable}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <span>
                                    <strong>Billable Hours</strong>
                                    <small>
                                        Mark this time entry as billable to the client.
                                    </small>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={
                                loading ||
                                dropdownLoading ||
                                tasks.length === 0 ||
                                employees.length === 0
                            }
                        >
                            <FaSave />
                            {loading
                                ? "Saving..."
                                : isEditMode
                                  ? "Update Timesheet"
                                  : "Save Timesheet"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default TimesheetForm;