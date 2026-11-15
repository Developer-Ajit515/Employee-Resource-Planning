
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import PermissionService from "../../services/permissionService";
import Pagination from "../../components/common/Pagination";
import PermissionForm from "./PermissionForm";

import "./Permission.css";

function PermissionList() {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewPermission, setViewPermission] = useState(null);

    const itemsPerPage = 10;

    const loadPermissions = useCallback(async () => {
        try {
            setLoading(true);

            const response = await PermissionService.getAll();
            const result = response?.data ?? response;

            const rows = Array.isArray(result)
                ? result
                : result?.$values ??
                  result?.items ??
                  result?.data ??
                  [];

            setPermissions(Array.isArray(rows) ? rows : []);
        } catch (error) {
            console.error("Error loading permissions:", error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to load permissions"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const getId = (item) => item.id ?? item.Id;
    const getName = (item) => item.name ?? item.Name ?? "";
    const getDescription = (item) =>
        item.description ?? item.Description ?? "";

    const filteredPermissions = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return permissions;

        return permissions.filter((permission) =>
            getName(permission).toLowerCase().includes(query) ||
            getDescription(permission).toLowerCase().includes(query)
        );
    }, [permissions, search]);

    const countByAction = (action) =>
        permissions.filter((permission) =>
            getName(permission).toLowerCase().endsWith(`.${action.toLowerCase()}`)
        ).length;

    const totalPages = Math.ceil(
        filteredPermissions.length / itemsPerPage
    );

    const paginatedPermissions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPermissions.slice(start, start + itemsPerPage);
    }, [filteredPermissions, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const openCreateModal = () => {
        setEditingId(null);
        setViewPermission(null);
        setShowModal(true);
    };

    const openEditModal = (id) => {
        setEditingId(id);
        setViewPermission(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleSaved = async () => {
        closeModal();
        await loadPermissions();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Permission?",
            text: "This permission will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await PermissionService.delete(id);
            toast.success("Permission deleted successfully");
            await loadPermissions();
        } catch (error) {
            console.error("Delete permission error:", error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete permission"
            );
        }
    };

    if (loading) {
        return (
            <div className="permission-page">
                <div className="permission-loading">
                    <div className="spinner-border" role="status" />
                    <p>Loading permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="permission-page">
            <div className="permission-header-box">
                <div>
                    <span className="permission-eyebrow">
                        ACCESS CONTROL
                    </span>
                    <h2>Permission Management</h2>
                    <p>Manage and organize system permissions</p>
                </div>

                <button
                    type="button"
                    className="permission-add-btn"
                    onClick={openCreateModal}
                >
                    <span>＋</span> Add Permission
                </button>
            </div>

            <div className="permission-stats-grid">
                <div className="permission-stat-card total">
                    <div className="permission-stat-icon">♧</div>
                    <div>
                        <p>Total Permissions</p>
                        <h3>{permissions.length}</h3>
                        <span>Configured permissions</span>
                    </div>
                </div>

                <div className="permission-stat-card view">
                    <div className="permission-stat-icon">◉</div>
                    <div>
                        <p>View Permissions</p>
                        <h3>{countByAction("View")}</h3>
                        <span>Read access</span>
                    </div>
                </div>

                <div className="permission-stat-card create">
                    <div className="permission-stat-icon">＋</div>
                    <div>
                        <p>Create Permissions</p>
                        <h3>{countByAction("Create")}</h3>
                        <span>Create access</span>
                    </div>
                </div>

                <div className="permission-stat-card edit">
                    <div className="permission-stat-icon">✎</div>
                    <div>
                        <p>Edit Permissions</p>
                        <h3>{countByAction("Edit") + countByAction("Update")}</h3>
                        <span>Modify access</span>
                    </div>
                </div>
            </div>

            <div className="permission-card">
                <div className="permission-toolbar">
                    <div>
                        <h3>All Permissions</h3>
                        <p>View, search and manage permission records</p>
                    </div>

                    <div className="permission-toolbar-right">
                        <input
                            type="search"
                            className="permission-search-input"
                            placeholder="Search permissions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <span className="permission-total-pill">
                            Total: {filteredPermissions.length}
                        </span>

                        <button
                            type="button"
                            className="permission-refresh-btn"
                            onClick={loadPermissions}
                            title="Refresh permissions"
                        >
                            ↻
                        </button>
                    </div>
                </div>

                <div className="permission-table-wrapper">
                    <table className="permission-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Permission Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedPermissions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="permission-empty">
                                        No permissions found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedPermissions.map((permission) => {
                                    const id = getId(permission);
                                    const name = getName(permission);

                                    return (
                                        <tr key={id}>
                                            <td>
                                                <span className="permission-id">
                                                    #{id}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="permission-name">
                                                    {name}
                                                </span>
                                            </td>
                                            <td>
                                                {getDescription(permission) || "—"}
                                            </td>
                                            <td>
                                                <div className="permission-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-view"
                                                        onClick={() =>
                                                            setViewPermission(permission)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-edit"
                                                        onClick={() => openEditModal(id)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="permission-pagination">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {showModal && (
                <PermissionForm
                    permissionId={editingId}
                    onClose={closeModal}
                    onSaved={handleSaved}
                />
            )}

            {viewPermission && (
                <div
                    className="permission-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setViewPermission(null);
                        }
                    }}
                >
                    <div
                        className="permission-modal permission-view-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="permission-view-title"
                    >
                        <div className="permission-modal-header">
                            <div>
                                <span className="permission-eyebrow">
                                    PERMISSION DETAILS
                                </span>
                                <h3 id="permission-view-title">
                                    {getName(viewPermission)}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="permission-modal-close"
                                onClick={() => setViewPermission(null)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="permission-view-body">
                            <p><strong>ID:</strong> {getId(viewPermission)}</p>
                            <p>
                                <strong>Name:</strong> {getName(viewPermission)}
                            </p>
                            <p>
                                <strong>Description:</strong>{" "}
                                {getDescription(viewPermission) || "No description"}
                            </p>
                        </div>

                        <div className="permission-form-actions">
                            <button
                                type="button"
                                className="permission-cancel-btn"
                                onClick={() => setViewPermission(null)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="permission-save-btn"
                                onClick={() => openEditModal(getId(viewPermission))}
                            >
                                Edit Permission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PermissionList;
