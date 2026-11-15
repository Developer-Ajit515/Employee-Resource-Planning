
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import {
    addProject,
    updateProject,
    getProjects
} from "../../services/projectService";

import "./Project.css";

function ProjectForm({
    modalMode = false,
    projectId = null,
    onSaved,
    onCancel
}) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);

    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const id = projectId ?? routeId;
    const isEdit = id !== null && id !== undefined && id !== "";

    // Load project for edit
    useEffect(() => {
        let cancelled = false;

        const loadProject = async () => {
            if (!isEdit) {
                setFormData({
                    name: "",
                    description: "",
                    isActive: true
                });
                return;
            }

            try {
                setLoadingProject(true);

                const data = await getProjects();
                const projectList = Array.isArray(data) ? data : [];

                const project = projectList.find(
                    (item) => String(item.id) === String(id)
                );

                if (!project) {
                    throw new Error("Project not found.");
                }

                if (!cancelled) {
                    setFormData({
                        name: project.name || "",
                        description: project.description || "",
                        isActive: project.isActive ?? true
                    });
                }
            } catch (err) {
                console.error("Project loading error:", err);

                if (!cancelled) {
                    await Swal.fire({
                        icon: "error",
                        title: "Unable to Load Project",
                        text:
                            err.response?.data?.message ||
                            err.response?.data?.title ||
                            err.message ||
                            "Unable to load project."
                    });

                    if (!modalMode) {
                        navigate("/projects");
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoadingProject(false);
                }
            }
        };

        loadProject();

        return () => {
            cancelled = true;
        };
    }, [id, isEdit, modalMode, navigate]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            await Swal.fire({
                icon: "warning",
                title: "Project Name Required",
                text: "Please enter a project name."
            });
            return;
        }

        const payload = {
            name,
            description: formData.description.trim(),
            isActive: formData.isActive
        };

        try {
            setLoading(true);

            if (isEdit) {
                await updateProject({
                    ...payload,
                    id: Number(id)
                });

                await Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Project updated successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await addProject(payload);

                await Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Project added successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            if (modalMode) {
                await onSaved?.();
            } else {
                navigate("/projects");
            }
        } catch (err) {
            console.error(
                "Project save error:",
                err.response?.data || err
            );

            await Swal.fire({
                icon: "error",
                title: "Save Failed",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.title ||
                    err.message ||
                    "Something went wrong while saving the project."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (modalMode) {
            onCancel?.();
        } else {
            navigate("/projects");
        }
    };

    if (loadingProject) {
        return (
            <div className="project-form-loading">
                <span className="project-form-spinner" />
                <span>Loading project details...</span>
            </div>
        );
    }

    return (
        <div className={modalMode ? "project-form-modal-content" : "project-page"}>

            {!modalMode && (
                <div className="project-form-header">
                    <div>
                        <div className="project-breadcrumb">
                            Projects / {isEdit ? "Edit" : "Create"}
                        </div>

                        <h1>
                            {isEdit ? "Edit Project" : "Create New Project"}
                        </h1>

                        <p>
                            {isEdit
                                ? "Update the project information below."
                                : "Add a new project to your system."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="project-secondary-btn"
                        onClick={handleCancel}
                    >
                        ← Back
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className={`project-form-card ${
                    modalMode ? "project-form-card-modal" : ""
                }`}
            >
                <div className="project-form-section-title">
                    <h3>Project Information</h3>
                    <p>Fields marked with * are required.</p>
                </div>

                {/* Project name */}
                <div className="project-form-group">
                    <label htmlFor="projectName">
                        Project Name <span>*</span>
                    </label>

                    <input
                        id="projectName"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter project name"
                        maxLength={150}
                        required
                    />
                </div>

                {/* Description */}
                <div className="project-form-group">
                    <label htmlFor="projectDescription">
                        Description
                    </label>

                    <textarea
                        id="projectDescription"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter project description"
                        rows={5}
                    />
                </div>

                {/* Active checkbox */}
                <div className="project-checkbox-wrapper">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                    />

                    <label htmlFor="isActive">
                        <strong>Project is Active</strong>
                        <small>
                            Enable this option if the project is currently active.
                        </small>
                    </label>
                </div>

                {/* Form actions */}
                <div className="project-form-actions">
                    <button
                        type="button"
                        className="project-secondary-btn"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="project-primary-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update Project"
                                : "Create Project"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProjectForm;
