import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import Swal from "sweetalert2";

import {
    addUser,
    getUserById,
    updateUser
} from "../../services/userService";

import "./User.css";

function UserForm() {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = !!id;

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        isActive: true
    });

    // ========================================
    // LOAD USER
    // ========================================

   const loadUser = async () => {
    try {
        setLoading(true);

        const response = await getUserById(id);

        console.log("USER DETAILS RESPONSE:", response);

        const user = response?.data ?? response;

        if (!user) {
    await Swal.fire({
        icon: "error",
        title: "User Not Found",
        text: "Unable to find this user."
    });
    return;
}

        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            isActive: user.isActive ?? true
        });

    } catch (error) {
        await Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load user."
});
    } finally {
        setLoading(false);
    }
};
    // ========================================
    // INITIAL LOAD
    // ========================================

   useEffect(() => {
    if (isEdit) {
        loadUser();
    }
}, [isEdit, id]);

    // ========================================
    // HANDLE CHANGE
    // ========================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };

    // ========================================
    // SUBMIT
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.name.trim()) {

            await Swal.fire({
                icon: "warning",
                title: "Name Required",
                text: "Please enter user name."
            });

            return;
        }

        if (!formData.email.trim()) {

            await Swal.fire({
                icon: "warning",
                title: "Email Required",
                text: "Please enter email."
            });

            return;
        }

        try {

            setLoading(true);

            // ========================================
            // UPDATE
            // ========================================

            if (isEdit) {

                const updatedData = {
                    id: Number(id),
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    isActive: formData.isActive
                };

                await updateUser(id, updatedData);

                await Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "User updated successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });

            }

            // ========================================
            // CREATE
            // ========================================

            else {

                const newUser = {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    isActive: formData.isActive
                };

                await addUser(newUser);

                await Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "User added successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });

            }

            navigate("/users");

        } catch (error) {

            console.error(
                "USER SAVE ERROR:",
                error.response?.data || error
            );

            await Swal.fire({
                icon: "error",
                title: isEdit
                    ? "Update Failed"
                    : "Create Failed",
                text:
                    error.response?.data?.message ||
                    error.response?.data ||
                    "Something went wrong."
            });

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // UI
    // ========================================

    return (
        <div className="user-page">

            {/* HEADER */}

return (
    <div
        className="user-modal-overlay"
        onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) {
                navigate("/users");
            }
        }}
    >
        <div
            className="user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
        >
            <div className="user-modal-header">
                <div>
                    <div className="user-breadcrumb">
                        Administration / Users
                    </div>

                    <h2 id="user-modal-title">
                        {isEdit ? "Edit User" : "Add New User"}
                    </h2>

                    <p>
                        {isEdit
                            ? "Update user information."
                            : "Create a new system user."}
                    </p>
                </div>

                <button
                    type="button"
                    className="user-modal-close"
                    onClick={() => navigate("/users")}
                    disabled={loading}
                    aria-label="Close modal"
                >
                    ×
                </button>
            </div>

            <form className="user-form-card" onSubmit={handleSubmit}>
                <div className="user-form-group">
                    <label htmlFor="user-name">
                        Name <span>*</span>
                    </label>
                    <input
                        id="user-name"
                        type="text"
                        name="name"
                        placeholder="Enter user name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="user-form-group">
                    <label htmlFor="user-email">
                        Email <span>*</span>
                    </label>
                    <input
                        id="user-email"
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    />
                </div>

                {!isEdit && (
                    <div className="user-form-group">
                        <label htmlFor="user-password">
                            Password <span>*</span>
                        </label>
                        <input
                            id="user-password"
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                )}

                <div className="user-checkbox-wrapper">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <label htmlFor="isActive">Active User</label>
                </div>

                <div className="user-form-actions">
                    <button
                        type="button"
                        className="user-secondary-btn"
                        onClick={() => navigate("/users")}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="user-primary-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update User"
                                : "Create User"}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

            {/* FORM */}

            <form
                className="user-form-card"
                onSubmit={handleSubmit}
            >

                {/* NAME */}

                <div className="user-form-group">

                    <label>
                        Name
                        <span>*</span>
                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter user name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                    />

                </div>

                {/* EMAIL */}

                <div className="user-form-group">

                    <label>
                        Email
                        <span>*</span>
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                    />

                </div>

                {/* PASSWORD */}

                {!isEdit && (

                    <div className="user-form-group">

                        <label>
                            Password
                            <span>*</span>
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />

                    </div>

                )}

                {/* ACTIVE */}

                <div className="user-checkbox-wrapper">

                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <label htmlFor="isActive">
                        Active User
                    </label>

                </div>

                {/* ACTIONS */}

                <div className="user-form-actions">

                    <button
                        type="button"
                        className="user-secondary-btn"
                        onClick={() => navigate("/users")}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="user-primary-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update User"
                                : "Create User"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default UserForm;