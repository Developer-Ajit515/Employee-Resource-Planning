
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaBuilding,
    FaArrowLeft,
    FaEdit,
    FaUsers,
} from "react-icons/fa";

import DepartmentService from "../../services/DepartmentService";
import "./Department.css";

const DepartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDepartment();
    }, [id]);

    const loadDepartment = async () => {
        try {
            setLoading(true);

            const data =
                await DepartmentService.getDepartmentById(id);

            setDepartment(data?.data || data);
        } catch (err) {
            console.error("Department details error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load department details."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="department-page">
                <div className="department-loading">
                    Loading department details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="department-page">
                <div className="department-error">
                    {error}
                </div>

                <button
                    className="department-back-btn"
                    onClick={() => navigate("/departments")}
                >
                    <FaArrowLeft />
                    Back to Departments
                </button>
            </div>
        );
    }

    if (!department) {
        return (
            <div className="department-page">
                <div className="department-error">
                    Department not found.
                </div>
            </div>
        );
    }

    const employees = department.employees || [];

    return (
        <div className="department-page">

            {/* Header */}
            <div className="department-header">

                <div>
                    <h1>
                        <FaBuilding />
                        Department Details
                    </h1>

                    <p>
                        View department information and employees
                    </p>
                </div>

                <div className="details-header-actions">

                    <button
                        className="department-back-btn"
                        onClick={() =>
                            navigate("/departments")
                        }
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <button
                        className="department-edit-btn"
                        onClick={() =>
                            navigate(
                                `/departments/edit/${department.id}`
                            )
                        }
                    >
                        <FaEdit />
                        Edit
                    </button>

                </div>

            </div>

            {/* Department Card */}
            <div className="department-details-card">

                <div className="department-profile-icon">
                    <FaBuilding />
                </div>

                <div className="department-profile-content">

                    <h2>{department.name}</h2>

                    <span
                        className={
                            department.isActive
                                ? "status active"
                                : "status inactive"
                        }
                    >
                        {department.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>

                </div>

            </div>

            {/* Information */}
            <div className="department-info-card">

                <div className="details-title">
                    Department Information
                </div>

                <div className="details-grid">

                    <div className="detail-item">
                        <span>Department ID</span>
                        <strong>{department.id}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Department Name</span>
                        <strong>{department.name}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Status</span>
                        <strong>
                            {department.isActive
                                ? "Active"
                                : "Inactive"}
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Total Employees</span>
                        <strong>
                            {employees.length}
                        </strong>
                    </div>

                    <div className="detail-item full-width">
                        <span>Description</span>
                        <strong>
                            {department.description || "No description"}
                        </strong>
                    </div>

                </div>

            </div>

            {/* Employees */}
            <div className="department-info-card">

                <div className="details-title">
                    <FaUsers />
                    Employees in this Department
                </div>

                {employees.length > 0 ? (
                    <div className="employee-mini-table">

                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Designation</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee.employeeId}>

                                        <td>
                                            {employee.employeeId}
                                        </td>

                                        <td>
                                            {employee.firstName}{" "}
                                            {employee.lastName}
                                        </td>

                                        <td>
                                            {employee.email}
                                        </td>

                                        <td>
                                            {employee.designation}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    employee.status
                                                        ? "status active"
                                                        : "status inactive"
                                                }
                                            >
                                                {employee.status
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                ) : (
                    <div className="no-employees">
                        <FaUsers />
                        <p>No employees assigned to this department.</p>
                    </div>
                )}

            </div>

        </div>
    );
};

export default DepartmentDetails;

