import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Swal from "sweetalert2";

import { getProjects } from "../../services/projectService";

import "./Project.css";

function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================
    // LOAD PROJECT
    // =========================
    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);

                const data = await getProjects();

                const selectedProject = Array.isArray(data)
                    ? data.find(
                          (p) => p.id === parseInt(id, 10)
                      )
                    : null;

                if (!selectedProject) {
                    await Swal.fire({
                        icon: "error",
                        title: "Project Not Found",
                        text: "The requested project could not be found.",
                    });

                    navigate("/projects");
                    return;
                }

                setProject(selectedProject);
            } catch (error) {
                console.error(
                    "Project details error:",
                    error.response?.data || error
                );

                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.message ||
                        error.response?.data?.title ||
                        "Unable to load project details.",
                });

                navigate("/projects");
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [id, navigate]);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="project-page">
                <div className="project-loading">
                    <div className="project-spinner"></div>
                    <p>Loading project details...</p>
                </div>
            </div>
        );
    }

    // =========================
    // NO PROJECT
    // =========================
    if (!project) {
        return null;
    }

    return (
        <div className="project-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="project-details-header">

                <div>
                    <div className="project-breadcrumb">
                        Projects / Details
                    </div>

                    <h1>
                        Project Details
                    </h1>

                    <p>
                        View complete information about this project.
                    </p>
                </div>

                <div className="project-header-actions">

                    <button
                        type="button"
                        className="project-secondary-btn"
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        ← Back
                    </button>

                    <button
                        type="button"
                        className="project-primary-btn"
                        onClick={() =>
                            navigate(
                                `/projects/edit/${project.id}`
                            )
                        }
                    >
                        ✎ Edit Project
                    </button>

                </div>

            </div>

            {/* =========================
                DETAILS CARD
            ========================= */}

            <div className="project-details-card">

                {/* PROJECT TITLE */}

                <div className="project-title-section">

                    <div className="project-title-icon">
                        P
                    </div>

                    <div className="project-title-content">

                        <span className="project-label">
                            PROJECT NAME
                        </span>

                        <h2>
                            {project.name ||
                                "Untitled Project"}
                        </h2>

                    </div>

                </div>

                {/* STATUS */}

                <div className="project-status-section">

                    <span className="project-label">
                        STATUS
                    </span>

                    <span
                        className={
                            project.isActive
                                ? "project-status active"
                                : "project-status inactive"
                        }
                    >
                        <span className="project-status-dot"></span>

                        {project.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>

                </div>

                <div className="project-divider"></div>

                {/* =========================
                    INFORMATION GRID
                ========================= */}

                <div className="project-info-grid">

                    {/* PROJECT ID */}

                    <div className="project-info-item">

                        <span className="project-label">
                            PROJECT ID
                        </span>

                        <strong>
                            #{project.id}
                        </strong>

                    </div>

                    {/* PROJECT NAME */}

                    <div className="project-info-item">

                        <span className="project-label">
                            PROJECT NAME
                        </span>

                        <strong>
                            {project.name ||
                                "Untitled Project"}
                        </strong>

                    </div>

                    {/* STATUS */}

                    <div className="project-info-item">

                        <span className="project-label">
                            CURRENT STATUS
                        </span>

                        <strong
                            className={
                                project.isActive
                                    ? "project-text-active"
                                    : "project-text-inactive"
                            }
                        >
                            {project.isActive
                                ? "Active"
                                : "Inactive"}
                        </strong>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="project-info-item">

                        <span className="project-label">
                            DESCRIPTION
                        </span>

                        <strong>
                            {project.description
                                ? "Available"
                                : "Not Available"}
                        </strong>

                    </div>

                </div>

                {/* =========================
                    DESCRIPTION
                ========================= */}

                <div className="project-description-section">

                    <span className="project-label">
                        PROJECT DESCRIPTION
                    </span>

                    <div className="project-description">

                        {project.description ? (
                            <p>
                                {project.description}
                            </p>
                        ) : (
                            <p className="project-empty-description">
                                No description has been
                                added for this project.
                            </p>
                        )}

                    </div>

                </div>

                {/* =========================
                    ACTIONS
                ========================= */}

                <div className="project-details-actions">

                    <button
                        type="button"
                        className="project-secondary-btn"
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        ← Back to Project List
                    </button>

                    <button
                        type="button"
                        className="project-primary-btn"
                        onClick={() =>
                            navigate(
                                `/projects/edit/${project.id}`
                            )
                        }
                    >
                        ✎ Edit Project
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ProjectDetails;