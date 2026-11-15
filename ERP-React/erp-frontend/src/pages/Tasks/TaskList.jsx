
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaTasks,
    FaCheckCircle,
    FaClock,
    FaSearch,
    FaSyncAlt,
    FaPlus,
    FaEye,
    FaEdit,
    FaTrash,
    FaTimes
} from "react-icons/fa";

import api from "../../api/axios";
import Pagination from "../../components/common/Pagination";
import TaskForm from "./TaskForm";

import "./Task.css";

function unwrapList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.$values)) return data.data.$values;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.items?.$values)) return data.items.$values;
    return [];
}

function TaskList() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadTasks = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            const response = await api.get("/Task");
            console.log("TASK LIST RESPONSE:", response.data);

            setTasks(unwrapList(response.data));
        } catch (error) {
            console.error(
                "TASK LOAD ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            setTasks([]);

            await Swal.fire({
                icon: "error",
                title: "Unable to Load Tasks",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.title ||
                    "Something went wrong while loading tasks."
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Search by task, project, description, ID, status or priority
    const filteredTasks = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return tasks;

        return tasks.filter((task) => {
            const values = [
                task.id,
                task.taskCode,
                task.title,
                task.description,
                task.project?.name,
                task.projectName,
                task.projectId,
                task.priority,
                task.status,
                task.isCompleted ? "completed" : "pending"
            ];

            return values.some((value) =>
                String(value ?? "").toLowerCase().includes(term)
            );
        });
    }, [tasks, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const completedTasks = tasks.filter(
        (task) =>
            task.isCompleted === true ||
            String(task.status ?? "").toLowerCase() === "completed"
    ).length;

    const pendingTasks = tasks.length - completedTasks;

    const totalPages = Math.ceil(
        filteredTasks.length / itemsPerPage
    );

    const safePage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safePage - 1) * itemsPerPage;

    const currentTasks = filteredTasks.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const openAddModal = () => {
        setEditingId(null);
        setModalOpen(true);
    };

    const openEditModal = (id) => {
        setEditingId(id);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
    };

    const handleSaved = async () => {
        closeModal();
        await loadTasks(false);
    };

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: "Delete task?",
            text: `"${title || "This task"}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            confirmButtonColor: "#dc2626"
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            await api.delete(`/Task/${id}`);
            await loadTasks(false);

            await Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Task deleted successfully.",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(
                "TASK DELETE ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            await Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    error.response?.data?.title ||
                    "Unable to delete task."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleView = (id) => {
        navigate(`/tasks/details/${id}`);
    };

    return (
        <div className="task-page">

            {/* Header */}
            <div className="task-list-header">
                <div className="task-header-info">
                    <div className="task-breadcrumb">
                        Task Management / Tasks
                    </div>

                    <h1>Task Management</h1>

                    <p>
                        Manage assignments, monitor progress and track
                        task completion.
                    </p>
                </div>

                <div className="task-header-right">
                    <div className="task-total-card">
                        <span>Total Tasks</span>
                        <strong>{tasks.length}</strong>
                    </div>

                    <button
                        type="button"
                        className="task-primary-btn"
                        onClick={openAddModal}
                    >
                        <FaPlus />
                        Add Task
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="task-stats-grid">
                <div className="task-stat-card">
                    <div className="task-stat-icon task-stat-blue">
                        <FaTasks />
                    </div>
                    <div>
                        <span>Total Tasks</span>
                        <strong>{tasks.length}</strong>
                        <small>All registered tasks</small>
                    </div>
                </div>

                <div className="task-stat-card">
                    <div className="task-stat-icon task-stat-green">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span>Completed</span>
                        <strong>{completedTasks}</strong>
                        <small>Finished tasks</small>
                    </div>
                </div>

                <div className="task-stat-card">
                    <div className="task-stat-icon task-stat-amber">
                        <FaClock />
                    </div>
                    <div>
                        <span>Pending</span>
                        <strong>{pendingTasks}</strong>
                        <small>Tasks not completed</small>
                    </div>
                </div>

                <div className="task-stat-card">
                    <div className="task-stat-icon task-stat-purple">
                        <FaSearch />
                    </div>
                    <div>
                        <span>Search Results</span>
                        <strong>{filteredTasks.length}</strong>
                        <small>Matching tasks</small>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="task-table-card">
                <div className="task-table-heading">
                    <div>
                        <h2>All Tasks</h2>
                        <p>View and manage your task records.</p>
                    </div>

                    <div className="task-toolbar-actions">
                        <div className="task-search-box">
                            <FaSearch />

                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tasks..."
                                aria-label="Search tasks"
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="task-search-clear"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="task-refresh-btn"
                            onClick={() => loadTasks()}
                            disabled={loading}
                        >
                            <FaSyncAlt
                                className={loading ? "task-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {loading && tasks.length === 0 ? (
                    <div className="task-loading">
                        <div className="task-spinner" />
                        <p>Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="task-no-data">
                        <FaTasks />
                        <h3>
                            {search ? "No matching tasks" : "No tasks found"}
                        </h3>
                        <p>
                            {search
                                ? "Try a different search term."
                                : "Create your first task to get started."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                className="task-primary-btn"
                                onClick={openAddModal}
                            >
                                <FaPlus />
                                Add Task
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="task-table-wrapper">
                            <table className="task-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Task Code</th>
                                        <th>Title</th>
                                        <th>Project</th>
                                        <th>Description</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentTasks.map((task) => {
                                        const isCompleted =
                                            task.isCompleted === true ||
                                            String(task.status ?? "").toLowerCase() ===
                                                "completed";

                                        const priority = String(
                                            task.priority || "Medium"
                                        ).toLowerCase();

                                        return (
                                            <tr key={task.id}>
                                                <td>
                                                    <span className="task-id">
                                                        #{task.id}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="task-code">
                                                        {task.taskCode ||
                                                            `TASK-${task.id}`}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <strong className="task-title-cell">
                                                        {task.title ||
                                                            "Untitled Task"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {task.project?.name ||
                                                        task.projectName ||
                                                        (task.projectId
                                                            ? `Project #${task.projectId}`
                                                            : "N/A")}
                                                </td>

                                                <td>
                                                    <div
                                                        className="task-description-cell"
                                                        title={
                                                            task.description ||
                                                            "No description"
                                                        }
                                                    >
                                                        {task.description ||
                                                            "No description"}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`task-priority task-priority-${priority}`}
                                                    >
                                                        {task.priority || "Medium"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`task-status ${
                                                            isCompleted
                                                                ? "completed"
                                                                : "pending"
                                                        }`}
                                                    >
                                                        <span className="status-dot" />
                                                        {isCompleted
                                                            ? "Completed"
                                                            : task.status || "Pending"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="task-table-actions">
                                                        <button
                                                            type="button"
                                                            className="task-view-btn"
                                                            title="View task"
                                                            onClick={() =>
                                                                handleView(task.id)
                                                            }
                                                        >
                                                            <FaEye />
                                                            <span>View</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="task-edit-btn"
                                                            title="Edit task"
                                                            onClick={() =>
                                                                openEditModal(task.id)
                                                            }
                                                        >
                                                            <FaEdit />
                                                            <span>Edit</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="task-delete-btn"
                                                            title="Delete task"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    task.id,
                                                                    task.title
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="task-pagination-footer">
                            <span>
                                Showing {startIndex + 1}–
                                {Math.min(
                                    startIndex + itemsPerPage,
                                    filteredTasks.length
                                )}{" "}
                                of {filteredTasks.length} tasks
                            </span>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit modal */}
            {modalOpen &&
                createPortal(
                    <div
                        className="task-modal-backdrop"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                closeModal();
                            }
                        }}
                    >
                        <div
                            className="task-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="task-modal-title"
                        >
                            <div className="task-modal-header">
                                <div>
                                    <span className="task-modal-eyebrow">
                                        TASK MANAGEMENT
                                    </span>

                                    <h2 id="task-modal-title">
                                        {editingId
                                            ? "Edit Task"
                                            : "Create New Task"}
                                    </h2>

                                    <p>
                                        {editingId
                                            ? "Update the task details below."
                                            : "Enter the information to create a task."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="task-modal-close"
                                    onClick={closeModal}
                                    aria-label="Close task form"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="task-modal-body">
                                <TaskForm
                                    key={editingId ?? "new-task"}
                                    modalMode
                                    taskId={editingId}
                                    onSaved={handleSaved}
                                    onCancel={closeModal}
                                />
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}

export default TaskList;
