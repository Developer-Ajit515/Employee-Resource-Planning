import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./Task.css";

function TaskDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ========================================
    // LOAD TASK DETAILS
    // ========================================

    const loadTask = async () => {
        try {
            setLoading(true);
            setError("");

            // Use common api instance so JWT is automatically attached
            const response = await api.get(`/Task/${id}`);

            console.log("TASK DETAILS:", response.data);

            setTask(response.data);
        } catch (error) {
            console.error(
                "TASK DETAILS ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load task details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadTask();
        }
    }, [id]);

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="task-page">
                <div className="task-loading">
                    <div className="task-spinner"></div>
                    <p>Loading task details...</p>
                </div>
            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error || !task) {
        return (
            <div className="task-page">
                <div className="task-error-card">
                    <div className="task-error-icon">!</div>

                    <h2>Task Not Found</h2>

                    <p>
                        {error ||
                            "The requested task could not be found."}
                    </p>

                    <button
                        type="button"
                        className="task-secondary-btn"
                        onClick={() => navigate("/tasks")}
                    >
                        ← Back to Tasks
                    </button>
                </div>
            </div>
        );
    }

    // ========================================
    // DETAILS
    // ========================================

    return (
        <div className="task-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="task-details-header">

                <div>
                    <div className="task-breadcrumb">
                        Tasks / Details
                    </div>

                    <h1>
                        Task Details
                    </h1>

                    <p>
                        View complete information about this task.
                    </p>
                </div>

                <div className="task-header-actions">

                    <button
                        type="button"
                        className="task-secondary-btn"
                        onClick={() => navigate("/tasks")}
                    >
                        ← Back
                    </button>

                    <button
                        type="button"
                        className="task-primary-btn"
                        onClick={() =>
                            navigate(`/tasks/edit/${task.id}`)
                        }
                    >
                        ✎ Edit Task
                    </button>

                </div>

            </div>

            {/* =========================
                MAIN DETAILS CARD
            ========================= */}

            <div className="task-details-card">

                {/* TITLE */}

                <div className="task-details-title-section">

                    <div className="task-title-icon">
                        ✓
                    </div>

                    <div className="task-title-content">

                        <span className="task-label">
                            TASK TITLE
                        </span>

                        <h2>
                            {task.title || "Untitled Task"}
                        </h2>

                    </div>

                </div>

                {/* STATUS */}

                <div className="task-status-box">

                    <span className="task-label">
                        STATUS
                    </span>

                    <span
                        className={
                            task.isCompleted
                                ? "task-status completed"
                                : "task-status pending"
                        }
                    >
                        <span className="status-dot"></span>

                        {task.isCompleted
                            ? "Completed"
                            : task.status || "Pending"}
                    </span>

                </div>

                <div className="task-details-divider"></div>

                {/* INFORMATION GRID */}

                <div className="task-info-grid">

                    {/* TASK ID */}

                    <div className="task-info-item">

                        <span className="task-label">
                            TASK ID
                        </span>

                        <strong>
                            #{task.id}
                        </strong>

                    </div>

                    {/* TASK CODE */}

                    <div className="task-info-item">

                        <span className="task-label">
                            TASK CODE
                        </span>

                        <strong>
                            {task.taskCode || "N/A"}
                        </strong>

                    </div>

                    {/* PROJECT */}

                    <div className="task-info-item">

                        <span className="task-label">
                            PROJECT
                        </span>

                        <strong>
                            {task.projectName ||
                                task.project?.name ||
                                task.project?.title ||
                                `Project #${task.projectId || "N/A"}`}
                        </strong>

                    </div>

                    {/* PROJECT ID */}

                    <div className="task-info-item">

                        <span className="task-label">
                            PROJECT ID
                        </span>

                        <strong>
                            {task.projectId || "N/A"}
                        </strong>

                    </div>

                    {/* PRIORITY */}

                    <div className="task-info-item">

                        <span className="task-label">
                            PRIORITY
                        </span>

                        <strong>
                            {task.priority || "Medium"}
                        </strong>

                    </div>

                    {/* CURRENT STATUS */}

                    <div className="task-info-item">

                        <span className="task-label">
                            CURRENT STATUS
                        </span>

                        <strong
                            className={
                                task.isCompleted
                                    ? "text-success"
                                    : "text-warning"
                            }
                        >
                            {task.isCompleted
                                ? "Completed"
                                : task.status || "Pending"}
                        </strong>

                    </div>

                </div>

                {/* DESCRIPTION */}

                <div className="task-description-section">

                    <span className="task-label">
                        DESCRIPTION
                    </span>

                    <div className="task-description">

                        {task.description ? (
                            <p>
                                {task.description}
                            </p>
                        ) : (
                            <p className="empty-description">
                                No description has been added
                                for this task.
                            </p>
                        )}

                    </div>

                </div>

                {/* ACTIONS */}

                <div className="task-details-actions">

                    <button
                        type="button"
                        className="task-secondary-btn"
                        onClick={() => navigate("/tasks")}
                    >
                        ← Back to Task List
                    </button>

                    <button
                        type="button"
                        className="task-primary-btn"
                        onClick={() =>
                            navigate(`/tasks/edit/${task.id}`)
                        }
                    >
                        ✎ Edit Task
                    </button>

                </div>

            </div>

        </div>
    );
}

export default TaskDetails;