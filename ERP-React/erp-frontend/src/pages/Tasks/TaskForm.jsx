
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../api/axios";
import employeeService from "../../services/employeeService";

import "./Task.css";

function unwrapList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.$values)) return data.data.$values;
    if (Array.isArray(data?.employees)) return data.employees;
    if (Array.isArray(data?.employees?.$values)) return data.employees.$values;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.items?.$values)) return data.items.$values;
    return [];
}

function getEmployeeId(employee) {
    return (
        employee.employeeId ??
        employee.id ??
        employee.Id ??
        employee.EmployeeId
    );
}

function getEmployeeName(employee) {
    const firstName =
        employee.firstName ?? employee.FirstName ?? "";
    const lastName =
        employee.lastName ?? employee.LastName ?? "";
    const fullName =
        `${firstName} ${lastName}`.trim();

    return (
        fullName ||
        employee.name ||
        employee.fullName ||
        employee.user?.name ||
        `Employee #${getEmployeeId(employee)}`
    );
}

function TaskForm({
    modalMode = false,
    taskId = null,
    onSaved,
    onCancel
}) {
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const id = taskId ?? routeId;
    const isEdit = id !== null && id !== undefined && id !== "";

    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingTask, setLoadingTask] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        isCompleted: false,
        projectId: "",
        assignedToEmployeeId: ""
    });

    // Load projects
    const loadProjects = useCallback(async () => {
        try {
            setLoadingProjects(true);

            const response = await api.get("/Project");
            console.log("PROJECTS:", response.data);

            setProjects(unwrapList(response.data));
        } catch (error) {
            console.error(
                "PROJECT LOAD ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            setProjects([]);

            await Swal.fire({
                icon: "error",
                title: "Unable to Load Projects",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.title ||
                    "Unable to load projects."
            });
        } finally {
            setLoadingProjects(false);
        }
    }, []);

    // Load employees
    const loadEmployees = useCallback(async () => {
        try {
            setLoadingEmployees(true);

            const response = await employeeService.getEmployees();
            const employeeList = unwrapList(response);

            console.log("EMPLOYEES:", employeeList);

            setEmployees(
                employeeList.filter((employee) => {
                    const activeValue =
                        employee.isActive ??
                        employee.IsActive ??
                        employee.status ??
                        employee.Status;

                    // Include employee if the API does not provide a status.
                    if (activeValue === undefined || activeValue === null) {
                        return true;
                    }

                    if (typeof activeValue === "string") {
                        return (
                            activeValue.toLowerCase() !== "inactive" &&
                            activeValue.toLowerCase() !== "false"
                        );
                    }

                    return activeValue !== false && activeValue !== 0;
                })
            );
        } catch (error) {
            console.error(
                "EMPLOYEE LOAD ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            setEmployees([]);

            await Swal.fire({
                icon: "error",
                title: "Unable to Load Employees",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.title ||
                    "Unable to load employees."
            });
        } finally {
            setLoadingEmployees(false);
        }
    }, []);

    // Load existing task in edit mode
    const loadTask = useCallback(async () => {
        if (!isEdit) {
            setFormData({
                title: "",
                description: "",
                isCompleted: false,
                projectId: "",
                assignedToEmployeeId: ""
            });
            return;
        }

        try {
            setLoadingTask(true);

            const response = await api.get(`/Task/${id}`);
            const task = response.data;

            console.log("TASK DETAILS:", task);

            const completed =
                task.isCompleted === true ||
                String(task.status ?? "").toLowerCase() === "completed";

            setFormData({
                title: task.title || "",
                description: task.description || "",
                isCompleted: completed,
                projectId:
                    task.projectId != null
                        ? String(task.projectId)
                        : "",
                assignedToEmployeeId:
                    task.assignedToEmployeeId != null
                        ? String(task.assignedToEmployeeId)
                        : ""
            });
        } catch (error) {
            console.error(
                "TASK LOAD ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            await Swal.fire({
                icon: "error",
                title: "Unable to Load Task",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.title ||
                    "Unable to load task details."
            });

            if (!modalMode) {
                navigate("/tasks");
            }
        } finally {
            setLoadingTask(false);
        }
    }, [id, isEdit, modalMode, navigate]);

    useEffect(() => {
        loadProjects();
        loadEmployees();
        loadTask();
    }, [loadProjects, loadEmployees, loadTask]);

    // Input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Submit task
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            await Swal.fire({
                icon: "warning",
                title: "Task Title Required",
                text: "Please enter a task title."
            });
            return;
        }

        if (!formData.projectId) {
            await Swal.fire({
                icon: "warning",
                title: "Project Required",
                text: "Please select a project."
            });
            return;
        }

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            projectId: Number(formData.projectId),
            assignedToEmployeeId: formData.assignedToEmployeeId
                ? Number(formData.assignedToEmployeeId)
                : null,
            priority: "Medium",
            status: formData.isCompleted ? "Completed" : "Pending",
            dueDate: null,
            estimatedHours: 0,
            actualHours: 0,
            completedAt: formData.isCompleted
                ? new Date().toISOString()
                : null,
            isCompleted: formData.isCompleted
        };

        try {
            setSaving(true);

            console.log("TASK SAVE PAYLOAD:", payload);

            if (isEdit) {
                const updatePayload = {
                    id: Number(id),
                    ...payload
                };

                // Preserve taskCode by omitting it from the update request.
                const response = await api.put(
                    `/Task/${id}`,
                    updatePayload
                );

                console.log("TASK UPDATE RESPONSE:", response.data);

                await Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Task updated successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                const createPayload = {
                    taskCode: `TASK-${Date.now()}`,
                    ...payload
                };

                const response = await api.post(
                    "/Task",
                    createPayload
                );

                console.log("TASK CREATE RESPONSE:", response.data);

                await Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Task added successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            if (modalMode) {
                await onSaved?.();
            } else {
                navigate("/tasks");
            }
        } catch (error) {
            console.error(
                "TASK SAVE ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            await Swal.fire({
                icon: "error",
                title: "Save Failed",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.title ||
                    (typeof error.response?.data === "string"
                        ? error.response.data
                        : null) ||
                    "Something went wrong while saving the task."
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (modalMode) {
            onCancel?.();
        } else {
            navigate("/tasks");
        }
    };

    if (loadingTask || (isEdit && loadingProjects)) {
        return (
            <div className="task-form-loading">
                <div className="task-spinner" />
                <p>Loading task details...</p>
            </div>
        );
    }

    return (
        <div className={modalMode ? "task-form-modal-content" : "task-page"}>

            {!modalMode && (
                <div className="task-form-header">
                    <div>
                        <div className="task-breadcrumb">
                            Tasks / {isEdit ? "Edit" : "Create"}
                        </div>

                        <h1>
                            {isEdit ? "Edit Task" : "Create New Task"}
                        </h1>

                        <p>
                            {isEdit
                                ? "Update the task information below."
                                : "Add a new task to your project."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="task-secondary-btn"
                        onClick={handleCancel}
                    >
                        ← Back
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className={`task-form-card ${
                    modalMode ? "task-form-card-modal" : ""
                }`}
            >
                <div className="task-form-section-title">
                    <h3>Task Information</h3>
                    <p>Fields marked with * are required.</p>
                </div>

                {/* Title */}
                <div className="task-form-group">
                    <label htmlFor="taskTitle">
                        Task Title <span>*</span>
                    </label>

                    <input
                        id="taskTitle"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter task title"
                        maxLength={200}
                        required
                    />
                </div>

                {/* Description */}
                <div className="task-form-group">
                    <label htmlFor="taskDescription">
                        Description
                    </label>

                    <textarea
                        id="taskDescription"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter task description"
                        rows={4}
                    />
                </div>

                {/* Project */}
                <div className="task-form-group">
                    <label htmlFor="taskProjectId">
                        Select Project <span>*</span>
                    </label>

                    <select
                        id="taskProjectId"
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleChange}
                        required
                        disabled={loadingProjects}
                    >
                        <option value="">
                            {loadingProjects
                                ? "Loading projects..."
                                : "-- Select Project --"}
                        </option>

                        {projects.map((project) => (
                            <option
                                key={project.id ?? project.Id}
                                value={project.id ?? project.Id}
                            >
                                {project.name ?? project.Name}
                            </option>
                        ))}
                    </select>

                    {!loadingProjects && projects.length === 0 && (
                        <small className="task-form-hint">
                            No projects found. Create a project first.
                        </small>
                    )}
                </div>

                {/* Employee assignment */}
                <div className="task-form-group">
                    <label htmlFor="assignedToEmployeeId">
                        Assign To Employee
                    </label>

                    <select
                        id="assignedToEmployeeId"
                        name="assignedToEmployeeId"
                        value={formData.assignedToEmployeeId}
                        onChange={handleChange}
                        disabled={loadingEmployees}
                    >
                        <option value="">
                            {loadingEmployees
                                ? "Loading employees..."
                                : "-- Unassigned --"}
                        </option>

                        {employees.map((employee) => {
                            const employeeId = getEmployeeId(employee);

                            if (
                                employeeId === undefined ||
                                employeeId === null
                            ) {
                                return null;
                            }

                            return (
                                <option
                                    key={employeeId}
                                    value={employeeId}
                                >
                                    {getEmployeeName(employee)}
                                    {(employee.designation ||
                                        employee.Designation)
                                        ? ` — ${employee.designation ?? employee.Designation}`
                                        : ""}
                                </option>
                            );
                        })}
                    </select>

                    {!loadingEmployees && employees.length === 0 && (
                        <small className="task-form-hint">
                            No employees available. You can leave this task unassigned.
                        </small>
                    )}
                </div>

                {/* Completed */}
                <div className="task-checkbox-wrapper">
                    <input
                        type="checkbox"
                        id="taskIsCompleted"
                        name="isCompleted"
                        checked={formData.isCompleted}
                        onChange={handleChange}
                    />

                    <label htmlFor="taskIsCompleted">
                        <strong>Mark task as completed</strong>
                        <small>
                            Enable this option if the task is finished.
                        </small>
                    </label>
                </div>

                {/* Actions */}
                <div className="task-form-actions">
                    <button
                        type="button"
                        className="task-secondary-btn"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="task-primary-btn"
                        disabled={saving || loadingProjects}
                    >
                        {saving
                            ? "Saving..."
                            : isEdit
                                ? "Update Task"
                                : "Create Task"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TaskForm;
