
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FaFolderOpen,
    FaCheckCircle,
    FaPauseCircle,
    FaSearch,
    FaSyncAlt,
    FaPlus,
    FaEye,
    FaEdit,
    FaTrash,
    FaTimes
} from "react-icons/fa";

import {
    getProjects,
    deleteProject
} from "../../services/projectService";

import Pagination from "../../components/common/Pagination";
import ProjectForm from "./ProjectForm";

import "./Project.css";

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const navigate = useNavigate();

    // Load projects
    const loadProjects = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            const data = await getProjects();

            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Project loading error:", err);

            await Swal.fire({
                icon: "error",
                title: "Unable to Load Projects",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.title ||
                    "Unable to load projects. Please try again."
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Search projects
    const filteredProjects = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return projects;
        }

        return projects.filter((project) => {
            const name = String(project.name ?? "").toLowerCase();
            const description = String(
                project.description ?? ""
            ).toLowerCase();
            const id = String(project.id ?? "").toLowerCase();
            const status = project.isActive ? "active" : "inactive";

            return (
                name.includes(term) ||
                description.includes(term) ||
                id.includes(term) ||
                status.includes(term)
            );
        });
    }, [projects, search]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // Summary cards
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
        (project) => project.isActive
    ).length;
    const inactiveProjects = totalProjects - activeProjects;

    // Pagination
    const totalPages = Math.ceil(
        filteredProjects.length / itemsPerPage
    );

    const safePage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safePage - 1) * itemsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Open add/edit modal
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

    // Called after successful create/update
    const handleSaved = async () => {
        closeModal();
        await loadProjects(false);
    };

    // Delete project
    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: "Delete project?",
            text: `"${name || "This project"}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            confirmButtonColor: "#dc2626"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);

            await deleteProject(id);

            await loadProjects(false);

            await Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Project deleted successfully.",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Delete project error:", err);

            await Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.title ||
                    "Unable to delete project."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="project-page">

            {/* Header */}
            <div className="project-list-header">
                <div className="project-header-info">
                    <div className="project-breadcrumb">
                        Project Management / Projects
                    </div>

                    <h1>Projects</h1>

                    <p>
                        Manage, organize and track all your projects
                        from one place.
                    </p>
                </div>

                <div className="project-header-right">
                    <div className="project-total-card">
                        <span className="project-total-label">
                            Total Projects
                        </span>

                        <strong className="project-total-count">
                            {totalProjects}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="project-add-btn"
                        onClick={openAddModal}
                    >
                        <FaPlus />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="project-stats-grid">
                <div className="project-stat-card">
                    <div className="project-stat-icon project-stat-blue">
                        <FaFolderOpen />
                    </div>

                    <div>
                        <span>Total Projects</span>
                        <strong>{totalProjects}</strong>
                        <small>All registered projects</small>
                    </div>
                </div>

                <div className="project-stat-card">
                    <div className="project-stat-icon project-stat-green">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>Active Projects</span>
                        <strong>{activeProjects}</strong>
                        <small>Currently active</small>
                    </div>
                </div>

                <div className="project-stat-card">
                    <div className="project-stat-icon project-stat-amber">
                        <FaPauseCircle />
                    </div>

                    <div>
                        <span>Inactive Projects</span>
                        <strong>{inactiveProjects}</strong>
                        <small>Currently inactive</small>
                    </div>
                </div>

                <div className="project-stat-card">
                    <div className="project-stat-icon project-stat-purple">
                        <FaSearch />
                    </div>

                    <div>
                        <span>Search Results</span>
                        <strong>{filteredProjects.length}</strong>
                        <small>Projects matching your search</small>
                    </div>
                </div>
            </div>

            {/* Table card */}
            <div className="project-table-card">

                <div className="project-table-heading">
                    <div>
                        <h2>All Projects</h2>
                        <p>
                            View and manage your project records.
                        </p>
                    </div>

                    <div className="project-toolbar-actions">
                        <div className="project-search-box">
                            <FaSearch />

                            <input
                                type="search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search projects..."
                                aria-label="Search projects"
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="project-search-clear"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="project-refresh-btn"
                            onClick={() => loadProjects()}
                            disabled={loading}
                        >
                            <FaSyncAlt
                                className={loading ? "project-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {loading && projects.length === 0 ? (
                    <div className="project-loading">
                        <FaSyncAlt className="project-spin" />
                        <span>Loading projects...</span>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="project-no-data">
                        <FaFolderOpen />
                        <h3>
                            {search
                                ? "No matching projects"
                                : "No projects found"}
                        </h3>
                        <p>
                            {search
                                ? "Try another search term."
                                : "Add your first project to get started."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                className="project-add-btn"
                                onClick={openAddModal}
                            >
                                <FaPlus />
                                Add Project
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="project-table-wrapper">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Project</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentProjects.map((project) => (
                                        <tr key={project.id}>
                                            <td>
                                                <span className="project-id">
                                                    #{project.id}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="project-name-cell">
                                                    <div className="project-row-icon">
                                                        <FaFolderOpen />
                                                    </div>

                                                    <strong>
                                                        {project.name ||
                                                            "Untitled Project"}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                <div
                                                    className="project-description-cell"
                                                    title={
                                                        project.description ||
                                                        "No description"
                                                    }
                                                >
                                                    {project.description ||
                                                        "No description"}
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`project-status ${
                                                        project.isActive
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    <span className="project-status-dot" />
                                                    {project.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="project-table-actions">
                                                    <button
                                                        type="button"
                                                        className="project-view-btn"
                                                        title="View project"
                                                        onClick={() =>
                                                            navigate(
                                                                `/projects/details/${project.id}`
                                                            )
                                                        }
                                                    >
                                                        <FaEye />
                                                        <span>View</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="project-edit-btn"
                                                        title="Edit project"
                                                        onClick={() =>
                                                            openEditModal(
                                                                project.id
                                                            )
                                                        }
                                                    >
                                                        <FaEdit />
                                                        <span>Edit</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="project-delete-btn"
                                                        title="Delete project"
                                                        onClick={() =>
                                                            handleDelete(
                                                                project.id,
                                                                project.name
                                                            )
                                                        }
                                                    >
                                                        <FaTrash />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="project-pagination-footer">
                            <span>
                                Showing {startIndex + 1}–
                                {Math.min(
                                    startIndex + itemsPerPage,
                                    filteredProjects.length
                                )}{" "}
                                of {filteredProjects.length} projects
                            </span>

                            <Pagination
                                currentPage={safePage}
                                totalPages={Math.max(totalPages, 1)}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit modal */}
            {modalOpen &&
                createPortal(
                    <div
                        className="project-modal-backdrop"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                closeModal();
                            }
                        }}
                    >
                        <div
                            className="project-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="project-modal-title"
                        >
                            <div className="project-modal-header">
                                <div>
                                    <span className="project-modal-eyebrow">
                                        PROJECT MANAGEMENT
                                    </span>

                                    <h2 id="project-modal-title">
                                        {editingId
                                            ? "Edit Project"
                                            : "Create New Project"}
                                    </h2>

                                    <p>
                                        {editingId
                                            ? "Update the details of this project."
                                            : "Enter the details to create a project."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="project-modal-close"
                                    onClick={closeModal}
                                    aria-label="Close project form"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="project-modal-body">
                                <ProjectForm
                                    key={editingId ?? "new-project"}
                                    modalMode
                                    projectId={editingId}
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

export default ProjectList;
