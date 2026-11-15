import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../api/axios";

import "./User.css";

function UserDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ========================================
    // LOAD USER
    // ========================================

    useEffect(() => {

        const loadUser = async () => {

            try {

                setLoading(true);

                console.log("VIEW USER ID:", id);

                const response =
                    await api.get(`/User/${id}`);

                console.log(
                    "USER DETAILS RESPONSE:",
                    response.data
                );

                setUser(response.data);

            } catch (error) {

                console.error(
                    "GET USER DETAILS ERROR:",
                    error.response?.status,
                    error.response?.data || error.message
                );

                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.message ||
                        "Unable to load user details."
                });

                navigate("/users");

            } finally {

                setLoading(false);

            }

        };

        loadUser();

    }, [id, navigate]);


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (
            <div className="user-page">

                <div className="user-table-card">

                    <div className="user-loading">
                        Loading user details...
                    </div>

                </div>

            </div>
        );

    }


    // ========================================
    // NO USER
    // ========================================

    if (!user) {

        return (
            <div className="user-page">

                <div className="user-table-card">

                    <div className="user-no-data">
                        User not found.
                    </div>

                </div>

            </div>
        );

    }


    // ========================================
    // USER DETAILS
    // ========================================

    return (

        <div className="user-page">

            {/* HEADER */}

            <div className="user-list-header">

                <div>

                    <div className="user-breadcrumb">
                        Administration / Users / Details
                    </div>

                    <h1>
                        User Details
                    </h1>

                    <p>
                        View user account information.
                    </p>

                </div>

                <div className="user-details-actions">

                    <button
                        type="button"
                        className="user-back-btn"
                        onClick={() =>
                            navigate("/users")
                        }
                    >
                        ← Back
                    </button>

                    <button
                        type="button"
                        className="user-edit-btn"
                        onClick={() =>
                            navigate(`/users/edit/${user.id}`)
                        }
                    >
                        Edit User
                    </button>

                </div>

            </div>


            {/* DETAILS CARD */}

            <div className="user-details-card">

                <div className="user-details-grid">

                    {/* ID */}

                    <div className="user-detail-item">

                        <span className="user-detail-label">
                            User ID
                        </span>

                        <strong>
                            #{user.id}
                        </strong>

                    </div>


                    {/* NAME */}

                    <div className="user-detail-item">

                        <span className="user-detail-label">
                            Name
                        </span>

                        <strong>
                            {user.name || "N/A"}
                        </strong>

                    </div>


                    {/* EMAIL */}

                    <div className="user-detail-item">

                        <span className="user-detail-label">
                            Email
                        </span>

                        <strong>
                            {user.email || "N/A"}
                        </strong>

                    </div>


                    {/* STATUS */}

                    <div className="user-detail-item">

                        <span className="user-detail-label">
                            Status
                        </span>

                        <span
                            className={
                                user.isActive
                                    ? "user-status active"
                                    : "user-status inactive"
                            }
                        >

                            <span className="user-status-dot">
                            </span>

                            {user.isActive
                                ? "Active"
                                : "Inactive"
                            }

                        </span>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default UserDetails;