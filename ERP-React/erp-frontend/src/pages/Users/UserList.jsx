
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../api/axios";
import Pagination from "../../components/common/Pagination";
import "./User.css";

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get("/User");
            console.log("USERS RESPONSE:", response.data);

            // Support common API response formats
            const data = response.data;
            const userList = Array.isArray(data)
                ? data
                : Array.isArray(data?.$values)
                    ? data.$values
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.items)
                            ? data.items
                            : Array.isArray(data?.users)
                                ? data.users
                                : [];

            setUsers(userList);
            setCurrentPage(1);
        } catch (error) {
            console.error(
                "GET USERS ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            setUsers([]);

            await Swal.fire({
                icon: "error",
                title: "Unable to Load Users",
                text:
                    error.response?.data?.message ||
                    "Unable to load users. Please check the API."
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const totalUsers = users.length;
    const activeUsers = users.filter(
        user => (user.isActive ?? user.IsActive) === true
    ).length;
    const inactiveUsers = totalUsers - activeUsers;

    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentUsers = users.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handleView = (id) => {
        navigate(`/users/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/users/edit/${id}`);
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: "Delete User?",
            text: `"${name || "This user"}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/User/${id}`);

            await Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "User deleted successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            await loadUsers();
        } catch (error) {
            console.error(
                "DELETE USER ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            await Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Failed to delete user."
            });
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="user-page">
            {/* Page Header */}
            <div className="user-list-header">
                <div className="user-heading">
                    <div className="user-breadcrumb">
                        Administration / Users
                    </div>

                    <h1>User Management</h1>

                    <p>
                        Manage system users and their access.
                    </p>
                </div>

                <button
                    type="button"
                    className="user-add-btn"
                    onClick={() => navigate("/users/create")}
                >
                    <span>＋</span> Add User
                </button>
            </div>

            {/* User Statistics */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <div className="user-stat-icon total-icon">
                        <span>👥</span>
                    </div>
                    <div>
                        <p>Total Users</p>
                        <h2>{loading ? "..." : totalUsers}</h2>
                        <span>All registered users</span>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon active-icon">
                        <span>✓</span>
                    </div>
                    <div>
                        <p>Active Users</p>
                        <h2>{loading ? "..." : activeUsers}</h2>
                        <span>Currently active</span>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon inactive-icon">
                        <span>⊘</span>
                    </div>
                    <div>
                        <p>Inactive Users</p>
                        <h2>{loading ? "..." : inactiveUsers}</h2>
                        <span>Currently inactive</span>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="user-table-card">
                <div className="user-table-heading">
                    <div>
                        <h2>All Users</h2>
                        <p>
                            {loading
                                ? "Loading user records..."
                                : `Showing ${totalUsers === 0 ? 0 : startIndex + 1}–${Math.min(
                                    startIndex + itemsPerPage,
                                    totalUsers
                                )} of ${totalUsers} users`}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="user-refresh-btn"
                        onClick={loadUsers}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "↻ Refresh"}
                    </button>
                </div>

                {loading && users.length === 0 ? (
                    <div className="user-loading">
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="user-no-data">
                        No users found.
                    </div>
                ) : (
                    <>
                        <div className="user-table-wrapper">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentUsers.map((user, index) => {
                                        const id = user.id ?? user.Id;
                                        const name = user.name ?? user.Name;
                                        const email = user.email ?? user.Email;
                                        const isActive =
                                            user.isActive ?? user.IsActive;

                                        return (
                                            <tr key={id ?? index}>
                                                <td>#{id ?? "N/A"}</td>

                                                <td>
                                                    <strong>
                                                        {name || "N/A"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="user-email">
                                                        {email || "N/A"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`user-status ${
                                                            isActive
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        <span className="user-status-dot" />
                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="user-table-actions">
                                                        <button
                                                            type="button"
                                                            className="user-view-btn"
                                                            onClick={() => handleView(id)}
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="user-edit-btn"
                                                            onClick={() => handleEdit(id)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="user-delete-btn"
                                                            onClick={() => handleDelete(id, name)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default UserList;
